import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanHeaderText(value, fallback = '') {
  const cleaned = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
  return cleaned || fallback;
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

function formatBoolOrText(val) {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  if (val === undefined || val === null || String(val).trim() === '') return 'Not answered';
  return String(val).trim();
}

function buildSurveyEmailHtml({ first, resolved, rating, comment, name, email, chicagoTime }) {
  const safeName = escapeHtml(name || 'Website visitor');
  const safeEmail = escapeHtml(email || 'Not provided');
  const safeFirst = escapeHtml(formatBoolOrText(first));
  const safeResolved = escapeHtml(formatBoolOrText(resolved));
  const safeRating = escapeHtml(rating !== undefined && rating !== null && rating !== '' ? String(rating) : 'Not rated');
  const safeComment = escapeHtml(comment || 'None').replace(/\n/g, '<br />');
  const safeTime = escapeHtml(chicagoTime);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WK Construction Inc. chat survey</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F1EE;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F1EE; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; background-color: #FFFFFF; border: 1px solid #E3E4E1; border-radius: 4px; overflow: hidden;">
          <tr>
            <td style="background-color: #0E1114; padding: 22px 28px; border-bottom: 3px solid #D9A62E;">
              <div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #D9A62E; margin-bottom: 6px;">
                WK Construction Inc. website survey
              </div>
              <div style="font-family: Arial, Helvetica, sans-serif; font-size: 20px; font-weight: 700; color: #FFFFFF; line-height: 1.25;">
                Visitor feedback (${safeRating})
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 28px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #0E1114;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9F9F7; border: 1px solid #E3E4E1; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 140px; padding: 3px 0; font-weight: 700; color: #3A4149;">Name:</td>
                        <td style="padding: 3px 0;">${safeName}</td>
                      </tr>
                      <tr>
                        <td style="width: 140px; padding: 3px 0; font-weight: 700; color: #3A4149;">Email:</td>
                        <td style="padding: 3px 0;">${safeEmail}</td>
                      </tr>
                      <tr>
                        <td style="width: 140px; padding: 3px 0; font-weight: 700; color: #3A4149;">First visit:</td>
                        <td style="padding: 3px 0;">${safeFirst}</td>
                      </tr>
                      <tr>
                        <td style="width: 140px; padding: 3px 0; font-weight: 700; color: #3A4149;">Resolved:</td>
                        <td style="padding: 3px 0;">${safeResolved}</td>
                      </tr>
                      <tr>
                        <td style="width: 140px; padding: 3px 0; font-weight: 700; color: #3A4149;">Rating:</td>
                        <td style="padding: 3px 0;">${safeRating}</td>
                      </tr>
                      <tr>
                        <td style="width: 140px; padding: 3px 0; font-weight: 700; color: #3A4149; vertical-align: top;">Comment:</td>
                        <td style="padding: 3px 0;">${safeComment}</td>
                      </tr>
                      <tr>
                        <td style="width: 140px; padding: 3px 0; font-weight: 700; color: #3A4149;">Time (CT):</td>
                        <td style="padding: 3px 0;">${safeTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
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
    return NextResponse.json({ ok: true });
  }

  const honeypot = String(body.company_website || body.honeypot || '').trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const first = body.first;
  const resolved = body.resolved;
  const rating = body.rating;
  const comment = String(body.comment ?? '').trim();
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();

  const resendKey = String(process.env.RESEND_API_KEY || '').trim();
  if (!resendKey) {
    console.warn('[WK survey] RESEND_API_KEY is not configured; skipping email send.');
    return NextResponse.json({ ok: true, emailSent: false });
  }

  const fromEmail = String(process.env.RESEND_FROM || '').trim() || 'WK Construction Inc. <onboarding@resend.dev>';
  const toEmail = String(process.env.NOTIFICATION_EMAIL || '').trim() || 'hassaanbasitali@gmail.com';
  const chicagoTime = formatChicagoTime(new Date());

  const html = buildSurveyEmailHtml({
    first,
    resolved,
    rating,
    comment,
    name,
    email,
    chicagoTime,
  });

  const safeSubjectName = cleanHeaderText(name, 'Website visitor');
  const payload = {
    from: fromEmail,
    to: [toEmail],
    subject: `Website chat survey from ${safeSubjectName}`,
    html,
  };

  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    payload.reply_to = cleanHeaderText(email);
  }

  let emailSent = false;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.warn('[WK survey] Resend API returned non-OK:', resp.status, errText);
    } else {
      emailSent = true;
    }
  } catch (err) {
    console.warn('[WK survey] Failed to send email via Resend:', err?.message || err);
  }

  return NextResponse.json({ ok: true, emailSent });
}
