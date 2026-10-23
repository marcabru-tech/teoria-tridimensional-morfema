// Contrato da API do motor (S2.2), conferido contra um servidor rodando.
//
// Uso (a partir de web/): TTM_BASE_URL=http://localhost:3000 node --test tests/ttm/api.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

const base = (process.env.TTM_BASE_URL || '').replace(/\/$/, '');
if (!base) throw new Error('Defina TTM_BASE_URL, ex.: http://localhost:3000');

async function analyze(text, language) {
  const res = await fetch(`${base}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
  assert.equal(res.status, 200, `HTTP ${res.status} para ${text}`);
  return (await res.json()).morpheme;
}

test('API: sufixo hebraico volta com a grafia de superfície (ים, não ימ)', async () => {
  const m = await analyze('מְלָכִים', 'he');
  assert.equal(m.root, 'מ-ל-ך');
  assert.deepEqual(m.dimensions.width.suffixes, ['ים']);
});

test('API: prefixos de superfície (hebraico e árabe)', async () => {
  assert.deepEqual((await analyze('וְהַמַּלְכָּה', 'he')).dimensions.width.prefixes, ['וה']);
  const a = await analyze('وَكَتَبُوا', 'ar');
  assert.deepEqual(a.dimensions.width.prefixes, ['و']);
  assert.deepEqual(a.dimensions.width.suffixes, ['وا']);
});

test('API: glosa específica da forma vocalizada', async () => {
  const v = await analyze('كَتَبَ', 'ar');
  assert.equal(v.gloss, 'he wrote');
  assert.equal(v.glossStatus, 'especifica');
  assert.equal(v.matchedForm, 'كَتَبَ');
  assert.equal((await analyze('كُتُب', 'ar')).gloss, 'books');
  assert.equal((await analyze('מָלַךְ', 'he')).gloss, 'he ruled');
  assert.equal((await analyze('מֶלֶךְ', 'he')).gloss, 'king');
});

test('API: forma ambígua sem vogais não recebe glosa específica', async () => {
  const m = await analyze('كتب', 'ar');
  assert.equal(m.root, 'ك-ت-ب');
  assert.equal(m.glossStatus, 'nao_determinada');
  assert.equal(m.matchedForm, null);
  assert.equal(m.formCandidates.length, 2);
});

test('API: forma flexionada não recebe a glosa da forma-base', async () => {
  const m = await analyze('وَكَتَبُوا', 'ar');
  assert.equal(m.glossStatus, 'nao_determinada');
  assert.notEqual(m.gloss, 'he wrote');
});

test('API: sin não vira shin; raiz não identificada é null', async () => {
  const m = await analyze('שָׂמַר', 'he');
  assert.equal(m.root, null);
  assert.equal(m.rootStatus, 'nao_identificada');
  assert.equal(m.glossStatus, null);
  assert.equal((await analyze('سماء', 'ar')).root, null);
});
