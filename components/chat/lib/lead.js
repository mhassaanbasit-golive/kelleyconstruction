export function createLeadTracker() {
  let lastSentCount = 0;
  let lastSurveySig = '';
  let lastSignInSig = '';

  function shouldSend({
    reason,
    messages,
    visitor = null,
    rating = '',
    comment = '',
    companyWebsite = '',
  }) {
    if (String(companyWebsite || '').trim()) {
      return false;
    }

    if (reason === 'signin') {
      const hasIdentity = Boolean(
        String(visitor?.name || '').trim() ||
        String(visitor?.email || '').trim() ||
        String(visitor?.phone || '').trim()
      );
      if (!hasIdentity) return false;
      const signInSig = `${String(visitor?.name || '').trim()}|${String(visitor?.email || '').trim()}|${String(visitor?.phone || '').trim()}`;
      return signInSig !== lastSignInSig;
    }

    const list = Array.isArray(messages) ? messages : [];
    const hasUser = list.some((m) => m && m.role === 'user' && String(m.text || '').trim().length > 0);
    if (!hasUser) {
      return false;
    }

    const surveySig = `${String(rating || '').trim()}|${String(comment || '').trim()}`;
    const hasSurveyDetails = Boolean(String(rating || '').trim() || String(comment || '').trim());

    if (list.length === lastSentCount) {
      if (reason === 'close' && hasSurveyDetails && surveySig !== lastSurveySig) {
        return true;
      }
      return false;
    }

    return true;
  }

  function markSent({ reason = '', messages, visitor = null, rating = '', comment = '' }) {
    if (reason === 'signin') {
      lastSignInSig = `${String(visitor?.name || '').trim()}|${String(visitor?.email || '').trim()}|${String(visitor?.phone || '').trim()}`;
      return;
    }

    const list = Array.isArray(messages) ? messages : [];
    lastSentCount = list.length;
    const surveySig = `${String(rating || '').trim()}|${String(comment || '').trim()}`;
    if (surveySig !== '|') {
      lastSurveySig = surveySig;
    }
  }

  function reset() {
    lastSentCount = 0;
    lastSurveySig = '';
    lastSignInSig = '';
  }

  return { shouldSend, markSent, reset };
}

export function buildLeadPayload({
  sessionId,
  reason,
  visitor,
  startedAt,
  endedAt,
  pageUrl,
  rating = '',
  comment = '',
  messages = [],
  companyWebsite = '',
}) {
  return {
    sessionId: sessionId || '',
    reason: reason || 'chat',
    visitor: {
      name: visitor?.name || '',
      email: visitor?.email || '',
      phone: visitor?.phone || '',
    },
    startedAt: startedAt || new Date().toISOString(),
    endedAt: endedAt || new Date().toISOString(),
    pageUrl: pageUrl || '/',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    rating: rating || '',
    comment: comment || '',
    messages: (Array.isArray(messages) ? messages : []).map((m) => ({
      role: m.role === 'bot' ? 'bot' : 'user',
      text: String(m.text || ''),
      ts: m.ts || new Date().toISOString(),
    })),
    company_website: companyWebsite || '',
  };
}

export async function postLeadWithRetries(payload, maxRetries = 3) {
  const bodyStr = JSON.stringify(payload);
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const resp = await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true,
      });
      if (resp.ok) {
        try {
          const data = await resp.json();
          if (data && data.emailSent === false) {
            console.warn('[WK chat] Lead saved without email (RESEND_API_KEY missing or rejected).');
          }
        } catch {}
        return true;
      }
    } catch {}
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  return false;
}

export function sendLeadBeacon(payload) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
      return navigator.sendBeacon('/api/lead/', blob);
    }
  } catch (err) {
    console.warn('[WK chat] sendBeacon failed:', err);
  }
  try {
    fetch('/api/lead/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
  return false;
}
