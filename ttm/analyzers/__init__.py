"""Analyzers for language-specific morphological analysis."""

from ttm.analyzers.arabic import ArabicAnalyzer
from ttm.analyzers.base import LanguageAnalyzer
from ttm.analyzers.english import EnglishAnalyzer
from ttm.analyzers.hebrew import HebrewAnalyzer
from ttm.analyzers.indo_european import IndoEuropeanAnalyzer
from ttm.analyzers.mandarin import MandarinAnalyzer
from ttm.analyzers.portuguese import PortugueseAnalyzer
from ttm.analyzers.russian import RussianAnalyzer
from ttm.analyzers.sanskrit import SanskritAnalyzer

__all__ = [
    "LanguageAnalyzer",
    "ArabicAnalyzer",
    "HebrewAnalyzer",
    "IndoEuropeanAnalyzer",
    "PortugueseAnalyzer",
    "EnglishAnalyzer",
    "MandarinAnalyzer",
    "RussianAnalyzer",
    "SanskritAnalyzer",
]
