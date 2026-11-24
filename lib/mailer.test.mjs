import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanHeaderText,
  isValidEmailAddress,
  resolveSmtpConfig,
  sendNotificationEmail,
} from './mailer.js';

test('resolveSmtpConfig defaults Hostinger SMTP for custom domain mailbox without hardcoding secrets', () => {
  assert.equal(resolveSmtpConfig({}), null);
  assert.equal(resolveSmtpConfig({ SMTP_USER: 'founder@getgolive.io' }), null);

  const cfg = resolveSmtpConfig({
    SMTP_USER: 'founder@getgolive.io',
    SMTP_PASS: 'test-pass-placeholder',
  });
  assert.equal(cfg.host, 'smtp.hostinger.com');
  assert.equal(cfg.port, 465);
  assert.equal(cfg.secure, true);
  assert.equal(cfg.from, 'WK Construction Inc. <founder@getgolive.io>');

  const gmailCfg = resolveSmtpConfig({
    SMTP_USER: 'alerts@gmail.com',
    SMTP_PASS: 'test-pass-placeholder',
    SMTP_PORT: '587',
  });
  assert.equal(gmailCfg.host, 'smtp.gmail.com');
  assert.equal(gmailCfg.port, 587);
  assert.equal(gmailCfg.secure, false);
});

test('cleanHeaderText strips CRLF injection and isValidEmailAddress validates format', () => {
  assert.equal(cleanHeaderText('Lead\r\nBcc: evil@attacker.com'), 'Lead Bcc: evil@attacker.com');
  assert.equal(isValidEmailAddress('visitor@example.com'), true);
  assert.equal(isValidEmailAddress('bad\n@example.com'), false);
});

test('sendNotificationEmail sends via SMTP transporter when SMTP_USER and SMTP_PASS are configured', async () => {
  const sent = [];
  const fakeTransporter = {
    async sendMail(msg) {
      sent.push(msg);
      return { messageId: 'ok' };
    },
  };

  const res = await sendNotificationEmail({
    subject: 'New website lead: Jane Doe (close)',
    html: '<p>Hello</p>',
    replyTo: 'jane@example.com',
    env: {
      SMTP_USER: 'founder@getgolive.io',
      SMTP_PASS: 'placeholder',
      NOTIFICATION_EMAIL: 'hassaanbasitali@gmail.com',
    },
    transporterOverride: fakeTransporter,
  });

  assert.deepEqual(res, { emailSent: true, provider: 'smtp' });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].from, 'WK Construction Inc. <founder@getgolive.io>');
  assert.equal(sent[0].to, 'hassaanbasitali@gmail.com');
  assert.equal(sent[0].replyTo, 'jane@example.com');
});
