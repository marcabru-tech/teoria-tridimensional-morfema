import path from 'path';
import fs from 'fs';
import { MorphemeAnalysis, SemanticLevel, Width, Depth, Height } from './types';

const ARABIC_DIACRITICS = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed]/g;

function stripDiacritics(text: string): string {
  return text.replace(ARABIC_DIACRITICS, '');
}

function extractDiacritics(text: string): string[] {
  return text.match(ARABIC_DIACRITICS) || [];
}

let rootsData: Record<string, any> | null = null;

function getRootsData() {
  if (!rootsData) {
    const dataPath = path.join(process.cwd(), '..', 'data', 'roots', 'arabic_roots.json');
    if (fs.existsSync(dataPath)) {
      rootsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } else {
      rootsData = {};
    }
  }
  return rootsData;
}

export function analyzeArabic(form: string): MorphemeAnalysis {
  const data = getRootsData() || {};
  const stripped = stripDiacritics(form);
  const diacriticsFound = extractDiacritics(form);
  
  // Try to find root in data
  let matchedRoot = '';
  let rootInfo: any = null;
  
  for (const [root, info] of Object.entries(data)) {
    const rootChars = root.replace(/-/g, '');
    if (stripped === rootChars || stripped.includes(rootChars) || rootChars.includes(stripped)) {
      matchedRoot = root;
      rootInfo = info;
      break;
    }
    // Check examples
    for (const exampleForm of Object.keys((info as any).examples || {})) {
      if (stripDiacritics(exampleForm) === stripped) {
        matchedRoot = root;
        rootInfo = info;
        break;
      }
    }
    if (rootInfo) break;
  }

  const root = matchedRoot || stripped.split('').join('-');
  const semanticField = rootInfo?.semantic_field || '';
  const description = rootInfo?.description || '';
  const examples = rootInfo?.examples || {};

  const derivations = Object.entries(examples).map(([f, g]) => ({ form: f, gloss: g as string }));

  const width: Width = {
    root,
    prefixes: [],
    suffixes: [],
    pattern: '',
    derivationDegree: matchedRoot ? 0 : 1,
    possibleDerivations: derivations,
  };

  // Build depth with semantic layers (Ẓāhir/Bāṭin tradition — four levels mirroring PaRDeS)
  const layers = [
    { level: SemanticLevel.LITERAL, levelName: 'Literal (Ẓāhir)', meaning: description || `Surface meaning of ${form}`, tradition: 'Islamic' },
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
    language: 'ar',
    gloss: examples[form] || description || '',
    coordinates: { x: width.derivationDegree, y: depth.currentLevel, z: height.configurationId },
    dimensions: { width, depth, height },
  };
}