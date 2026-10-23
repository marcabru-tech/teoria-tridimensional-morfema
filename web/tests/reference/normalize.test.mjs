// Testes de regressão do avaliador do conjunto de referência.
// Rodar a partir de web/: node --test tests/reference/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normRoot } from './normalize.mjs';

const here = dirname(fileURLToPath(import.meta.url));

test('sin e shin continuam distintos depois da normalização', () => {
  assert.notEqual(normRoot('שׂ-מ-ר'), normRoot('שׁ-מ-ר'));
});

test('shin com ponto e ש sem ponto são equivalentes (convenção da base)', () => {
  assert.equal(normRoot('שׁ-מ-ר'), normRoot('ש-מ-ר'));
});

test('sin com dagesh e vogal entre a letra e o ponto continua sin', () => {
  // ש + qamats (U+05B8) + dagesh (U+05BC) + ponto de sin (U+05C2)
  assert.equal(normRoot('שָּׂ'), normRoot('שׂ'));
});

test('vogais, cantilação e letras finais hebraicas são normalizadas', () => {
  assert.equal(normRoot('מֶ֫לֶךְ'), normRoot('מ-ל-כ'));
});

test('diacríticos árabes e hífens são removidos', () => {
  assert.equal(normRoot('كَتَبَ'), normRoot('ك-ت-ب'));
});

test('raiz vazia ou nula normaliza para string vazia', () => {
  assert.equal(normRoot(null), '');
  assert.equal(normRoot(''), '');
});

test('--report sem caminho termina com erro de uso, sem exceção', () => {
  const r = spawnSync(process.execPath, [join(here, 'evaluate.mjs'), 'http://localhost:1', '--report'], {
    encoding: 'utf-8',
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--report exige o caminho/);
  assert.doesNotMatch(r.stderr, /TypeError/);
});
