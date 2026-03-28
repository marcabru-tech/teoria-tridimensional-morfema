import { MorphemeAnalysis, SemanticLevel, Width, Depth, Height } from './types';

export function analyzeGeneric(form: string, language: string): MorphemeAnalysis {
  const words = form.trim().split(/\s+/);
  const root = words[0].toLowerCase();
  
  const width: Width = {
    root,
    prefixes: [],
    suffixes: [],
    pattern: '',
    derivationDegree: words.length - 1,
    possibleDerivations: [],
  };

  const layers = [
    { level: SemanticLevel.LITERAL, levelName: 'Literal', meaning: `Surface form: ${form}`, tradition: 'General' },
    { level: SemanticLevel.ALLUSIVE, levelName: 'Figurative', meaning: 'Figurative / metaphorical use', tradition: 'General' },
    { level: SemanticLevel.HOMILETIC, levelName: 'Homiletic', meaning: 'Homiletical / applied meaning', tradition: 'General' },
    { level: SemanticLevel.MYSTICAL, levelName: 'Symbolic', meaning: 'Symbolic / archetypal meaning', tradition: 'General' },
  ];

  const depth: Depth = {
    currentLevel: 1,
    semanticField: 'general',
    layers,
  };

  const vowels = form.match(/[aeiouáéíóúàèìòùâêîôûãõ]/gi) || [];
  
  const height: Height = {
    baseForm: root,
    configurationId: vowels.length,
    vowels,
    diacritics: [],
    alternativeVocalizations: [],
  };

  return {
    morpheme: form,
    root,
    language,
    gloss: '',
    coordinates: { x: width.derivationDegree, y: depth.currentLevel, z: height.configurationId },
    dimensions: { width, depth, height },
  };
}