import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSseBlocks } from './client.js';

test('parseSseBlocks parses fragmented CRLF SSE chunks and flushes trailing buffer on EOF', () => {
  const chunk1 = 'event: status\r\ndata: {"text":"Checking"}\r\n\r\nevent: token\r\ndata: {"text":"Hel';
  const step1 = parseSseBlocks(chunk1, false);
  assert.equal(step1.events.length, 1);
  assert.deepEqual(step1.events[0], { eventName: 'status', data: { text: 'Checking' } });

  const chunk2 = step1.rest + 'lo "}\n\nevent: token\ndata: {"text":"there."}\n\nevent: done\ndata: {}';
  const step2 = parseSseBlocks(chunk2, false);
  assert.equal(step2.events.length, 2);
  assert.deepEqual(step2.events[0], { eventName: 'token', data: { text: 'Hello ' } });
  assert.deepEqual(step2.events[1], { eventName: 'token', data: { text: 'there.' } });

  const step3 = parseSseBlocks(step2.rest, true);
  assert.equal(step3.events.length, 1);
  assert.deepEqual(step3.events[0], { eventName: 'done', data: {} });
  assert.equal(step3.rest, '');
});
