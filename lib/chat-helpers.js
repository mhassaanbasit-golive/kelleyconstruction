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

export function buildCompactKnowledgeBrief() {
  const c = KNOWLEDGE.company;
  const projectLines = KNOWLEDGE.projects
    .map((p) => `${p.name} (${p.location}, ${p.completed}): ${p.summary}`)
    .join('; ');

  return [
    `Company: ${c.name} (${c.shortName}), ${c.ownership}, ${c.experience}.`,
    `Website: ${c.domain}. Phones: ${c.phones.join(' or ')}. Email: ${c.email}. Address: ${c.address}.`,
    `Hours: ${c.hours}. ${c.estimates}; ${c.walkIns}.`,
    `Trust: BBB ${c.bbbRating} (accredited since ${c.bbbAccreditedSince}, ${c.bbbComplaintsLast3Years} complaints in last 3 years).`,
    `Warranty: ${c.warranty.workmanship}; ${c.warranty.equipment}.`,
    `Service Area: ${c.serviceArea.counties.join(', ')}; towns: ${c.serviceArea.towns.join(', ')}.`,
    `Services: ${KNOWLEDGE.services.join('; ')}.`,
    `Notable project: ${projectLines}.`,
    `Timelines/Pricing: Quoted per job after a free site visit based on size, land condition, and permits. Quotes require a quick look at the property.`,
  ].join('\n');
}

export function buildSystemInstruction(page, visitor) {
  const pageUrl = String(page?.url || '/').trim() || '/';
  const pageTitle = String(page?.title || 'WK Construction Inc.').trim() || 'WK Construction Inc.';
  const visitorFirstName = String(visitor?.name || '').trim().split(/\s+/)[0] || '';

  return [
    'You are an experienced, sharp-minded project coordinator at Wendell Kelley Construction, Inc. in Cleveland, TX.',
    'Talk like a real, thoughtful person in a natural conversation — never like a template, FAQ dump, or brochure.',
    'Rules:',
    '1. Keep replies crisp and direct: 1 to 2 short sentences (under 35 words). Never ramble, pad, or repeat yourself.',
    '2. Never repeat phone numbers, addresses, hours, counties, or facts already stated earlier in this chat.',
    '3. Answer the exact question directly first, then add at most one practical next question when helpful.',
    '4. Plain text only — no markdown, asterisks, or bullet lists.',
    '5. Only use the facts below. For pricing or quotes, ask project type, rough size, county, and whether the lot is cleared (share (281) 592-3792 only if not yet shared).',
    '6. If unsure or outside company facts, say so plainly and suggest calling (281) 592-3792.',
    '7. Never mention the lien, staff names, or the Bartlett family.',
    visitorFirstName ? `Visitor first name: ${visitorFirstName}` : '',
    `Current page: ${pageTitle} (${pageUrl})`,
    buildCompactKnowledgeBrief(),
  ]
    .filter(Boolean)
    .join('\n');
}
