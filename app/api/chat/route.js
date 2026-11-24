import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { KNOWLEDGE } from '../../../lib/knowledge.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 25;
const rateBuckets = new Map();

function checkRateLimit(req) {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  const now = Date.now();
  if (rateBuckets.size > 500) {
    for (const [k, entry] of rateBuckets.entries()) {
      if (now > entry.resetAt) rateBuckets.delete(k);
    }
  }
  const current = rateBuckets.get(ip);
  if (!current || now > current.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }
  current.count += 1;
  return true;
}

function getModelCascade() {
  const candidates = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
  ];
  const seen = new Set();
  const list = [];
  for (const raw of candidates) {
    const m = String(raw || '').trim();
    if (!m || seen.has(m)) continue;
    seen.add(m);
    list.push(m);
  }
  return list;
}

function normalizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];
  const recent = rawMessages.slice(-12);
  const mapped = [];

  for (const msg of recent) {
    if (!msg || typeof msg !== 'object') continue;
    const rawRole = String(msg.role || '').toLowerCase().trim();
    const role = rawRole === 'bot' || rawRole === 'assistant' || rawRole === 'model' ? 'model' : 'user';
    const text = String(msg.content ?? msg.text ?? '').trim();
    if (!text) continue;
    mapped.push({ role, text: text.slice(0, 4000) });
  }

  while (mapped.length > 0 && mapped[0].role !== 'user') {
    mapped.shift();
  }

  const merged = [];
  for (const item of mapped) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === item.role) {
      prev.text = `${prev.text}\n\n${item.text}`;
    } else {
      merged.push({ role: item.role, text: item.text });
    }
  }

  return merged.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));
}

function stripMarkdownToken(chunk) {
  return String(chunk || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/#{1,6}/g, '')
    .replace(/-{3,}/g, '')
    .replace(/\*/g, '');
}

function isRateLimitError(err) {
  if (!err) return false;
  const status = err.status ?? err.code ?? err?.error?.code;
  if (status === 429 || status === 'RESOURCE_EXHAUSTED') return true;
  const msg = String(err.message || err).toLowerCase();
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('rate limit') || msg.includes('quota');
}

function detectHotLead(normalizedContents) {
  const userText = normalizedContents
    .filter((c) => c.role === 'user')
    .map((c) => c.parts?.[0]?.text || '')
    .join(' ')
    .toLowerCase();

  if (!userText) return false;

  const sizeMatch =
    /\b\d+\s*[x×]\s*\d+\b/.test(userText) ||
    /\b\d[\d,]*\s*(?:sq\.?\s*ft|square\s*feet|square\s*foot|sqft|sf|acres?)\b/.test(userText) ||
    /\b\d+\s*(?:bay|stall|car)\b/.test(userText);

  const areaMatch =
    /\b(?:liberty|chambers|hardin|cleveland|plum grove|humble|dayton|crosby|shepherd|77328)\b/.test(userText) ||
    /\b[a-z]+\s+county\b/.test(userText);

  const budgetMatch =
    /\$\s*\d/.test(userText) ||
    /\b\d[\d,]*\s*(?:k|thousand|million)\b/.test(userText) ||
    /\bbudget\b/.test(userText);

  const intentMatch =
    /\b(?:quote|estimate|bid|site\s*visit|come\s*(?:out|look)|look\s+at\s+(?:the\s+)?(?:land|lot|job)|walk\s+the\s+land|call\s*(?:me|us|back)|callback|schedule|visit|appointment)\b/.test(
      userText
    );

  return sizeMatch || areaMatch || budgetMatch || intentMatch;
}

function getTopicSuggestions(normalizedContents, pageUrl = '/') {
  const userText = normalizedContents
    .filter((c) => c.role === 'user')
    .slice(-2)
    .map((c) => c.parts?.[0]?.text || '')
    .join(' ')
    .toLowerCase();
  const path = String(pageUrl || '/').toLowerCase();

  if (/\b(?:price|cost|quote|estimate|how much|budget)\b/.test(userText)) {
    return [
      'Request a free site visit',
      'What counties do you serve?',
      'Do you handle land clearing and slabs?',
    ];
  }
  if (/\b(?:metal|steel|shop|barn|warehouse|building)\b/.test(userText) || path.includes('metal-buildings')) {
    return [
      'Do you pour the slab for metal buildings?',
      'What info is needed for a quote?',
      'Where do you work?',
    ];
  }
  if (/\b(?:land|clear|grade|grading|level|slab|concrete|dirt)\b/.test(userText) || path.includes('site-prep')) {
    return [
      'Can you build after clearing the land?',
      'What counties do you cover?',
      'How do I get a written quote?',
    ];
  }
  if (/\b(?:log|home|house|renovat|remodel|commercial|build-out)\b/.test(userText) || path.includes('custom-construction')) {
    return [
      'What warranty comes with new work?',
      'Do you do commercial build-outs?',
      'How do I schedule a site visit?',
    ];
  }
  return [
    'Get a free quote',
    'Do you do land work and slabs?',
    'Where do you work?',
  ];
}

function buildSystemInstruction(page, visitor) {
  const pageUrl = String(page?.url || '/').trim() || '/';
  const pageTitle = String(page?.title || 'WK Construction Inc.').trim() || 'WK Construction Inc.';
  const visitorFirstName = String(visitor?.name || '').trim().split(/\s+/)[0] || '';

  return [
    'You are an experienced, sharp-minded project coordinator at Wendell Kelley Construction, Inc. in Cleveland, TX.',
    'Talk like a real, thoughtful person having a natural conversation — never like a template, FAQ dump, or brochure.',
    'Communication rules:',
    '1. Be as short and to the point as possible. Aim for 1 to 2 crisp sentences (under 35 words). Never ramble, pad, or repeat yourself.',
    '2. Never repeat phone numbers, addresses, hours, counties, or facts you already mentioned earlier in this conversation.',
    '3. Think intelligently about what the visitor is actually asking and connect the dots naturally instead of listing everything from the company reference.',
    '4. Answer the exact question first, then add at most one practical follow-up question or next step when it genuinely helps move the project forward.',
    '5. Plain text only — no markdown, no asterisks, no bullet lists. Write phone numbers and email as plain text.',
    '6. Never invent prices, timelines, square-foot rates, or services outside the facts below. If asked for pricing or a quote, briefly ask what they are building, rough size, county, and whether the land is cleared (and only share (281) 592-3792 if not already mentioned).',
    '7. If something is outside the company facts, say plainly that you are not sure and suggest calling (281) 592-3792.',
    '8. Never mention the lien, staff names, or the Bartlett family.',
    visitorFirstName ? `Visitor first name: ${visitorFirstName}` : '',
    `Current page: ${pageTitle} (${pageUrl})`,
    `Company reference:\n${JSON.stringify(KNOWLEDGE)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildFallbackAnswer() {
  return 'I hit a quick connection snag — please call (281) 592-3792 or (281) 593-5422, or email wendellkelley@gmail.com so our team can help right away.';
}

function makeSseHeaders() {
  return {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  };
}

function createSseStreamResponse({
  normalizedContents,
  pageUrl,
  hotLead,
  fallbackText = null,
  streamSource = null,
}) {
  const encoder = new TextEncoder();
  const action = { label: 'Call (281) 592-3792', href: 'tel:+12815923792' };
  const suggestions = getTopicSuggestions(normalizedContents, pageUrl);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event, data) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send('status', { text: 'Understanding your question' });
        send('status_done', {});
        send('status', { text: 'Checking Wendell Kelley Construction details' });
        send('status_done', {});

        if (fallbackText) {
          send('token', { text: stripMarkdownToken(fallbackText) });
        } else if (streamSource) {
          let linkCarry = '';
          let sentAny = false;

          const emitClean = (raw) => {
            const combined = linkCarry + raw;
            // Hold back a potential split markdown link "[text](url" at the tail of a chunk
            const openBracket = combined.lastIndexOf('[');
            let ready = combined;
            linkCarry = '';
            if (openBracket !== -1) {
              const tail = combined.slice(openBracket);
              if (!tail.includes(')') && !tail.includes('\n') && tail.length < 160) {
                ready = combined.slice(0, openBracket);
                linkCarry = tail;
              }
            }
            const cleaned = stripMarkdownToken(ready);
            if (cleaned) {
              sentAny = true;
              send('token', { text: cleaned });
            }
          };

          if (streamSource.firstText) {
            emitClean(streamSource.firstText);
          }

          try {
            for await (const chunk of streamSource.iterator) {
              const chunkText = chunk?.text;
              if (chunkText) {
                emitClean(chunkText);
              }
            }
          } catch (streamErr) {
            if (!sentAny) {
              console.warn('[WK chat] stream interrupted before output:', streamErr?.message || streamErr);
              send('token', { text: stripMarkdownToken(buildFallbackAnswer()) });
            }
            // If tokens were already sent, treat it as finished
          }

          if (linkCarry) {
            const flushed = stripMarkdownToken(linkCarry);
            if (flushed) send('token', { text: flushed });
          }
        }

        send('action', action);
        send('suggestions', suggestions);
        send('meta', { hotLead });
        send('done', {});
      } catch (err) {
        console.warn('[WK chat] SSE stream error:', err?.message || err);
        try {
          send('token', { text: stripMarkdownToken(buildFallbackAnswer()) });
          send('action', action);
          send('suggestions', suggestions);
          send('meta', { hotLead: false });
          send('done', {});
        } catch {}
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: makeSseHeaders(),
  });
}

export async function POST(req) {
  if (!checkRateLimit(req)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly or call (281) 592-3792.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let body;
  try {
    const raw = await req.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    body = {};
  }

  const page = body.page && typeof body.page === 'object' ? body.page : {};
  const visitor = body.visitor && typeof body.visitor === 'object' ? body.visitor : {};
  const honeypot = String(body.company_website || '').trim();
  const normalizedContents = normalizeMessages(body.messages);
  const hotLead = detectHotLead(normalizedContents);

  // Silent honeypot handling: return a normal-looking short stream and do nothing else
  if (honeypot) {
    return createSseStreamResponse({
      normalizedContents,
      pageUrl: page.url,
      hotLead: false,
      fallbackText:
        'Thanks for reaching out — call (281) 592-3792 or stop by 195 Bartlett Rd in Cleveland if you need a free estimate.',
    });
  }

  if (normalizedContents.length === 0) {
    return createSseStreamResponse({
      normalizedContents,
      pageUrl: page.url,
      hotLead: false,
      fallbackText: 'What are you looking to build or clear? Happy to help.',
    });
  }

  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return createSseStreamResponse({
      normalizedContents,
      pageUrl: page.url,
      hotLead,
      fallbackText: buildFallbackAnswer(),
    });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const models = getModelCascade();
  const systemInstruction = buildSystemInstruction(page, visitor);

  let selectedStream = null;
  let lastError = null;
  let sawRateLimit = false;

  for (const model of models) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: normalizedContents,
        config: {
          systemInstruction,
          temperature: 0.55,
        },
      });

      const iterator = responseStream[Symbol.asyncIterator]();
      let firstText = '';
      while (true) {
        const next = await iterator.next();
        if (next.done) break;
        const t = next.value?.text;
        if (t) {
          firstText = t;
          break;
        }
      }

      if (!firstText) {
        throw new Error(`Empty response from model ${model}`);
      }

      selectedStream = { firstText, iterator };
      break;
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err)) {
        sawRateLimit = true;
      }
      console.warn(`[WK chat] model ${model} failed before token:`, err?.message || err);
    }
  }

  if (selectedStream) {
    return createSseStreamResponse({
      normalizedContents,
      pageUrl: page.url,
      hotLead,
      streamSource: selectedStream,
    });
  }

  if (sawRateLimit) {
    return NextResponse.json(
      { error: 'The assistant is busy right now. Please try again in a moment or call (281) 592-3792.' },
      { status: 429, headers: { 'Retry-After': '30' } }
    );
  }

  if (lastError) {
    console.warn('[WK chat] all models failed, streaming fallback:', lastError?.message || lastError);
  }

  return createSseStreamResponse({
    normalizedContents,
    pageUrl: page.url,
    hotLead,
    fallbackText: buildFallbackAnswer(),
  });
}
