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
import { buildRootIndex, crossRootCollisions, resolveMatch } from '../../src/lib/ttm/matching.ts';
import {
  ARABIC_AFFIXES,
  ARABIC_ORTHOGRAPHY,
  HEBREW_AFFIXES,
  HEBREW_ORTHOGRAPHY,
  normalizeHebrew,
} from '../../src/lib/ttm/rules.ts';
import { normRoot } from '../reference/normalize.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, '..', '..');
const loadJson = (p) => JSON.parse(readFileSync(join(web, p), 'utf-8'));

const index = (file, o) => buildRootIndex(loadJson(file), o.normalize, o.vocalKey);
const arIndex = index('src/data/roots/arabic_roots.json', ARABIC_ORTHOGRAPHY);
const heIndex = index('src/data/roots/hebrew_roots.json', HEBREW_ORTHOGRAPHY);
// Mesmo caminho usado por analyzeArabic/analyzeHebrew (API).
const ar = (form) => resolveMatch(form, ARABIC_ORTHOGRAPHY, arIndex, ARABIC_AFFIXES);
const he = (form) => resolveMatch(form, HEBREW_ORTHOGRAPHY, heIndex, HEBREW_AFFIXES);

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
  assert.equal(m.surfacePrefix, 'ال');
  assert.equal(m.confidence, 'media');
});

test('camada 2: prefixo verbal + forma atestada (convenção do TTM)', () => {
  const m = he('יִשְׁמֹר');
  assert.equal(m.rootKey, 'שׁ-מ-ר');
  assert.equal(m.via, 'prefixo_verbal');
  assert.equal(m.surfacePrefix, 'י');
});

test('camada 3: sufixo + forma atestada', () => {
  const m = ar('كتبوا');
  assert.equal(m.rootKey, 'ك-ت-ب');
  assert.equal(m.via, 'sufixo');
  assert.equal(m.surfaceSuffix, 'وا');
});

test('camada 4: proclítico + sufixo', () => {
  const m = ar('وكتبوا');
  assert.equal(m.rootKey, 'ك-ت-ب');
  assert.equal(m.via, 'proclitico+sufixo');
  assert.equal(m.surfacePrefix, 'و');
  assert.equal(m.surfaceSuffix, 'وا');
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

test('letras finais: sufixo ים casa e volta com a grafia de superfície (ם final)', () => {
  const m = he('מְלָכִים');
  assert.equal(m.rootKey, 'מ-ל-ך');
  assert.equal(m.surfaceSuffix, 'ים');
  assert.notEqual(m.surfaceSuffix, 'ימ');
});

test('afixos de superfície: grafia da entrada, sem vogais, com letras finais', () => {
  const m = he('וְהַמַּלְכָּה');
  assert.equal(m.surfacePrefix, 'וה');
  const s = he('שֹׁמְרִים');
  assert.equal(s.surfaceSuffix, 'ים');
  const a = ar('وَكَتَبُوا');
  assert.equal(a.surfacePrefix, 'و');
  assert.equal(a.surfaceSuffix, 'وا');
});

test('letras finais: forma com ך final casa com o exemplo', () => {
  assert.equal(he('מֶלֶךְ').rootKey, 'מ-ל-ך');
  assert.equal(he('מֶלֶכְ').rootKey, 'מ-ל-ך');
});

// ------------------------------------------------- glosa da forma

test('glosa específica quando a vocalização identifica a forma (árabe)', () => {
  const v = ar('كَتَبَ');
  assert.equal(v.glossStatus, 'especifica');
  assert.equal(v.gloss, 'he wrote');
  assert.equal(v.matchedDisplay, 'كَتَبَ');
  const n = ar('كُتُب');
  assert.equal(n.glossStatus, 'especifica');
  assert.equal(n.gloss, 'books');
});

test('glosa específica quando a vocalização identifica a forma (hebraico)', () => {
  assert.equal(he('מָלַךְ').gloss, 'he ruled');
  assert.equal(he('מֶלֶךְ').gloss, 'king');
  assert.equal(he('מֶלֶךְ').glossStatus, 'especifica');
});

test('sem vogais a forma é ambígua: glosa não determinada, candidatos listados', () => {
  const a = ar('كتب');
  assert.equal(a.glossStatus, 'nao_determinada');
  assert.equal(a.gloss, 'Writing, recording, prescribing');
  assert.equal(a.matchedDisplay, null);
  assert.deepEqual(a.candidates.map((c) => c.display).sort(), ['كَتَبَ', 'كُتُب'].sort());
  const h = he('מלך');
  assert.equal(h.glossStatus, 'nao_determinada');
  assert.deepEqual(h.candidates.map((c) => c.gloss).sort(), ['he ruled', 'king']);
});

test('formas com a mesma grafia sem vogais não se sobrescrevem no índice', () => {
  const entry = arIndex.find((e) => e.rootKey === 'ك-ت-ب');
  assert.equal(entry.examples.get('كتب').length, 2);
});

test('proclítico preserva a glosa da forma (artigo, conjunção)', () => {
  const a = ar('الكِتَابِ');
  assert.equal(a.glossStatus, 'especifica');
  assert.equal(a.gloss, 'book');
  const h = he('הַמֶּלֶךְ');
  assert.equal(h.gloss, 'king');
  assert.equal(he('וְהַמַּלְכָּה').gloss, 'queen');
});

test('forma flexionada (sufixo ou prefixo verbal) não recebe a glosa de outra forma', () => {
  const a = ar('وَكَتَبُوا'); // "e eles escreveram" != "he wrote"
  assert.equal(a.glossStatus, 'nao_determinada');
  assert.notEqual(a.gloss, 'he wrote');
  assert.equal(ar('سَيَكْتُبُ').glossStatus, 'nao_determinada');
  assert.equal(he('מְלָכִים').glossStatus, 'nao_determinada');
});

test('vogais que não batem com nenhuma forma atestada: não determinada', () => {
  assert.equal(he('שֹׁמְרִים').glossStatus, 'nao_determinada');
});

test('nenhuma forma da base pertence a mais de uma raiz (senão a raiz seria ambígua)', () => {
  assert.deepEqual(crossRootCollisions(arIndex), []);
  assert.deepEqual(crossRootCollisions(heIndex), []);
});

// ------------------------------------------------- prefixo س (árabe)

test('س de futuro é prefixo verbal (com o prefixo do imperfeito), não proclítico', () => {
  const m = ar('سَيَكْتُبُ');
  assert.equal(m.via, 'prefixo_verbal');
  assert.equal(m.surfacePrefix, 'سي');
  assert.ok(!ARABIC_AFFIXES.proclitics.includes('س'));
  assert.equal(ar('سكتب'), null);
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
