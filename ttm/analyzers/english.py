"""
English morphological analyzer.
"""

from __future__ import annotations

from ttm.analyzers.indo_european import IndoEuropeanAnalyzer
from ttm.core.dimensions import Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace


class EnglishAnalyzer(IndoEuropeanAnalyzer):
    """Analyzer for English morphology."""

    def get_language_code(self) -> str:
        return "en"

    def analyze_root(self, root: str) -> RootSpace:
        """Generate derivations for English stem."""
        space = RootSpace(root=root, language="en")
        
        forms = [root]
        # Plural / 3rd Person
        if root.endswith(("s", "x", "z", "ch", "sh")):
            forms.append(root + "es")
        else:
            forms.append(root + "s")
            
        # Progressive
        if root.endswith("e") and not root.endswith("ee"):
             forms.append(root[:-1] + "ing")
        else:
             forms.append(root + "ing")
             
        # Past
        if root.endswith("e"):
            forms.append(root + "d")
        else:
            forms.append(root + "ed")
            
        for form in forms:
            space.add_morpheme(self.parse_morpheme(form))
            
        return space

    def parse_morpheme(self, form: str) -> Morpheme:
        """Parse English word."""
        root = form
        suffixes = []
        
        if form.endswith("ing"):
            root = form[:-3] # simplified
            suffixes.append("PROG")
        elif form.endswith("ed"):
            root = form[:-2]
            suffixes.append("PAST")
        elif form.endswith("s") and not form.endswith("ss"):
            root = form[:-1]
            suffixes.append("PLURAL/3SG")
            
        width = Width(root=root, suffixes=suffixes)
        
        return Morpheme(
            form=form,
            root=root,
            language="en",
            x=width,
        )
