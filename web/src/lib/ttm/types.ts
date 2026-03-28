export enum SemanticLevel {
  LITERAL = 1,
  ALLUSIVE = 2,
  HOMILETIC = 3,
  MYSTICAL = 4,
}

export interface SemanticLayer {
  level: SemanticLevel;
  levelName: string;
  meaning: string;
  tradition?: string;
}

export interface Diacritic {
  symbol: string;
  name: string;
  position: string;
}

export interface Width {
  root: string;
  prefixes: string[];
  suffixes: string[];
  pattern: string;
  derivationDegree: number;
  possibleDerivations: { form: string; gloss: string }[];
}

export interface Depth {
  currentLevel: number;
  semanticField: string;
  layers: SemanticLayer[];
}

export interface Height {
  baseForm: string;
  configurationId: number;
  vowels: string[];
  diacritics: Diacritic[];
  alternativeVocalizations: string[];
}

export interface MorphemeCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface MorphemeAnalysis {
  morpheme: string;
  root: string;
  language: string;
  gloss: string;
  coordinates: MorphemeCoordinates;
  dimensions: {
    width: Width;
    depth: Depth;
    height: Height;
  };
}

export interface AnalysisRequest {
  text: string;
  language: string;
}

export interface AnalysisResponse {
  originalText: string;
  morpheme: MorphemeAnalysis;
}