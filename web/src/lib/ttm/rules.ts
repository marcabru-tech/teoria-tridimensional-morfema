// Convenções de análise do TTM (S2.2): normalização e listas de afixos.
//
// Este módulo não importa nada em tempo de execução, para que os testes
// (node --test) o carreguem direto, sem o bundler do Next.
//
// IMPORTANTE: o que está aqui são CONVENÇÕES OPERACIONAIS do TTM, não posições
// teóricas sobre o árabe ou o hebraico. A segmentação de afixos, o estatuto de
// prefixos verbais e a leitura de formas sem vogais são terreno de debate
// gramatical. O motor não decide esses debates: só declara qual convenção
// aplicou, e a resposta da API informa o caminho do casamento (MatchVia).
// Princípio do projeto (23/10/2026): questões em aberto ficam registradas como
// tais, sem escolher uma corrente em silêncio nem omitir as demais.

import type { AffixConfig, Orthography } from './matching';

// ---------------------------------------------------------------- árabe

export const ARABIC_DIACRITICS =
  /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g;

/** Remove harakat, tanwin, sukun, shadda, alif superscrito e sinais corânicos. */
export function normalizeArabic(text: string): string {
  return text.replace(ARABIC_DIACRITICS, '');
}

// Marcas de leitura corânica e tatweel: não distinguem formas. As vogais
// (harakat, tanwin, shadda, sukun) ficam, porque distinguem كَتَبَ de كُتُب.
const ARABIC_READING_MARKS = /[\u0610-\u061a\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0640]/g;

/** Forma vocalizada comparável (para escolher a glosa específica). */
export function arabicVocalKey(text: string): string {
  const k = text
    .normalize('NFC')
    .replace(/\u06e1/g, '\u0652') // sukun corânico -> sukun
    .replace(ARABIC_READING_MARKS, '')
    // Convenção: comparação na forma de pausa. A vogal/tanwin/sukun final é
    // desinência de caso ou de modo (i'rab), não distingue o lexema.
    .replace(/[\u064b-\u0650\u0652]+$/u, '');
  // Convenção: shadda na 1ª letra vem de assimilação (ال + letra solar),
  // não do lexema; é ignorada.
  return k.replace(/^(\P{M})((?:\p{M})*?)\u0651/u, '$1$2');
}

export const ARABIC_ORTHOGRAPHY: Orthography = {
  normalize: normalizeArabic,
  vocalKey: arabicVocalKey,
  consonantal: (s) => normalizeArabic(s).replace(/\u0640/g, ''),
};

/**
 * Convenção do TTM para o árabe. Os prefixos verbais (ي ت أ ن ا; e س de
 * futuro somado a prefixo de imperfeito: سي ست سن سأ)
 * entram por decisão explícita do Guilherme (23/10/2026), com parecer da
 * Luna: sem eles o acerto nas formas cobertas cai de 92,5% para 55%, sem
 * ganho em falsos positivos (já em zero). Nenhum afixo é retirado sem que o
 * restante bata com uma forma atestada na base.
 *
 * س (futuro) não é tratado como proclítico: ele só ocorre antes de verbo no
 * imperfeito, então entra combinado com o prefixo do imperfeito, como
 * prefixo verbal. Retirar س sozinho deixaria um radical sem o prefixo de
 * imperfeito, que a convenção não reconhece. Remover o س isolado não mudou
 * o benchmark (medido em 23/10/2026).
 */
export const ARABIC_AFFIXES: AffixConfig = {
  proclitics: ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك'],
  verbalPrefixes: ['سي', 'ست', 'سن', 'سأ', 'ي', 'ت', 'أ', 'ن', 'ا'],
  suffixesToRoot: ['وا', 'ون', 'ين', 'ات', 'نا', 'هم', 'هن', 'كم', 'كن', 'ها', 'ه', 'ك', 'ي', 'ن', 'ا', 'ت'],
  suffixesToExample: ['وا', 'ون', 'ين', 'ات', 'ة', 'ها', 'هم', 'هن', 'كم', 'كن', 'نا', 'تم', 'تن', 'تما', 'ه', 'ك', 'ي', 'ن', 'ا', 'ت'],
};

// -------------------------------------------------------------- hebraico

/** Todos os sinais hebraicos (cantilação, vogais, dagesh, pontos de shin/sin...). */
export const HEBREW_ALL_MARKS = /[֑-ׇ]/g;
/** Sinais hebraicos, exceto os pontos de shin (U+05C1) e sin (U+05C2). */
const HEBREW_MARKS_EXCEPT_SHIN_SIN = /[֑-׀׃-ׇ]/g;
const SHIN_DOT = 'ׁ';
const SIN_DOT = 'ׂ';
const FINALS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

/**
 * Normalização hebraica do motor. Segue a MESMA convenção do avaliador
 * (web/tests/reference/normalize.mjs), conferida por teste de paridade:
 *  - remove vogais, cantilação, dagesh e demais sinais;
 *  - preserva o sin: ש + ponto de sin vira "שׂ" (ש + U+05C2), letra distinta;
 *  - ש com ponto de shin, ou sem ponto, conta como shin (ש simples).
 *    Atenção: em texto sem vogais, ש é ambíguo entre shin e sin. Ler ש sem
 *    ponto como shin é convenção da base do TTM (שׁ-מ-ר), não um juízo sobre
 *    a forma; o caso fica registrado como ambiguidade, não resolvido;
 *  - converte as letras finais para a forma medial.
 */
export function normalizeHebrew(text: string): string {
  return text
    .replace(HEBREW_MARKS_EXCEPT_SHIN_SIN, '')
    .replace(new RegExp(`ש${SHIN_DOT}`, 'g'), 'ש')
    .replace(/[ׁׂ]/g, (m, offset: number, s: string) => (s[offset - 1] === 'ש' && m === SIN_DOT ? m : ''))
    .replace(/[ךםןףץ]/g, (c) => FINALS[c]);
}

/** Remove todos os sinais (para exibição da forma consonantal). */
export function stripNiqqud(text: string): string {
  return text.replace(HEBREW_ALL_MARKS, '');
}

// Cantilação, meteg, maqaf, paseq e sof pasuq: não distinguem formas.
// Vogais, dagesh e pontos de shin/sin ficam (distinguem מָלַךְ de מֶלֶךְ).
const HEBREW_READING_MARKS = /[\u0591-\u05af\u05bd\u05be\u05c0\u05c3\u05c6]/g;

/** Forma vocalizada comparável (para escolher a glosa específica). */
export function hebrewVocalKey(text: string): string {
  const k = text
    .normalize('NFC')
    .replace(HEBREW_READING_MARKS, '')
    .replace(/\u05ba/g, '\u05b9'); // holam haser para vav -> holam
  // Convenção: dagesh na 1ª letra depende do que vem antes (dagesh forte
  // depois do artigo ou do waw consecutivo; dagesh lene some depois de vogal),
  // não do lexema; é ignorado.
  return k.replace(/^(\P{M})((?:\p{M})*?)\u05bc/u, '$1$2');
}

export const HEBREW_ORTHOGRAPHY: Orthography = {
  normalize: normalizeHebrew,
  vocalKey: hebrewVocalKey,
  consonantal: stripNiqqud,
};

const HEBREW_AFFIXES_RAW: AffixConfig = {
  proclitics: ['וה', 'וב', 'ול', 'ומ', 'וכ', 'וש', 'ה', 'ו', 'ב', 'ל', 'מ', 'כ', 'ש'],
  // Convenção do TTM, mesma decisão do árabe: sem prefixos verbais o acerto
  // hebraico cai de 86,7% para 66,7%.
  verbalPrefixes: ['וי', 'י', 'ת', 'נ', 'א'],
  suffixesToRoot: ['ים', 'כם', 'הם', 'נו', 'ם', 'ו', 'ך', 'י'],
  suffixesToExample: ['תי', 'ות', 'ת', 'ה', 'י', 'ך', 'כם', 'הם', 'נו'],
};

// Os afixos passam pela mesma normalização da entrada (finais -> mediais);
// sem isso, sufixos como ים, ם e ך nunca casam com a forma normalizada.
const fold = (l: string[]) => l.map(normalizeHebrew);
export const HEBREW_AFFIXES: AffixConfig = {
  proclitics: fold(HEBREW_AFFIXES_RAW.proclitics),
  verbalPrefixes: fold(HEBREW_AFFIXES_RAW.verbalPrefixes),
  suffixesToRoot: fold(HEBREW_AFFIXES_RAW.suffixesToRoot),
  suffixesToExample: fold(HEBREW_AFFIXES_RAW.suffixesToExample),
};
