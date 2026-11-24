import test from 'node:test';
import assert from 'node:assert/strict';
import { ThinkingLevel } from '@google/genai';
import {
  buildModelRequestConfig,
  buildSystemInstruction,
  getModelCascade,
} from './chat-helpers.js';

test('getModelCascade prioritizes low-latency active Gemini models without deprecated aliases', () => {
  const cascade = getModelCascade('');
  assert.deepEqual(cascade, ['gemini-3.1-flash-lite', 'gemini-4-hydrogen']);

  const withOverride = getModelCascade('gemini-4-hydrogen');
  assert.deepEqual(withOverride, ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']);
});

test('buildModelRequestConfig sets ThinkingLevel.LOW for gemini-4-hydrogen and omits deprecated temperature', () => {
  const liteCfg = buildModelRequestConfig('gemini-3.1-flash-lite', 'sys');
  assert.equal(liteCfg.systemInstruction, 'sys');
  assert.equal('temperature' in liteCfg, false);
  assert.equal(liteCfg.thinkingConfig, undefined);

  const hydroCfg = buildModelRequestConfig('gemini-4-hydrogen', 'sys');
  assert.equal(hydroCfg.systemInstruction, 'sys');
  assert.equal('temperature' in hydroCfg, false);
  assert.equal(hydroCfg.thinkingConfig?.thinkingLevel, ThinkingLevel.LOW);
});

test('buildSystemInstruction includes visitor first name, page context, and compact company brief', () => {
  const prompt = buildSystemInstruction(
    { url: '/metal-buildings/', title: 'Metal Buildings' },
    { name: 'Hassaan Ali' }
  );
  assert.ok(prompt.includes('Visitor first name: Hassaan'));
  assert.ok(prompt.includes('Metal Buildings (/metal-buildings/)'));
  assert.ok(prompt.includes('1 to 2 short sentences'));
  assert.ok(prompt.includes('(281) 592-3792'));
  assert.ok(prompt.includes('Liberty County'));
  assert.ok(prompt.includes('City of Cleveland Pavilion'));
  assert.ok(prompt.length < 2600);
});
