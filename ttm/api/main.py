"""
FastAPI application for the TTM project.
"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ttm import MorphemeAnalyzer, Language
from ttm.api.models import AnalysisRequest, AnalysisResponse, MorphemeResponse, MorphemeCoordinates

app = FastAPI(
    title="TTM API",
    description="API for the Three-Dimensional Theory of the Morpheme",
    version="0.2.0",
)

# CORS setup — restrict origins via environment variable in production.
# Set TTM_ALLOWED_ORIGINS to a comma-separated list of allowed origins.
_raw_origins = os.environ.get("TTM_ALLOWED_ORIGINS", "")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache analyzers to avoid re-initializing
_ANALYZERS = {}

# Mapping of common ISO 639-1 codes to Language enum values
_LANG_CODE_MAP = {
    "pt": Language.PORTUGUESE,
    "en": Language.ENGLISH,
    "ar": Language.ARABIC,
    "he": Language.HEBREW,
    "ru": Language.RUSSIAN,
    "zh": Language.CHINESE,
    "sa": Language.SANSKRIT,
}


def get_analyzer(lang_code: str):
    """Get or create an analyzer for the given language code."""
    if lang_code in _ANALYZERS:
        return _ANALYZERS[lang_code]

    try:
        # Try direct enum value lookup first, then fall back to the alias map
        lang_enum = None
        for L in Language:
            if L.value == lang_code:
                lang_enum = L
                break

        if lang_enum is None:
            lang_enum = _LANG_CODE_MAP.get(lang_code)

        if lang_enum is None:
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

        morpheme = analyzer.parse_morpheme(request.text)

        # Build response
        response = MorphemeResponse(
            form=morpheme.form,
            root=morpheme.root,
            language=morpheme.language,
            coordinates=MorphemeCoordinates(
                x=morpheme.x.position,
                y=morpheme.y.level,
                z=morpheme.z.configuration,
            ),
            gloss=None,
            semantic_data={
                "width": {
                    "prefixes": morpheme.x.prefixes,
                    "suffixes": morpheme.x.suffixes,
                },
                "height": {
                    "vocalization": morpheme.z.vowel_pattern,
                },
            },
        )

        return AnalysisResponse(
            original_text=request.text,
            morphemes=[response],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def start():
    """Entry point for running the API with uvicorn."""
    import uvicorn

    uvicorn.run("ttm.api.main:app", host="0.0.0.0", port=8000, reload=True)
