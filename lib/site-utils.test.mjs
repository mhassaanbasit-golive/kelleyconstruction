import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCloudinaryUrl,
  buildCloudinarySrcSet,
  validateLeadForm,
  buildMailtoHref,
  filterProjects,
  clampSliderPercent,
} from './site-utils.js';

test('buildCloudinaryUrl inserts f_auto,q_auto,w_width before version segment', () => {
  const raw = 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476898/hero-iamge.png';
  assert.equal(
    buildCloudinaryUrl(raw, 1440),
    'https://res.cloudinary.com/cyfb9slf/image/upload/f_auto,q_auto,w_1440/v1795476898/hero-iamge.png'
  );
  assert.equal(
    buildCloudinaryUrl(raw, 1200, { crop: 'fill', height: 630 }),
    'https://res.cloudinary.com/cyfb9slf/image/upload/f_auto,q_auto,c_fill,w_1200,h_630/v1795476898/hero-iamge.png'
  );
});

test('buildCloudinarySrcSet builds 640, 960, 1440, 2000 widths', () => {
  const raw = 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476898/hero-iamge.png';
  const srcset = buildCloudinarySrcSet(raw);
  assert.ok(srcset.includes('w_640/v1795476898/hero-iamge.png 640w'));
  assert.ok(srcset.includes('w_2000/v1795476898/hero-iamge.png 2000w'));
});

test('validateLeadForm catches missing name/phone and bad email', () => {
  const bad = validateLeadForm({ name: '', phone: '123', email: 'nope', requireEmail: true });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.name);
  assert.ok(bad.errors.phone);
  assert.ok(bad.errors.email);

  const ok = validateLeadForm({ name: 'John', phone: '281-592-3792', email: '', requireEmail: false });
  assert.equal(ok.valid, true);
});

test('buildMailtoHref includes recipient and encoded fields', () => {
  const href = buildMailtoHref('wendellkelley@gmail.com', {
    name: 'Sam',
    phone: '2815923792',
    message: 'Need a 40x60 shop',
  });
  assert.ok(href.startsWith('mailto:wendellkelley@gmail.com?subject='));
  assert.ok(href.includes('Need%20a%2040x60%20shop'));
});

test('filterProjects matches All and specific category', () => {
  const items = [
    { id: '1', category: 'Metal Buildings' },
    { id: '2', category: 'Site Work' },
  ];
  assert.equal(filterProjects(items, 'All').length, 2);
  assert.equal(filterProjects(items, 'Site Work').length, 1);
});

test('clampSliderPercent bounds values to 0..100', () => {
  assert.equal(clampSliderPercent(-10), 0);
  assert.equal(clampSliderPercent(120), 100);
  assert.equal(clampSliderPercent(55.44), 55.4);
  assert.equal(clampSliderPercent('bad'), 50);
});
