import { safeSession } from './storage.js';

const SESSION_ID_KEY = 'chat_session_id';

export function getOrCreateSessionId() {
  const existing = safeSession.getItem(SESSION_ID_KEY);
  if (existing && existing.startsWith('wk_')) {
    return existing;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  const id = `wk_${ts}_${rand}`;
  safeSession.setItem(SESSION_ID_KEY, id);
  return id;
}

export function clearChatSessionStorage() {
  safeSession.removeItem('chat_session_id');
  safeSession.removeItem('chat_memory');
}

function isFakeMode() {
  try {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('smfake') === '1';
  } catch {
    return false;
  }
}

function sleepWithAbort(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function runFakeStream({ messages, onEvent, signal }) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.text || '';
  const lower = lastUser.toLowerCase();

  onEvent('status', { text: 'Understanding your question' });
  await sleepWithAbort(100, signal);
  onEvent('status_done', {});

  onEvent('status', { text: 'Checking Wendell Kelley Construction details' });
  await sleepWithAbort(120, signal);
  onEvent('status_done', {});

  let replyText =
    'We handle metal buildings, land clearing, slabs, and custom homes across Liberty, Chambers, and Hardin counties. What kind of project are you planning?';

  if (/\b(?:price|cost|quote|estimate|how much|budget)\b/.test(lower)) {
    replyText =
      'Give me the building type, rough square footage, county, and whether the lot is cleared so we can quote it accurately — or call (281) 592-3792 to set up a free site visit.';
  } else if (/\b(?:log|home|house|renovat)\b/.test(lower)) {
    replyText =
      'Yes, we build custom and log homes plus commercial build-outs, all backed by a 1-year workmanship warranty. Are you starting from raw land or an existing lot?';
  } else if (/\b(?:county|counties|area|where|cleveland|dayton|humble|crosby|shepherd|plum grove)\b/.test(lower)) {
    replyText =
      'We cover Liberty, Chambers, and Hardin counties, including Cleveland, Dayton, Humble, and nearby towns. Where is your property located?';
  }

  const words = replyText.split(/(?<=\s)/);
  for (const w of words) {
    await sleepWithAbort(20, signal);
    onEvent('token', { text: w });
  }

  const hotLead =
    /\b\d+\s*[x×]\s*\d+\b/.test(lower) ||
    /\b(?:quote|estimate|visit|budget|cleveland|liberty|chambers|hardin|dayton|humble|crosby|shepherd)\b/.test(lower);

  onEvent('action', { label: 'Call (281) 592-3792', href: 'tel:+12815923792' });
  onEvent('suggestions', [
    'Request a free site visit',
    'What counties do you serve?',
    'Do you handle land clearing and slabs?',
  ]);
  onEvent('meta', { hotLead });
  onEvent('done', {});
}

export function parseSseBlocks(rawBuffer, flush = false) {
  const normalized = String(rawBuffer || '').replace(/\r\n/g, '\n');
  const events = [];
  let cursor = 0;

  while (true) {
    const sepIndex = normalized.indexOf('\n\n', cursor);
    if (sepIndex === -1) break;
    const block = normalized.slice(cursor, sepIndex);
    cursor = sepIndex + 2;
    if (block.trim()) {
      const parsed = parseSingleSseBlock(block);
      if (parsed) events.push(parsed);
    }
  }

  let rest = normalized.slice(cursor);
  if (flush && rest.trim()) {
    const parsed = parseSingleSseBlock(rest);
    if (parsed) events.push(parsed);
    rest = '';
  }

  return { events, rest };
}

function parseSingleSseBlock(block) {
  let eventName = 'message';
  const dataLines = [];

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return null;
  const rawData = dataLines.join('\n');
  try {
    return { eventName, data: JSON.parse(rawData) };
  } catch {
    return { eventName, data: { text: rawData } };
  }
}

async function openChatStreamWithRetry(bodyJson, signal) {
  const maxAttempts = 2;
  let lastError = null;
  let lastResponse = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const connectController = new AbortController();
    const onExternalAbort = () => connectController.abort();
    signal?.addEventListener('abort', onExternalAbort, { once: true });

    const connectTimer = setTimeout(() => {
      connectController.abort();
    }, 12_000);

    try {
      const resp = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: bodyJson,
        signal: connectController.signal,
      });
      clearTimeout(connectTimer);
      signal?.removeEventListener('abort', onExternalAbort);

      if (resp.status === 429 || (resp.ok && resp.body)) {
        return resp;
      }

      lastResponse = resp;
      if (resp.status < 500 || attempt === maxAttempts) {
        return resp;
      }
    } catch (err) {
      clearTimeout(connectTimer);
      signal?.removeEventListener('abort', onExternalAbort);
      if (signal?.aborted) {
        throw err;
      }
      lastError = err;
      if (attempt === maxAttempts) {
        throw lastError;
      }
    }

    await sleepWithAbort(350, signal);
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error('Connection failed');
}

export async function streamChat({
  messages,
  page,
  visitor,
  companyWebsite = '',
  signal,
  onEvent,
}) {
  const recentMessages = (Array.isArray(messages) ? messages : [])
    .slice(-12)
    .map((m) => ({
      role: m.role === 'bot' ? 'bot' : 'user',
      text: String(m.text || ''),
    }));

  if (isFakeMode()) {
    await runFakeStream({ messages: recentMessages, onEvent, signal });
    return { ok: true };
  }

  const bodyJson = JSON.stringify({
    messages: recentMessages,
    page: {
      url: page?.url || '/',
      title: page?.title || 'WK Construction Inc.',
    },
    visitor: {
      name: visitor?.name || '',
      email: visitor?.email || '',
      phone: visitor?.phone || '',
    },
    company_website: companyWebsite || '',
  });

  const resp = await openChatStreamWithRetry(bodyJson, signal);

  if (resp.status === 429) {
    return {
      ok: false,
      busy: true,
      errorMessage: 'The assistant is busy. Please call (281) 592-3792.',
    };
  }

  if (!resp.ok || !resp.body) {
    return {
      ok: false,
      busy: false,
      errorMessage: 'Something went wrong connecting right now. Please call (281) 592-3792 or (281) 593-5422.',
    };
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let timedOut = false;
  let chunkTimer = null;

  const resetChunkTimer = () => {
    if (chunkTimer) clearTimeout(chunkTimer);
    chunkTimer = setTimeout(() => {
      timedOut = true;
      reader.cancel().catch(() => {});
    }, 16_000);
  };

  try {
    resetChunkTimer();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      resetChunkTimer();

      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSseBlocks(buffer, false);
      buffer = rest;
      for (const evt of events) {
        onEvent(evt.eventName, evt.data);
      }
    }

    buffer += decoder.decode();
    const { events: trailingEvents } = parseSseBlocks(buffer, true);
    for (const evt of trailingEvents) {
      onEvent(evt.eventName, evt.data);
    }

    if (timedOut) {
      return {
        ok: false,
        timedOut: true,
        errorMessage: 'Connection timed out. Please call (281) 592-3792 or (281) 593-5422.',
      };
    }

    return { ok: true };
  } finally {
    if (chunkTimer) clearTimeout(chunkTimer);
    try {
      reader.releaseLock();
    } catch {}
  }
}
