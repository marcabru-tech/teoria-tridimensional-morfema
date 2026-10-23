import arabicRoots from '@/data/roots/arabic_roots.json';
import { MorphemeAnalysis, SemanticLevel, Width, Depth, Height } from './types';
import { ResolvedMatch, buildRootIndex, resolveMatch } from './matching';
import { ARABIC_AFFIXES, ARABIC_DIACRITICS, ARABIC_ORTHOGRAPHY, normalizeArabic } from './rules';

const stripDiacritics = normalizeArabic;

function extractDiacritics(text: string): string[] {
  return text.match(ARABIC_DIACRITICS) || [];
}

// A base é importada estaticamente para entrar no bundle da função serverless.
// Ler o arquivo em tempo de execução (fs + process.cwd()) falhava em silêncio
// quando data/ não acompanhava o deploy. Cópia sincronizada de data/roots/
// (ver scripts/check-data-sync.mjs).
const rootsData: Record<string, any> = arabicRoots;

const rootIndex = buildRootIndex(rootsData, ARABIC_ORTHOGRAPHY.normalize, ARABIC_ORTHOGRAPHY.vocalKey);

export function analyzeArabic(form: string): MorphemeAnalysis {
  const stripped = stripDiacritics(form);
  const diacriticsFound = extractDiacritics(form);
  const match: ResolvedMatch | null = resolveMatch(form, ARABIC_ORTHOGRAPHY, rootIndex, ARABIC_AFFIXES);
  const root = match ? match.rootKey : null;
  const rootInfo = match?.info ?? null;
  const semanticField = rootInfo?.semantic_field || '';
  const description = rootInfo?.description || '';
  const examples = rootInfo?.examples || {};

  const derivations = Object.entries(examples).map(([f, g]) => ({ form: f, gloss: g as string }));

  const width: Width = {
    root,
    prefixes: match?.surfacePrefix ? [match.surfacePrefix] : [],
    suffixes: match?.surfaceSuffix ? [match.surfaceSuffix] : [],
    pattern: '',
    derivationDegree: match ? (match.via === 'raiz' ? 0 : 1) : 1,
    possibleDerivations: derivations,
  };

  // Build depth with semantic layers (Ẓāhir/Bāṭin tradition — four levels mirroring PaRDeS)
  const layers = [
    { level: SemanticLevel.LITERAL, levelName: 'Literal (Ẓāhir)', meaning: root ? (description || `Surface meaning of ${form}`) : 'raiz não identificada — sem significado lexical na base', tradition: 'Islamic' },
    { level: SemanticLevel.ALLUSIVE, levelName: 'Allusive (Isharī)', meaning: semanticField ? `Field: ${semanticField}` : 'Allusive meaning', tradition: 'Sufi' },
    { level: SemanticLevel.HOMILETIC, levelName: 'Homiletic (Tafsīr)', meaning: 'Exegetical / commentarial dimension', tradition: 'Islamic' },
    { level: SemanticLevel.MYSTICAL, levelName: 'Mystical (Bāṭin)', meaning: 'Hidden / esoteric dimension', tradition: 'Sufi' },
  ];

  const depth: Depth = {
    currentLevel: 1,
    semanticField,
    layers,
  };

  const height: Height = {
    baseForm: stripped,
    configurationId: diacriticsFound.length,
    vowels: diacriticsFound,
    diacritics: diacriticsFound.map((d, i) => ({ symbol: d, name: `diacritic-${i + 1}`, position: 'above' })),
    alternativeVocalizations: derivations.slice(0, 3).map(d => d.form),
  };

  return {
    morpheme: form,
    root,
    rootStatus: match ? 'identificada' : 'nao_identificada',
    rootConfidence: match ? match.confidence : null,
    rootMessage: match
      ? `raiz identificada (casamento: ${match.via}; certeza: ${match.confidence}; glosa: ${match.glossStatus === 'especifica' ? 'específica da forma' : 'não determinada, descrição geral da raiz'})`
      : 'raiz não identificada',
    language: 'ar',
    gloss: match ? match.gloss : '',
    glossStatus: match ? match.glossStatus : null,
    matchedForm: match ? match.matchedDisplay : null,
    formCandidates: match ? match.candidates : [],
    coordinates: { x: width.derivationDegree, y: depth.currentLevel, z: height.configurationId },
    dimensions: { width, depth, height },
  };
}