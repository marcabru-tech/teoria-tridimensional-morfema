#!/usr/bin/env node
/**
 * Testes do modo público (contenção de 23/10/2026): o site não pode oferecer a
 * análise de palavra isolada do motor heurístico antigo.
 *
 * Rode contra um servidor SEM TTM_ENABLE_HEURISTIC_ANALYSIS, ou contra um
 * preview ou a produção na Vercel:
 *   node tests/smoke/public-mode.js <BASE_URL>
 */
const baseUrl = (process.argv[2] || '').replace(/\/$/, '');
if (!baseUrl) {
  console.error('Uso: node tests/smoke/public-mode.js <BASE_URL>');
  process.exit(1);
}

let failed = 0;
async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
  } catch (err) {
    console.error(`  ❌  ${name}\n     ${err.message}`);
    failed++;
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};

(async () => {
  console.log(`\nModo público → ${baseUrl}\n`);

  await test('GET / mostra o aviso e não mostra o formulário de análise', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert(res.ok, `esperado 200, veio ${res.status}`);
    const html = await res.text();
    assert(html.includes('containment-notice'), 'aviso de contenção ausente');
    assert(!html.includes('Enter morpheme in'), 'formulário de análise presente');
    assert(!html.includes('3D Morpheme Space'), 'painel de resultados presente');
  });

  for (const [text, language] of [
    ['كتب', 'ar'],
    ['מלך', 'he'],
    ['write', 'en'],
  ]) {
    await test(`POST /api/analyze (${language}) responde 410 sem análise`, async () => {
      const res = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      assert(res.status === 410, `esperado 410, veio ${res.status}`);
      const json = await res.json();
      assert(!json.morpheme, 'a resposta trouxe análise');
      assert(typeof json.error === 'string' && json.error.length > 0, 'mensagem ausente');
    });
  }

  console.log(failed ? `\n${failed} falha(s)\n` : '\nTudo certo.\n');
  process.exit(failed ? 1 : 0);
})();
