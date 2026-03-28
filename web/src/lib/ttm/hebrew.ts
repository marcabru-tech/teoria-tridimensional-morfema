import path from 'path';
import fs from 'fs';
import { MorphemeAnalysis, SemanticLevel, Width, Depth, Height } from './types';

const HEBREW_NIQQUD = /[\u0591-\u05c7]/g;

function stripNiqqud(text: string): string {
  return text.replace(HEBREW_NIQQUD, '');
}

function extractNiqqud(text: string): string[] {
  return text.match(HEBREW_NIQQUD) || [];
}

let rootsData: Record<string, any> | null = null;

function getRootsData() {
  if (!rootsData) {
    const dataPath = path.join(process.cwd(), '..', 'data', 'roots', 'hebrew_roots.json');
    if (fs.existsSync(dataPath)) {
      rootsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } else {
      rootsData = {};
    }
  }
  return rootsData;
}

export function analyzeHebrew(form: string): MorphemeAnalysis {
  const data = getRootsData() || {};
  const stripped = stripNiqqud(form);
  const niqqudFound = extractNiqqud(form);
  
  let matchedRoot = '';
  let rootInfo: any = null;
  
  for (const [root, info] of Object.entries(data)) {
    const rootChars = root.replace(/-/g, '');
    if (stripped === rootChars) {
      matchedRoot = root;
      rootInfo = info;
      break;
    }
    for (const exampleForm of Object.keys((info as any).examples || {})) {
      if (stripNiqqud(exampleForm) === stripped) {
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

  // Hebrew PaRDeS semantic levels
  const layers = [
    { level: SemanticLevel.LITERAL, levelName: 'Peshat (פשט)', meaning: description || `Literal meaning of ${form}`, tradition: 'Rabbinic' },
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
    language: 'he',
    gloss: examples[form] || description || '',
    coordinates: { x: width.derivationDegree, y: depth.currentLevel, z: height.configurationId },
    dimensions: { width, depth, height },
  };
}