"""
Hebrew morphological analyzer.

Implements root extraction and deviation generation for the Hebrew root system.
"""

from __future__ import annotations

import json
import os
import re
from typing import Dict, List, Optional

from ttm.analyzers.base import LanguageAnalyzer
from ttm.core.dimensions import Depth, Height, SemanticLevel, Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace

# Hebrew niqqud (points) Unicode range
HEBREW_NIQQUD = re.compile("[\u0591-\u05C7]")


def strip_niqqud(text: str) -> str:
    """Remove Hebrew niqqud marks from text."""
    return HEBREW_NIQQUD.sub("", text)


def extract_niqqud(text: str) -> List[str]:
    """Extract all niqqud marks from Hebrew text."""
    return HEBREW_NIQQUD.findall(text)


class HebrewAnalyzer(LanguageAnalyzer):
    """Morphological analyzer for Hebrew."""

    def __init__(self, data_path: Optional[str] = None):
        """Initialize the Hebrew analyzer.

        Args:
            data_path: Optional path to hebrew_roots.json data file.
        """
        self._roots_data: Dict = {}
        if data_path and os.path.exists(data_path):
            self._load_data(data_path)
        else:
            default_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "data",
                "roots",
                "hebrew_roots.json",
            )
            if os.path.exists(default_path):
                self._load_data(default_path)

    def _load_data(self, path: str) -> None:
        """Load roots data from JSON file."""
        with open(path, "r", encoding="utf-8") as f:
            self._roots_data = json.load(f)

    def get_language_code(self) -> str:
        return "he"

    def analyze_root(self, root: str) -> RootSpace:
        """Analyze a Hebrew root and build a RootSpace.

        Args:
            root: Root in 'מ-ל-ך' format.

        Returns:
            RootSpace populated with derivations.
        """
        normalized = root.replace("-", "").replace(" ", "")
        display_root = "-".join(normalized) if "-" not in root else root

        space = RootSpace(root=display_root, language="he")

        root_info = self._roots_data.get(display_root, {})
        semantic_field = root_info.get("semantic_field", "")
        examples = root_info.get("examples", {})

        config_id = 0
        for form_text, gloss in examples.items():
            config_id += 1
            stripped = strip_niqqud(form_text)
            niqqud_found = extract_niqqud(form_text)

            width = Width(
                root=display_root,
                derivation_degree=0 if stripped == normalized else 1,
            )

            depth = Depth(semantic_field=semantic_field)
            depth.add_layer(level=SemanticLevel.LITERAL, meaning=gloss)

            height = Height(
                base_form=stripped,
                configuration_id=config_id,
                vowels=[d for d in niqqud_found],
            )

            morpheme = Morpheme(
                form=form_text,
                root=display_root,
                language="he",
                gloss=gloss,
                x=width,
                y=depth,
                z=height,
            )
            space.add_morpheme(morpheme)

        return space

    def parse_morpheme(self, form: str) -> Morpheme:
        """Parse a Hebrew word into a Morpheme."""
        stripped = strip_niqqud(form)
        niqqud_found = extract_niqqud(form)

        width = Width(root=stripped)
        depth = Depth()
        height = Height(
            base_form=stripped,
            configuration_id=len(niqqud_found),
            vowels=niqqud_found,
        )

        return Morpheme(
            form=form,
            root=stripped,
            language="he",
            x=width,
            y=depth,
            z=height,
        )

    def vocalize(self, form: str) -> List[str]:
        """Return known vocalizations for an unvocalized Hebrew form."""
        stripped = strip_niqqud(form)
        vocalizations = []
        for root_key, root_data in self._roots_data.items():
            for vocalized_form in root_data.get("examples", {}):
                if strip_niqqud(vocalized_form) == stripped:
                    vocalizations.append(vocalized_form)
        return vocalizations
