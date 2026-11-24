import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLeadPayload, createLeadTracker } from './lead.js';

test('createLeadTracker triggers immediately on signin with visitor details and 0 messages', () => {
  const tracker = createLeadTracker();
  const visitor = { name: 'Jane Doe', email: 'jane@example.com', phone: '2815550199' };

  assert.equal(
    tracker.shouldSend({ reason: 'signin', messages: [], visitor }),
    true
  );

  tracker.markSent({ reason: 'signin', messages: [], visitor });

  // Same visitor details in the same session should not double-send signin
  assert.equal(
    tracker.shouldSend({ reason: 'signin', messages: [], visitor }),
    false
  );

  // Closing without any user messages should be skipped after signin
  assert.equal(
    tracker.shouldSend({ reason: 'close', messages: [{ role: 'bot', text: 'Hi' }], visitor }),
    false
  );

  // Once user sends a message, hot/close/leave transcript leads still send normally
  const messages = [
    { role: 'bot', text: 'Hi' },
    { role: 'user', text: 'Need a 40x60 shop' },
  ];
  assert.equal(
    tracker.shouldSend({ reason: 'hot', messages, visitor }),
    true
  );
  tracker.markSent({ reason: 'hot', messages, visitor });
  assert.equal(
    tracker.shouldSend({ reason: 'leave', messages, visitor }),
    false
  );

  // Survey close with new rating still sends
  assert.equal(
    tracker.shouldSend({ reason: 'close', messages, visitor, rating: 'Thumbs up' }),
    true
  );
});

test('createLeadTracker ignores signin with empty identity or filled honeypot', () => {
  const tracker = createLeadTracker();

  assert.equal(
    tracker.shouldSend({ reason: 'signin', messages: [], visitor: { name: '', email: '' } }),
    false
  );

  assert.equal(
    tracker.shouldSend({
      reason: 'signin',
      messages: [],
      visitor: { name: 'Bot', email: 'bot@example.com' },
      companyWebsite: 'https://spam.example',
    }),
    false
  );
});

test('buildLeadPayload preserves signin reason and visitor fields', () => {
  const payload = buildLeadPayload({
    sessionId: 'wk_test_1',
    reason: 'signin',
    visitor: { name: 'Alex', email: 'alex@example.com', phone: '' },
    pageUrl: '/contact/',
    messages: [],
  });

  assert.equal(payload.reason, 'signin');
  assert.equal(payload.visitor.name, 'Alex');
  assert.equal(payload.visitor.email, 'alex@example.com');
  assert.equal(payload.messages.length, 0);
});
