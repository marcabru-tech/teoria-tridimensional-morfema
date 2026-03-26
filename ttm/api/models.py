"""
Data models for the TTM API.
"""

from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    """Request model for morphological analysis."""

    text: str = Field(..., min_length=1, max_length=500)
    language: str  # e.g. "ar", "he", "pt", "en"
    context: Optional[str] = None


class MorphemeCoordinates(BaseModel):
    """3D coordinates of a morpheme."""

    x: int
    y: int
    z: int


class MorphemeResponse(BaseModel):
    """Response model for a single analyzed morpheme."""

    form: str
    root: str
    language: str
    coordinates: MorphemeCoordinates
    gloss: Optional[str] = None
    semantic_data: Dict[str, Any] = {}


class AnalysisResponse(BaseModel):
    """Response model for text analysis."""

    original_text: str
    morphemes: List[MorphemeResponse]
