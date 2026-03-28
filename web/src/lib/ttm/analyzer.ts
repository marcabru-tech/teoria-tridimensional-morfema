import { AnalysisRequest, AnalysisResponse, MorphemeAnalysis } from './types';
import { analyzeArabic } from './arabic';
import { analyzeHebrew } from './hebrew';
import { analyzeGeneric } from './generic';

export function analyze(request: AnalysisRequest): AnalysisResponse {
  let morpheme: MorphemeAnalysis;
  
  switch (request.language) {
    case 'ar':
      morpheme = analyzeArabic(request.text);
      break;
    case 'he':
      morpheme = analyzeHebrew(request.text);
      break;
    default:
      morpheme = analyzeGeneric(request.text, request.language);
  }
  
  return {
    originalText: request.text,
    morpheme,
  };
}