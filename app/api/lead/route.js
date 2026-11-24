import { NextResponse } from 'next/server';
import { cleanHeaderText, sendNotificationEmail } from '../../../lib/mailer.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const leadDedupe = new Map();

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatChicagoTime(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function sanitizeTelHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : 'tel:+12815923792';
}

function sanitizeMailtoHref(email, subjectText = '') {
  const addr = String(email || '').replace(/[\r\n\s<>"]/g, '').trim();
  if (!addr || !addr.includes('@')) return 'mailto:wendellkelley@gmail.com';
  const subj = subjectText ? `?subject=${encodeURIComponent(subjectText)}` : '';
  return `mailto:${addr}${subj}`;
}

function buildLeadEmailHtml({
  name,
  email,
  phone,
  trigger,
  rating,
  comment,
  pageUrl,
  pageTitle,
  chicagoTime,
  messages,
}) {
  const safeName = escapeHtml(name || 'Website visitor');
  const safeEmail = escapeHtml(email || 'Not provided');
  const safePhone = escapeHtml(phone || 'Not provided');
  const safeTrigger = escapeHtml(trigger || 'Website chat');
  const safeRating = escapeHtml(rating !== undefined && rating !== null && rating !== '' ? String(rating) : 'Not rated');
  const safeComment = escapeHtml(comment || 'None');
  const safeTime = escapeHtml(chicagoTime);
  const safePageUrl = escapeHtml(pageUrl || '');
  const safePageTitle = escapeHtml(pageTitle || '');

  const mailtoHref = escapeHtml(
    sanitizeMailtoHref(email, `Re: Your project inquiry with Wendell Kelley Construction`)
  );
  const telHref = escapeHtml(sanitizeTelHref(phone));

  const transcriptRows = messages
    .map((msg) => {
      const rawRole = String(msg?.role || '').toLowerCase().trim();
      const isAssistant = rawRole === 'bot' || rawRole === 'assistant' || rawRole === 'model';
      const label = isAssistant ? 'Assistant' : 'Visitor';
      const text = escapeHtml(String(msg?.content ?? msg?.text ?? '').trim()).replace(/\n/g, '<br />');
      if (!text) return '';

      if (isAssistant) {
        return `
          <tr>
            <td style="padding: 6px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F1EE; border-left: 4px solid #3A424B; border-radius: 4px;">
                <tr>
                  <td style="padding: 12px 14px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #0E1114;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #3A4149; margin-bottom: 4px;">${label}</div>
                    <div>${text}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }

      return `
        <tr>
          <td style="padding: 6px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FDF7E6; border-left: 4px solid #D9A62E; border-radius: 4px;">
              <tr>
                <td style="padding: 12px 14px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #0E1114;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #8A6510; margin-bottom: 4px;">${label}</div>
                  <div>${text}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .filter(Boolean)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WK Construction Inc. website lead</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F1EE;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F1EE; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; background-color: #FFFFFF; border: 1px solid #E3E4E1; border-radius: 4px; overflow: hidden;">
          <tr>
            <td style="background-color: #0E1114; padding: 24px 28px; border-bottom: 3px solid #D9A62E;">
              <div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #D9A62E; margin-bottom: 6px;">
                WK Construction Inc. website lead
              </div>
              <div style="font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.25;">
                ${safeName}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 28px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9F9F7; border: 1px solid #E3E4E1; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 18px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #0E1114;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149;">Name:</td>
                        <td style="padding: 3px 0; color: #0E1114;">${safeName}</td>
                      </tr>
                      <tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149;">Email:</td>
                        <td style="padding: 3px 0; color: #0E1114;">${
                          email ? `<a href="${mailtoHref}" style="color: #0E1114; text-decoration: underline;">${safeEmail}</a>` : safeEmail
                        }</td>
                      </tr>
                      <tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149;">Phone:</td>
                        <td style="padding: 3px 0; color: #0E1114;">${
                          phone ? `<a href="${telHref}" style="color: #0E1114; text-decoration: underline;">${safePhone}</a>` : safePhone
                        }</td>
                      </tr>
                      <tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149;">Time (CT):</td>
                        <td style="padding: 3px 0; color: #0E1114;">${safeTime}</td>
                      </tr>
                      <tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149;">Trigger:</td>
                        <td style="padding: 3px 0; color: #0E1114;">${safeTrigger}</td>
                      </tr>
                      <tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149;">Rating:</td>
                        <td style="padding: 3px 0; color: #0E1114;">${safeRating}</td>
                      </tr>
                      <tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149; vertical-align: top;">Comment:</td>
                        <td style="padding: 3px 0; color: #0E1114;">${safeComment}</td>
                      </tr>
                      ${
                        safePageUrl || safePageTitle
                          ? `<tr>
                        <td style="width: 120px; padding: 3px 0; font-weight: 700; color: #3A4149; vertical-align: top;">Page:</td>
                        <td style="padding: 3px 0; color: #3A4149;">${safePageTitle ? `${safePageTitle} ` : ''}${safePageUrl ? `(${safePageUrl})` : ''}</td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td style="padding-right: 12px;">
                    <a href="${mailtoHref}" style="display: inline-block; background-color: #D9A62E; color: #0E1114; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; text-decoration: none; padding: 12px 20px; border-radius: 4px;">
                      Reply by email
                    </a>
                  </td>
                  <td>
                    <a href="${telHref}" style="display: inline-block; background-color: #0E1114; color: #FFFFFF; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; text-decoration: none; padding: 12px 20px; border-radius: 4px;">
                      Call customer
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 12px 28px 28px;">
              <div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3A4149; margin-bottom: 10px; border-bottom: 1px solid #E3E4E1; padding-bottom: 8px;">
                Conversation Transcript
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${
                  transcriptRows ||
                  `<tr>
                    <td style="padding: 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #3A4149;">
                      Visitor signed in via the chatbot details form (no chat messages sent yet).
                    </td>
                  </tr>`
                }
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req) {
  let body;
  try {
    const raw = await req.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Reject silently if honeypot is filled
  const honeypot = String(body.company_website || body.honeypot || '').trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const visitor = body.visitor && typeof body.visitor === 'object' ? body.visitor : {};
  const name = String(body.name ?? visitor.name ?? '').trim();
  const email = String(body.email ?? visitor.email ?? '').trim();
  const phone = String(body.phone ?? visitor.phone ?? '').trim();
  const rawReason = String(body.trigger ?? body.reason ?? 'Chat inquiry').trim();
  const isSignIn = rawReason.toLowerCase() === 'signin';
  const trigger = isSignIn ? 'Chatbot sign-in' : rawReason;
  const rating = body.rating ?? '';
  const comment = String(body.comment ?? '').trim();
  const page = body.page && typeof body.page === 'object' ? body.page : {};
  const pageUrl = String(page.url ?? body.pageUrl ?? '').trim();
  const pageTitle = String(page.title ?? body.pageTitle ?? '').trim();

  const hasUserMessage = messages.some((m) => {
    if (!m || typeof m !== 'object') return false;
    const role = String(m.role || '').toLowerCase().trim();
    const isAssistant = role === 'bot' || role === 'assistant' || role === 'model';
    const text = String(m.content ?? m.text ?? '').trim();
    return !isAssistant && text.length > 0;
  });

  const hasVisitorIdentity = Boolean(name || email || phone);
  if (!hasUserMessage && !(isSignIn && hasVisitorIdentity)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Server-side dedupe
  const now = Date.now();
  if (leadDedupe.size > 200) {
    for (const [key, ts] of leadDedupe.entries()) {
      if (now - ts > 120_000) {
        leadDedupe.delete(key);
      }
    }
  }

  const lastMessage = messages[messages.length - 1];
  const lastText = String(lastMessage?.content ?? lastMessage?.text ?? '').trim().toLowerCase();
  const sessionKey = String(body.sessionId || '').trim() || 'nosess';
  const identityKey = String(email || phone || name || 'visitor').trim().toLowerCase();
  const dedupeKey = `${sessionKey}_${identityKey}_${rawReason.toLowerCase()}_${messages.length}_${lastText}`;
  const prevSeenAt = leadDedupe.get(dedupeKey);
  if (prevSeenAt && now - prevSeenAt < 45_000) {
    return NextResponse.json({ ok: true, deduped: true });
  }
  leadDedupe.set(dedupeKey, now);

  const subjectName = cleanHeaderText(name, 'Website visitor');
  const subjectReason = cleanHeaderText(trigger, 'Website inquiry');
  const chicagoTime = formatChicagoTime(new Date());

  const html = buildLeadEmailHtml({
    name,
    email,
    phone,
    trigger,
    rating,
    comment,
    pageUrl,
    pageTitle,
    chicagoTime,
    messages,
  });

  const subject = isSignIn
    ? `New chatbot sign-in lead: ${subjectName}`
    : `New website lead: ${subjectName} (${subjectReason})`;

  const { emailSent } = await sendNotificationEmail({
    subject,
    html,
    replyTo: email,
    logPrefix: '[WK lead]',
  });

  return NextResponse.json({ ok: true, emailSent });
}
