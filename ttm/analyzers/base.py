"""
Abstract base class for language-specific analyzers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace


class LanguageAnalyzer(ABC):
    """Abstract interface for language-specific morphological analysis.

    All language analyzers must implement these methods to integrate
    with the TTM framework.
    """

    @abstractmethod
    def analyze_root(self, root: str) -> RootSpace:
        """Analyze a root and return a space of its derivations.

        Args:
            root: The consonantal root (e.g. 'ك-ت-ب', 'מ-ל-כ').

        Returns:
            A RootSpace populated with derived morphemes.
        """

    @abstractmethod
    def parse_morpheme(self, form: str) -> Morpheme:
        """Parse a surface form into a Morpheme.

        Args:
            form: The surface form to parse.

        Returns:
            A Morpheme with populated dimensions.
        """

    @abstractmethod
    def vocalize(self, form: str) -> List[str]:
        """Generate possible vocalizations for an unvocalized form.

        Args:
            form: The unvocalized form.

        Returns:
            List of possible vocalized forms.
        """

    @abstractmethod
    def get_language_code(self) -> str:
        """Return the ISO 639 language code.

        Returns:
            Language code string.
        """
