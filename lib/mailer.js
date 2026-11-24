import nodemailer from 'nodemailer';

let cachedTransporter = null;
let cachedTransportKey = '';

export function cleanHeaderText(value, fallback = '') {
  const cleaned = String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
  return cleaned || fallback;
}

export function isValidEmailAddress(value) {
  const addr = cleanHeaderText(value);
  return Boolean(addr && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr));
}

export function resolveSmtpConfig(env = process.env) {
  const user = String(env.SMTP_USER || '').trim();
  const pass = String(env.SMTP_PASS || '');
  if (!user || !pass) {
    return null;
  }

  let host = String(env.SMTP_HOST || '').trim();
  if (!host) {
    const domain = user.split('@')[1]?.toLowerCase() || '';
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      host = 'smtp.gmail.com';
    } else {
      // Hostinger Mail is the default MX for getgolive.io and custom domains without explicit SMTP_HOST
      host = 'smtp.hostinger.com';
    }
  }

  const parsedPort = Number(env.SMTP_PORT || '');
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 465;
  const secure = port === 465;

  const explicitFrom = cleanHeaderText(env.SMTP_FROM || '');
  const from = explicitFrom || `WK Construction Inc. <${cleanHeaderText(user)}>`;

  return { host, port, secure, user, pass, from };
}

function getTransporter(cfg) {
  const key = `${cfg.host}:${cfg.port}:${cfg.secure}:${cfg.user}:${cfg.pass.length}`;
  if (cachedTransporter && cachedTransportKey === key) {
    return cachedTransporter;
  }
  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  cachedTransportKey = key;
  return cachedTransporter;
}

export async function sendNotificationEmail({
  subject,
  html,
  replyTo = '',
  logPrefix = '[WK mailer]',
  env = process.env,
  transporterOverride = null,
}) {
  const toEmail = cleanHeaderText(env.NOTIFICATION_EMAIL || '', 'hassaanbasitali@gmail.com');
  const safeSubject = cleanHeaderText(subject, 'New WK Construction Inc. notification');
  const safeReplyTo = isValidEmailAddress(replyTo) ? cleanHeaderText(replyTo) : undefined;

  const smtpCfg = resolveSmtpConfig(env);
  if (smtpCfg) {
    try {
      const transporter = transporterOverride || getTransporter(smtpCfg);
      await transporter.sendMail({
        from: smtpCfg.from,
        to: toEmail,
        subject: safeSubject,
        html,
        ...(safeReplyTo ? { replyTo: safeReplyTo } : {}),
      });
      return { emailSent: true, provider: 'smtp' };
    } catch (err) {
      console.warn(`${logPrefix} SMTP send failed:`, err?.message || err);
      return { emailSent: false, provider: 'smtp' };
    }
  }

  const resendKey = String(env.RESEND_API_KEY || '').trim();
  if (resendKey) {
    const fromEmail =
      cleanHeaderText(env.RESEND_FROM || '') || 'WK Construction Inc. <onboarding@resend.dev>';
    const payload = {
      from: fromEmail,
      to: [toEmail],
      subject: safeSubject,
      html,
      ...(safeReplyTo ? { reply_to: safeReplyTo } : {}),
    };

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
        console.warn(`${logPrefix} Resend API returned non-OK:`, resp.status, errText);
        return { emailSent: false, provider: 'resend' };
      }
      return { emailSent: true, provider: 'resend' };
    } catch (err) {
      console.warn(`${logPrefix} Failed to send email via Resend:`, err?.message || err);
      return { emailSent: false, provider: 'resend' };
    }
  }

  console.warn(
    `${logPrefix} Neither SMTP (SMTP_USER/SMTP_PASS) nor RESEND_API_KEY is configured; skipping email send.`
  );
  return { emailSent: false, provider: 'none' };
}
