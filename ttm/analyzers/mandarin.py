"""
Mandarin Chinese morphological analyzer.

Implements tri-dimensional analysis for Sinitic languages (Isolating/Tonal).
"""

from __future__ import annotations

import re
from typing import List, Tuple

from ttm.analyzers.base import LanguageAnalyzer
from ttm.core.dimensions import Depth, Height, Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace

# Pinyin tone mapping
PINYIN_TONES = {
    'ā': 1, 'ē': 1, 'ī': 1, 'ō': 1, 'ū': 1, 'ǖ': 1,
    'á': 2, 'é': 2, 'í': 2, 'ó': 2, 'ú': 2, 'ǘ': 2,
    'ǎ': 3, 'ě': 3, 'ǐ': 3, 'ǒ': 3, 'ǔ': 3, 'ǚ': 3,
    'à': 4, 'è': 4, 'ì': 4, 'ò': 4, 'ù': 4, 'ǜ': 4,
}

class MandarinAnalyzer(LanguageAnalyzer):
    """Analyzer for Mandarin Chinese (Sinitic type)."""

    def get_language_code(self) -> str:
        return "zh"

    def analyze_root(self, root: str) -> RootSpace:
        """Analyze a character/radical.
        
        For Mandarin, 'root' could be interpreted as the radical or the character itself.
        """
        space = RootSpace(root=root, language="zh")
        m = self.parse_morpheme(root)
        space.add_morpheme(m)
        return space

    def parse_morpheme(self, form: str, pinyin: str = "") -> Morpheme:
        """Parse a Mandarin character/word.
        
        Args:
            form: The Chinese character(s) (e.g. "好").
            pinyin: Optional pinyin with tones (e.g. "hǎo").
        """
        # Width: Character composition (Radical not implemented in MVP)
        width = Width(root=form)
        
        # Height: Tone analysis from Pinyin
        tones = self._extract_tones(pinyin)
        height = Height(base_form=pinyin, configuration_id=tones[0] if tones else 5) # 5=Neutral
        
        # Depth: Contextual meaning (placeholder)
        depth = Depth()

        return Morpheme(
            form=form,
            root=form,
            language="zh",
            x=width,
            y=depth,
            z=height
        )

    def vocalize(self, form: str) -> List[str]:
        """Return pinyin for characters (requires external lib, MVP returns form)."""
        return [form]

    def _extract_tones(self, pinyin: str) -> List[int]:
        """Extract tones from pinyin string."""
        tones = []
        for char in pinyin:
            if char in PINYIN_TONES:
                tones.append(PINYIN_TONES[char])
        if not tones and pinyin: # If pinyin exists but no tone mark -> Neutral (5)
             tones.append(5)
        return tones
