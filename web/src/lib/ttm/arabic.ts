import arabicRoots from '@/data/roots/arabic_roots.json';
import { MorphemeAnalysis, SemanticLevel, Width, Depth, Height } from './types';
import { AffixConfig, RootMatch, buildRootIndex, matchRoot } from './matching';

const ARABIC_DIACRITICS = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed]/g;

function stripDiacritics(text: string): string {
  return text.replace(ARABIC_DIACRITICS, '');
}

function extractDiacritics(text: string): string[] {
  return text.match(ARABIC_DIACRITICS) || [];
}

// A base é importada estaticamente para entrar no bundle da função serverless.
// Ler o arquivo em tempo de execução (fs + process.cwd()) falhava em silêncio
// quando data/ não acompanhava o deploy. Cópia sincronizada de data/roots/
// (ver scripts/check-data-sync.mjs).
const rootsData: Record<string, any> = arabicRoots;

const ARABIC_AFFIXES: AffixConfig = {
  proclitics: ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك', 'س'],
  verbalPrefixes: ['سي', 'ست', 'ي', 'ت', 'أ', 'ن', 'ا'],
  suffixesToRoot: ['وا', 'ون', 'ين', 'ات', 'نا', 'هم', 'هن', 'كم', 'كن', 'ها', 'ه', 'ك', 'ي', 'ن', 'ا', 'ت'],
  suffixesToExample: ['وا', 'ون', 'ين', 'ات', 'ة', 'ها', 'هم', 'هن', 'كم', 'كن', 'نا', 'تم', 'تن', 'تما', 'ه', 'ك', 'ي', 'ن', 'ا', 'ت'],
};

const rootIndex = buildRootIndex(rootsData, stripDiacritics);

export function analyzeArabic(form: string): MorphemeAnalysis {
  const stripped = stripDiacritics(form);
  const diacriticsFound = extractDiacritics(form);
  const match: RootMatch | null = matchRoot(stripped, rootIndex, ARABIC_AFFIXES);
  const root = match ? match.rootKey : null;
  const rootInfo = match?.info ?? null;
  const semanticField = rootInfo?.semantic_field || '';
  const description = rootInfo?.description || '';
  const examples = rootInfo?.examples || {};

  const derivations = Object.entries(examples).map(([f, g]) => ({ form: f, gloss: g as string }));

  const width: Width = {
    root,
    prefixes: match?.prefix ? [match.prefix] : [],
    suffixes: match?.suffix ? [match.suffix] : [],
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
    rootMessage: match ? `raiz identificada (casamento: ${match.via}; certeza: ${match.confidence})` : 'raiz não identificada',
    language: 'ar',
    gloss: match?.gloss || description || '',
    coordinates: { x: width.derivationDegree, y: depth.currentLevel, z: height.configurationId },
    dimensions: { width, depth, height },
  };
}