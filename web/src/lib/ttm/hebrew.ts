import hebrewRoots from '@/data/roots/hebrew_roots.json';
import { MorphemeAnalysis, SemanticLevel, Width, Depth, Height } from './types';
import { RootMatch, buildRootIndex, matchRoot } from './matching';
import { HEBREW_AFFIXES, HEBREW_ALL_MARKS, normalizeHebrew, stripNiqqud } from './rules';

function extractNiqqud(text: string): string[] {
  return text.match(HEBREW_ALL_MARKS) || [];
}

// A base é importada estaticamente para entrar no bundle da função serverless.
// Ler o arquivo em tempo de execução (fs + process.cwd()) falhava em silêncio
// quando data/ não acompanhava o deploy. Cópia sincronizada de data/roots/
// (ver scripts/check-data-sync.mjs).
const rootsData: Record<string, any> = hebrewRoots;

const rootIndex = buildRootIndex(rootsData, normalizeHebrew);

export function analyzeHebrew(form: string): MorphemeAnalysis {
  const stripped = stripNiqqud(form);
  const niqqudFound = extractNiqqud(form);
  const norm = normalizeHebrew(form);
  const match: RootMatch | null = matchRoot(norm, rootIndex, HEBREW_AFFIXES);
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

  // Hebrew PaRDeS semantic levels
  const layers = [
    { level: SemanticLevel.LITERAL, levelName: 'Peshat (פשט)', meaning: root ? (description || `Literal meaning of ${form}`) : 'raiz não identificada — sem significado lexical na base', tradition: 'Rabbinic' },
    { level: SemanticLevel.ALLUSIVE, levelName: 'Remez (רמז)', meaning: semanticField ? `Allegorical: ${semanticField}` : 'Allegorical meaning', tradition: 'Medieval' },
    { level: SemanticLevel.HOMILETIC, levelName: 'Derash (דרש)', meaning: 'Homiletical / midrashic dimension', tradition: 'Rabbinic' },
    { level: SemanticLevel.MYSTICAL, levelName: 'Sod (סוד)', meaning: 'Mystical / Kabbalistic dimension', tradition: 'Kabbalah' },
  ];

  const depth: Depth = {
    currentLevel: 1,
    semanticField,
    layers,
  };

  const height: Height = {
    baseForm: stripped,
    configurationId: niqqudFound.length,
    vowels: niqqudFound,
    diacritics: niqqudFound.map((d, i) => ({ symbol: d, name: `niqqud-${i + 1}`, position: 'below' })),
    alternativeVocalizations: derivations.slice(0, 3).map(d => d.form),
  };

  return {
    morpheme: form,
    root,
    rootStatus: match ? 'identificada' : 'nao_identificada',
    rootConfidence: match ? match.confidence : null,
    rootMessage: match ? `raiz identificada (casamento: ${match.via}; certeza: ${match.confidence})` : 'raiz não identificada',
    language: 'he',
    gloss: match?.gloss || description || '',
    coordinates: { x: width.derivationDegree, y: depth.currentLevel, z: height.configurationId },
    dimensions: { width, depth, height },
  };
}