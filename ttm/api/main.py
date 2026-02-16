"""
FastAPI application for the TTM project.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ttm import MorphemeAnalyzer, Language
from ttm.api.models import AnalysisRequest, AnalysisResponse, MorphemeResponse, MorphemeCoordinates

app = FastAPI(
    title="TTM API",
    description="API for the Three-Dimensional Theory of the Morpheme",
    version="0.2.0",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache analyzers to avoid re-initializing
_ANALYZERS = {}

def get_analyzer(lang_code: str):
    """Get or create an analyzer for the given language code."""
    if lang_code in _ANALYZERS:
        return _ANALYZERS[lang_code]
    
    try:
        # Simple mapping from code to Language enum
        lang_enum = None
        for L in Language:
            if L.value == lang_code:
                lang_enum = L
                break
        
        if not lang_enum:
             # Try improving lookup
             if lang_code == "pt": lang_enum = Language.PORTUGUESE
             elif lang_code == "en": lang_enum = Language.ENGLISH
             elif lang_code == "ar": lang_enum = Language.ARABIC
             elif lang_code == "he": lang_enum = Language.HEBREW
             elif lang_code == "ru": lang_enum = Language.RUSSIAN
             elif lang_code == "zh": lang_enum = Language.CHINESE_MANDARIN
             elif lang_code == "sa": lang_enum = Language.SANSKRIT

        if not lang_enum:
            raise ValueError(f"Unsupported language code: {lang_code}")

        analyzer = MorphemeAnalyzer(language=lang_enum)
        _ANALYZERS[lang_code] = analyzer
        return analyzer
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "TTM API is running", "version": "0.2.0"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest):
    """Analyze a single word or text."""
    try:
        analyzer = get_analyzer(request.language)
        
        # Determine if it's a full root analysis or simple parsing
        # For MVP, we use 'parse' which delegates to 'parse_morpheme'
        morpheme = analyzer.parse(request.text) 
        
        # Build response
        response = MorphemeResponse(
            form=morpheme.form,
            root=morpheme.root,
            language=morpheme.language,
            coordinates=MorphemeCoordinates(
                x=morpheme.x.position,
                y=morpheme.y.level,
                z=morpheme.z.configuration
            ),
            gloss=None, # Not explicitly in Morpheme class yet
            semantic_data={
                "width": {
                   "prefixes": morpheme.x.prefixes,
                   "suffixes": morpheme.x.suffixes
                },
                "height": {
                   "vocalization": morpheme.z.vowel_pattern
                }
            }
        )

        return AnalysisResponse(
            original_text=request.text,
            morphemes=[response]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def start():
    """Entry point for running the API with uvicorn."""
    import uvicorn
    uvicorn.run("ttm.api.main:app", host="0.0.0.0", port=8000, reload=True)
