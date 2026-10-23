/**
 * Normalização de raízes para comparar a saída do motor com o conjunto de referência.
 *
 * - Remove hífens, diacríticos árabes e sinais hebraicos (vogais, cantilação, dagesh).
 * - Preserva a distinção entre sin e shin: שׂ (ponto à esquerda, U+05C2) vira o
 *   marcador "שׂ"; ש com ponto de shin (U+05C1) ou sem ponto conta como shin, que é a
 *   convenção da base do TTM (שׁ-מ-ר).
 * - Converte as letras finais hebraicas para a forma medial.
 */
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g;
// Sinais hebraicos, exceto os pontos de shin (U+05C1) e sin (U+05C2), tratados à parte.
const HEBREW_MARKS = /[֑-׀׃-ׇ]/g;
const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const SIN = 'שׂ';

export function normRoot(r) {
  if (!r) return '';
  return r
    .replace(/-/g, '')
    .replace(ARABIC_MARKS, '')
    .replace(HEBREW_MARKS, '')
    // ש seguido do ponto de sin (com outros sinais já removidos entre eles) => sin
    .replace(/שׂ/g, SIN)
    // ponto de shin explícito => ש simples (shin é o padrão)
    .replace(/שׁ/g, 'ש')
    // pontos soltos que sobrarem (fora de ש) não têm valor distintivo
    .replace(/[ׁׂ]/g, (m, offset, s) => (s[offset - 1] === 'ש' ? m : ''))
    .replace(/[ךםןףץ]/g, (c) => FINALS[c]);
}
