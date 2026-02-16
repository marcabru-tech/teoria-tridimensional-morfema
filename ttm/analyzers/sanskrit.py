"""
Sanskrit morphological analyzer.

Implements Pāṇinian morphological analysis in 3D.
"""

from __future__ import annotations

from typing import List

from ttm.analyzers.indo_european import IndoEuropeanAnalyzer
from ttm.core.dimensions import Depth, Height, Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace


class SanskritAnalyzer(IndoEuropeanAnalyzer):
    """Analyzer for Sanskrit (Indo-Aryan)."""

    def get_language_code(self) -> str:
        return "sa"

    def analyze_root(self, root: str) -> RootSpace:
        """Analyze a Sanskrit root (Dhatu)."""
        space = RootSpace(root=root, language="sa")
        
        # Simple conjugation (Presenter Tense - Lat) for root 'gam' (go) -> 'gacchati'
        forms = [root]
        
        if root == "gam":
             forms.append("gacchati") # he goes
             forms.append("agaccham")   # I went (Imperfect)
             forms.append("gamiṣyāmi") # I will go (Future)
        
        for form in forms:
            space.add_morpheme(self.parse_morpheme(form))
            
        return space

    def parse_morpheme(self, form: str) -> Morpheme:
        """Parse Sanskrit word (Pada)."""
        # Width: Root + Affixes
        # Identifying root naively for MVP
        root = form
        suffixes = []
        
        if "cchati" in form or "gaccham" in form: # gam -> gacchati, agaccham
            root = "gam" 
            if "cchati" in form:
                suffixes.append("PRESENT_3SG")
            elif "gaccham" in form:
                suffixes.append("IMPERFECT_1SG")
        elif "mi" in form and ("sy" in form or "ṣy" in form): # gamiṣyāmi
            root = "gam"
            suffixes.append("FUTURE_1SG")
            
        width = Width(root=root, suffixes=suffixes)

        # Height: Pitch Accent (Udatta/Anudatta/Svarita)
        # Vedic Sanskrit had pitch, Classical lost it mostly.
        # We'll just mark it if present in transliteration (e.g. á)
        height = Height(base_form=form)
        if "á" in form or "é" in form or "í" in form or "ó" in form or "ú" in form:
             height.configuration_id = 1 # Udatta (High)

        depth = Depth()

        return Morpheme(
            form=form,
            root=root,
            language="sa",
            x=width,
            y=depth,
            z=height
        )
