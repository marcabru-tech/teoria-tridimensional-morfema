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
  root: string | null;
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
  root: string | null;
  rootStatus: 'identificada' | 'nao_identificada';
  rootConfidence: 'alta' | 'media' | null;
  rootMessage: string;
  language: string;
  /** Glosa específica da forma, ou descrição geral da raiz (ver glossStatus). */
  gloss: string;
  /**
   * 'especifica': a vocalização identificou a forma atestada.
   * 'nao_determinada': raiz identificada, forma não; ver formCandidates.
   * null: raiz não identificada.
   */
  glossStatus: 'especifica' | 'nao_determinada' | null;
  /** Forma atestada identificada pela vocalização, ou null. */
  matchedForm: string | null;
  /** Formas atestadas compatíveis com a grafia sem vogais. */
  formCandidates: { display: string; gloss: string }[];
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