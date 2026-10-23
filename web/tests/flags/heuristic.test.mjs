// Política de ativação do motor antigo (contenção). Uso: node --test tests/flags/heuristic.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { heuristicAnalysisEnabled as on } from '../../src/lib/flags/heuristic.ts';

const FLAG = { TTM_ENABLE_HEURISTIC_ANALYSIS: '1' };

test('ativa só com a flag no CI ou no desenvolvimento local', () => {
  assert.equal(on({ ...FLAG, CI: 'true', NODE_ENV: 'production' }), true);
  assert.equal(on({ ...FLAG, NODE_ENV: 'development' }), true);
});

test('sem a flag, nunca ativa', () => {
  assert.equal(on({ CI: 'true' }), false);
  assert.equal(on({ NODE_ENV: 'development' }), false);
  assert.equal(on({ ...FLAG, TTM_ENABLE_HEURISTIC_ANALYSIS: 'true', CI: 'true' }), false);
});

test('qualquer ambiente da Vercel bloqueia, mesmo com a flag', () => {
  for (const VERCEL_ENV of ['production', 'preview', 'development']) {
    assert.equal(on({ ...FLAG, CI: 'true', VERCEL_ENV }), false, VERCEL_ENV);
    assert.equal(on({ ...FLAG, NODE_ENV: 'development', VERCEL_ENV }), false, VERCEL_ENV);
  }
  assert.equal(on({ ...FLAG, CI: 'true', VERCEL: '1' }), false);
});

test('deploy sem variáveis de sistema expostas: flag sozinha não basta', () => {
  // Servidor de produção (next start) fora do CI, sem VERCEL/VERCEL_ENV.
  assert.equal(on({ ...FLAG, NODE_ENV: 'production' }), false);
  assert.equal(on({ ...FLAG }), false);
});
