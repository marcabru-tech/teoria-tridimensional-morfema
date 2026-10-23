// Testes do motor morfológico (S2.2), sem servidor: importam os módulos puros
// do motor (matching.ts e rules.ts) direto pelo Node (remoção de tipos nativa,
// Node >= 22.18) e a base de raízes do bundle.
//
// Uso (a partir de web/): node --test tests/ttm/engine.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRootIndex, matchRoot } from '../../src/lib/ttm/matching.ts';
import {
  ARABIC_AFFIXES,
  HEBREW_AFFIXES,
  normalizeArabic,
  normalizeHebrew,
} from '../../src/lib/ttm/rules.ts';
import { normRoot } from '../reference/normalize.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, '..', '..');
const loadJson = (p) => JSON.parse(readFileSync(join(web, p), 'utf-8'));

const arIndex = buildRootIndex(loadJson('src/data/roots/arabic_roots.json'), normalizeArabic);
const heIndex = buildRootIndex(loadJson('src/data/roots/hebrew_roots.json'), normalizeHebrew);
const ar = (form) => matchRoot(normalizeArabic(form), arIndex, ARABIC_AFFIXES);
const he = (form) => matchRoot(normalizeHebrew(form), heIndex, HEBREW_AFFIXES);

// ------------------------------------------------------------ camadas

test('camada 1: letras da raiz, certeza alta', () => {
  const m = ar('كتب');
  assert.equal(m.rootKey, 'ك-ت-ب');
  assert.equal(m.via, 'raiz');
  assert.equal(m.confidence, 'alta');
});

test('camada 1: forma de exemplo atestada, certeza alta', () => {
  const m = ar('مَكْتَبَة');
  assert.equal(m.rootKey, 'ك-ت-ب');
  assert.equal(m.via, 'exemplo');
  assert.equal(m.confidence, 'alta');
});

test('camada 2: proclítico + forma atestada', () => {
  const m = ar('الكتاب');
  assert.equal(m.rootKey, 'ك-ت-ب');
  assert.equal(m.via, 'proclitico');
  assert.equal(m.prefix, 'ال');
  assert.equal(m.confidence, 'media');
});

test('camada 2: prefixo verbal + forma atestada (convenção do TTM)', () => {
  const m = he('יִשְׁמֹר');
  assert.equal(m.rootKey, 'שׁ-מ-ר');
  assert.equal(m.via, 'prefixo_verbal');
  assert.equal(m.prefix, 'י');
});

test('camada 3: sufixo + forma atestada', () => {
  const m = ar('كتبوا');
  assert.equal(m.rootKey, 'ك-ت-ب');
  assert.equal(m.via, 'sufixo');
  assert.equal(m.suffix, 'وا');
});

test('camada 4: proclítico + sufixo', () => {
  const m = ar('وكتبوا');
  assert.equal(m.rootKey, 'ك-ت-ب');
  assert.equal(m.via, 'proclitico+sufixo');
  assert.equal(m.prefix, 'و');
  assert.equal(m.suffix, 'وا');
});

test('camada 4: prefixo verbal + sufixo', () => {
  const m = he('וַיִּשְׁמְרוּ');
  assert.equal(m.rootKey, 'שׁ-מ-ר');
  assert.equal(m.via, 'prefixo_verbal+sufixo');
});

test('raiz não identificada: sem evidência, devolve null (não inventa)', () => {
  assert.equal(ar('سماء'), null);
  assert.equal(he('אֶרֶץ'), null);
});

test('sem casamento por substring: letras da raiz dentro de palavra maior não bastam', () => {
  // Sequências sintéticas: a raiz aparece inteira, mas cercada de letras que
  // não são afixos da lista. O motor antigo devolvia a raiz; o S2.2 não.
  assert.equal(ar('زكتبر'), null);
  assert.equal(he('גמלכז'), null);
});

test('sufixos ת/ה/ة não reduzem à raiz nua (só a exemplo diferente da raiz)', () => {
  // מלכת: מלכ + ת. מלכ é a raiz nua, então não pode virar מ-ל-ך por este caminho.
  assert.equal(he('מלכת'), null);
});

// -------------------------------------------------------- sin e shin

test('shin com ponto, sem ponto e com vogais casam com שׁ-מ-ר', () => {
  assert.equal(he('שָׁמַר').rootKey, 'שׁ-מ-ר');
  assert.equal(he('שׁוֹמֵר').rootKey, 'שׁ-מ-ר');
  // Sem pontos, ש é lido como shin: convenção da base, registrada como tal.
  assert.equal(he('שמר').rootKey, 'שׁ-מ-ר');
});

test('sin não é confundido com shin (formas sintéticas de controle)', () => {
  // Formas construídas só para o teste: trocam o ponto de shin pelo de sin.
  assert.equal(he('שָׂמַר'), null);
  assert.equal(he('שׂוֹמֵר'), null);
  assert.equal(he('וַיִּשְׂמְרוּ'), null);
  assert.equal(he('הַשְּׂמִירָה'), null);
});

test('sin continua sin com vogal e dagesh entre a letra e o ponto', () => {
  // ש + qamats (U+05B8) + dagesh (U+05BC) + ponto de sin (U+05C2)
  assert.equal(normalizeHebrew('שָּׂמר'), 'שׂמר');
  assert.equal(he('שָּׂמר'), null);
});

// ----------------------------------------------------- letras finais

test('letras finais: sufixo ים casa depois da normalização', () => {
  const m = he('מְלָכִים');
  assert.equal(m.rootKey, 'מ-ל-ך');
  assert.equal(m.suffix, normalizeHebrew('ים'));
});

test('letras finais: forma com ך final casa com o exemplo', () => {
  assert.equal(he('מֶלֶךְ').rootKey, 'מ-ל-ך');
  assert.equal(he('מֶלֶכְ').rootKey, 'מ-ל-ך');
});

// --------------------------------------------- paridade com o avaliador

test('paridade: normalizeHebrew do motor = normRoot do avaliador', () => {
  const he = loadJson('tests/reference/he.json');
  const samples = new Set([
    'שָׁמַר', 'שָׂמַר', 'שמר', 'שׂ', 'שׁ', 'שָּׂמר',
    'מֶלֶךְ', 'אֲהֵבָתֶךְ', 'וַיַּ֣עַשׂ', 'עֲשׂוּ', 'יִשְׁמְר֥וּ',
  ]);
  for (const c of he.cases) {
    samples.add(c.input);
    if (c.expected.root) samples.add(c.expected.root.replace(/-/g, ''));
  }
  for (const s of samples) {
    assert.equal(normalizeHebrew(s), normRoot(s), `divergência em ${s}`);
  }
});

// ---------------------------------------- conjunto de referência (offline)

// Piso de regressão medido em 23/10/2026: o S2.2 não pode piorar.
const FLOOR = { ar: 37, he: 26 };

for (const [lang, file, fn] of [
  ['ar', 'tests/reference/ar.json', ar],
  ['he', 'tests/reference/he.json', he],
]) {
  test(`conjunto de referência ${lang}: 0 falsos positivos, 0 raízes inventadas, cobertas >= piso`, () => {
    const data = loadJson(file);
    let coveredOk = 0;
    const problems = [];
    for (const c of data.cases) {
      const m = fn(c.input);
      const got = m ? normRoot(m.rootKey) : '';
      if (c.category === 'coberta') {
        if (got === normRoot(c.expected.root)) coveredOk++;
      } else if (got) {
        problems.push(`${c.id} (${c.category}) ${c.input} -> ${m.rootKey}`);
      }
    }
    assert.deepEqual(problems, [], 'falsos positivos ou raízes inventadas');
    assert.ok(coveredOk >= FLOOR[lang], `${lang}: ${coveredOk} cobertas, piso ${FLOOR[lang]}`);
  });
}
