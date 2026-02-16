"""
Base analyzer for Indo-European (concatenative) languages.
"""

from __future__ import annotations

from typing import List, Optional

from ttm.analyzers.base import LanguageAnalyzer
from ttm.core.dimensions import Depth, Height, Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace


class IndoEuropeanAnalyzer(LanguageAnalyzer):
    """Base class for Indo-European languages using concatenative morphology."""

    def analyze_root(self, root: str) -> RootSpace:
        """Analyze a root/stem.
        
        For IE languages, 'root' is often the stem.
        """
        space = RootSpace(root=root, language=self.get_language_code())
        # Default implementation: just adds the root itself
        # Subclasses should override to add inflections/derivations
        m = self.parse_morpheme(root)
        space.add_morpheme(m)
        return space

    def parse_morpheme(self, form: str) -> Morpheme:
        """Generic parsing for concatenative morphology."""
        # Simple heuristic: treat whole word as root for now
        # Subclasses should implement actual affix stripping
        
        width = Width(root=form)
        depth = Depth()
        height = Height(base_form=form) # Height could track stress

        return Morpheme(
            form=form,
            root=form,
            language=self.get_language_code(),
            x=width,
            y=depth,
            z=height
        )

    def vocalize(self, form: str) -> List[str]:
        """IE languages usually don't need separate vocalization."""
        return [form]
