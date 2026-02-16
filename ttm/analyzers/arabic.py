"""
Arabic morphological analyzer.

Implements root extraction, pattern matching, and derivation generation
for the Arabic trilateral root system.
"""

from __future__ import annotations

import json
import os
import re
import unicodedata
from typing import Dict, List, Optional

from ttm.analyzers.base import LanguageAnalyzer
from ttm.core.dimensions import Depth, Height, SemanticLevel, Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace

# Arabic diacritics Unicode range
ARABIC_DIACRITICS = re.compile(
    "[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]"
)

# Standard Arabic derivational patterns (awzān)
ARABIC_PATTERNS: Dict[str, Dict] = {
    "فَعَلَ": {
        "type": "verb",
        "form": "I",
        "template": "1a2a3a",
        "aspect": "perfective",
        "voice": "active",
        "description": "Form I perfective active",
    },
    "فَعِلَ": {
        "type": "verb",
        "form": "I",
        "template": "1a2i3a",
        "aspect": "perfective",
        "voice": "active",
        "description": "Form I perfective active (medial kasra)",
    },
    "فَاعِل": {
        "type": "noun",
        "form": "I",
        "template": "1aa2i3",
        "category": "active_participle",
        "description": "Active participle (Form I)",
    },
    "مَفْعُول": {
        "type": "noun",
        "form": "I",
        "template": "ma12uu3",
        "category": "passive_participle",
        "description": "Passive participle (Form I)",
    },
    "فِعَال": {
        "type": "noun",
        "form": "I",
        "template": "1i2aa3",
        "category": "verbal_noun",
        "description": "Verbal noun (Form I, pattern فِعَال)",
    },
    "فِعَالَة": {
        "type": "noun",
        "form": "I",
        "template": "1i2aa3a",
        "category": "verbal_noun",
        "description": "Verbal noun (Form I, pattern فِعَالَة)",
    },
    "فُعُول": {
        "type": "noun",
        "form": "I",
        "template": "1u2uu3",
        "category": "plural",
        "description": "Broken plural (pattern فُعُول)",
    },
    "كُتُب": {
        "type": "noun",
        "form": "I",
        "template": "1u2u3",
        "category": "plural",
        "description": "Broken plural (pattern فُعُل)",
    },
    "مَفْعَل": {
        "type": "noun",
        "form": "I",
        "template": "ma12a3",
        "category": "noun_of_place",
        "description": "Noun of place/time (Form I)",
    },
    "مَفْعَلَة": {
        "type": "noun",
        "form": "I",
        "template": "ma12a3a",
        "category": "noun_of_place",
        "description": "Noun of place (feminine, Form I)",
    },
}


def strip_diacritics(text: str) -> str:
    """Remove Arabic diacritical marks from text.

    Args:
        text: Arabic text with potential diacritics.

    Returns:
        Text with diacritics removed.
    """
    return ARABIC_DIACRITICS.sub("", text)


def extract_diacritics(text: str) -> List[str]:
    """Extract all diacritical marks from Arabic text.

    Args:
        text: Arabic text.

    Returns:
        List of diacritic characters found.
    """
    return ARABIC_DIACRITICS.findall(text)


class ArabicAnalyzer(LanguageAnalyzer):
    """Morphological analyzer for Arabic.

    Supports trilateral root extraction, pattern identification,
    and generation of derivations.
    """

    def __init__(self, data_path: Optional[str] = None):
        """Initialize the Arabic analyzer.

        Args:
            data_path: Optional path to arabic_roots.json data file.
        """
        self._roots_data: Dict = {}
        if data_path and os.path.exists(data_path):
            self._load_data(data_path)
        else:
            default_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "data",
                "roots",
                "arabic_roots.json",
            )
            if os.path.exists(default_path):
                self._load_data(default_path)

    def _load_data(self, path: str) -> None:
        """Load roots data from JSON file."""
        with open(path, "r", encoding="utf-8") as f:
            self._roots_data = json.load(f)

    def get_language_code(self) -> str:
        return "ar"

    def analyze_root(self, root: str) -> RootSpace:
        """Analyze an Arabic root and build a RootSpace with its derivations.

        Args:
            root: Trilateral root in format 'ف-ع-ل' or 'فعل'.

        Returns:
            RootSpace populated with known derivations.
        """
        normalized = root.replace("-", "").replace(" ", "")
        display_root = "-".join(normalized) if "-" not in root else root

        space = RootSpace(root=display_root, language="ar")

        root_info = self._roots_data.get(display_root, {})
        semantic_field = root_info.get("semantic_field", "")
        examples = root_info.get("examples", {})

        config_id = 0
        for form_text, gloss in examples.items():
            config_id += 1
            stripped = strip_diacritics(form_text)
            diacritics_found = extract_diacritics(form_text)

            width = Width(
                root=display_root,
                derivation_degree=0 if stripped == normalized else 1,
            )

            depth = Depth(semantic_field=semantic_field)
            depth.add_layer(level=SemanticLevel.LITERAL, meaning=gloss)

            height = Height(
                base_form=stripped,
                configuration_id=config_id,
                vowels=[d for d in diacritics_found],
            )

            morpheme = Morpheme(
                form=form_text,
                root=display_root,
                language="ar",
                gloss=gloss,
                x=width,
                y=depth,
                z=height,
            )
            space.add_morpheme(morpheme)

        return space

    def parse_morpheme(self, form: str) -> Morpheme:
        """Parse an Arabic word into a Morpheme.

        Args:
            form: Arabic word (vocalized or unvocalized).

        Returns:
            A Morpheme with basic dimensional analysis.
        """
        stripped = strip_diacritics(form)
        diacritics_found = extract_diacritics(form)

        width = Width(root=stripped)
        depth = Depth()
        height = Height(
            base_form=stripped,
            configuration_id=len(diacritics_found),
            vowels=diacritics_found,
        )

        return Morpheme(
            form=form,
            root=stripped,
            language="ar",
            x=width,
            y=depth,
            z=height,
        )

    def vocalize(self, form: str) -> List[str]:
        """Return known vocalizations for an unvocalized Arabic form.

        Args:
            form: Unvocalized Arabic form.

        Returns:
            List of known vocalized forms.
        """
        stripped = strip_diacritics(form)
        vocalizations = []
        for root_key, root_data in self._roots_data.items():
            for vocalized_form in root_data.get("examples", {}):
                if strip_diacritics(vocalized_form) == stripped:
                    vocalizations.append(vocalized_form)
        return vocalizations

    def get_root_info(self, root: str) -> Optional[Dict]:
        """Get stored data for a root.

        Args:
            root: Root in 'ف-ع-ل' format.

        Returns:
            Root data dictionary or None.
        """
        return self._roots_data.get(root)
