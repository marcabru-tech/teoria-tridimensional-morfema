"""
Factory class for language-specific morphological analyzers.
"""

from __future__ import annotations

from typing import List

from ttm.analyzers.arabic import ArabicAnalyzer
from ttm.analyzers.base import LanguageAnalyzer
from ttm.analyzers.english import EnglishAnalyzer
from ttm.analyzers.hebrew import HebrewAnalyzer
from ttm.analyzers.mandarin import MandarinAnalyzer
from ttm.analyzers.portuguese import PortugueseAnalyzer
from ttm.analyzers.russian import RussianAnalyzer
from ttm.analyzers.sanskrit import SanskritAnalyzer
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace
from ttm.utils.language import Language

_LANGUAGE_ANALYZERS = {
    Language.ARABIC: ArabicAnalyzer,
    Language.HEBREW: HebrewAnalyzer,
    Language.PORTUGUESE: PortugueseAnalyzer,
    Language.ENGLISH: EnglishAnalyzer,
    Language.RUSSIAN: RussianAnalyzer,
    Language.CHINESE: MandarinAnalyzer,
    Language.SANSKRIT: SanskritAnalyzer,
}


class MorphemeAnalyzer:
    """Unified analyzer that delegates to a language-specific implementation.

    Args:
        language: The target :class:`Language` enum value.

    Raises:
        ValueError: If no analyzer is available for the given language.
    """

    def __init__(self, language: Language) -> None:
        analyzer_class = _LANGUAGE_ANALYZERS.get(language)
        if analyzer_class is None:
            raise ValueError(f"No analyzer available for language: {language}")
        self._analyzer: LanguageAnalyzer = analyzer_class()
        self.language = language

    def parse_morpheme(self, form: str) -> Morpheme:
        """Parse a surface form into a :class:`Morpheme`.

        Args:
            form: The surface form to parse.

        Returns:
            A :class:`Morpheme` with populated dimensions.
        """
        return self._analyzer.parse_morpheme(form)

    def analyze_root(self, root: str) -> RootSpace:
        """Analyze a root and return a :class:`RootSpace` of its derivations.

        Args:
            root: The consonantal root or stem.

        Returns:
            A :class:`RootSpace` populated with derived morphemes.
        """
        return self._analyzer.analyze_root(root)

    def vocalize(self, form: str) -> List[str]:
        """Generate possible vocalizations for an unvocalized form.

        Args:
            form: The unvocalized form.

        Returns:
            List of possible vocalized forms.
        """
        return self._analyzer.vocalize(form)

    def get_language_code(self) -> str:
        """Return the ISO 639 language code."""
        return self._analyzer.get_language_code()
