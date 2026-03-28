#!/usr/bin/env node
/**
 * Smoke tests for TTM Explorer — run these against any Vercel preview/production URL.
 *
 * Usage:
 *   node tests/smoke/smoke.js <BASE_URL>
 *
 * Examples:
 *   node tests/smoke/smoke.js https://ttm-explorer.vercel.app
 *   node tests/smoke/smoke.js https://<preview-url>.vercel.app
 *
 * Exit code 0 = all tests passed.
 * Exit code 1 = one or more tests failed.
 */

const BASE_URL = process.argv[2];

if (!BASE_URL) {
  console.error('Usage: node tests/smoke/smoke.js <BASE_URL>');
  process.exit(1);
}

const baseUrl = BASE_URL.replace(/\/$/, '');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log(`\nSmoke tests → ${baseUrl}\n`);

  // 1. Home page returns 200 and correct content-type
  await test('GET / returns 200', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert(res.ok, `Expected 200, got ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    assert(ct.includes('text/html'), `Expected text/html, got ${ct}`);
  });

  // 2. POST /api/analyze — Arabic
  await test('POST /api/analyze (Arabic ktb)', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'كتب', language: 'ar' }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.originalText === 'كتب', 'originalText mismatch');
    assert(json.morpheme && json.morpheme.root, 'Missing morpheme.root');
    assert(
      typeof json.morpheme.coordinates === 'object',
      'Missing morpheme.coordinates',
    );
  });

  // 3. POST /api/analyze — Hebrew
  await test('POST /api/analyze (Hebrew mlk)', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'מלך', language: 'he' }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.originalText === 'מלך', 'originalText mismatch');
    assert(json.morpheme && json.morpheme.root, 'Missing morpheme.root');
  });

  // 4. POST /api/analyze — Generic (English)
  await test('POST /api/analyze (English)', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'write', language: 'en' }),
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.originalText === 'write', 'originalText mismatch');
  });

  // 5. Missing body returns 400
  await test('POST /api/analyze with empty text returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '', language: 'ar' }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // 6. Missing language returns 400
  await test('POST /api/analyze with missing language returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'كتب' }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // 7. Static asset cache headers
  await test('/_next/static/ assets have immutable Cache-Control', async () => {
    // Fetch the home page first to discover a static asset URL
    const html = await fetch(`${baseUrl}/`).then((r) => r.text());
    const match = html.match(/\/_next\/static\/[^"']+\.js/);
    if (!match) {
      // No static asset found in HTML (can happen with server-only builds)
      console.log('     ⚠️  No static JS asset found in HTML, skipping.');
      return;
    }
    const assetUrl = `${baseUrl}${match[0]}`;
    const res = await fetch(assetUrl);
    assert(res.ok, `Asset ${assetUrl} returned ${res.status}`);
    const cc = res.headers.get('cache-control') || '';
    assert(
      cc.includes('immutable') || cc.includes('max-age=31536000'),
      `Expected immutable Cache-Control, got "${cc}"`,
    );
  });

  // Summary
  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
