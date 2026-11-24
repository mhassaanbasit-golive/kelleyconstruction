import { ThinkingLevel } from '@google/genai';
import { KNOWLEDGE } from './knowledge.js';

export function getModelCascade(envModel = process.env.GEMINI_MODEL) {
  const candidates = [
    envModel,
    'gemini-3.1-flash-lite',
    'gemini-4-hydrogen',
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

export function buildModelRequestConfig(model, systemInstruction) {
  const config = { systemInstruction };
  const name = String(model || '').toLowerCase();

  if (name === 'gemini-4-hydrogen' || name === 'gemini-4-neon') {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
  }

  return config;
}

export function buildSystemInstruction(page, visitor) {
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
