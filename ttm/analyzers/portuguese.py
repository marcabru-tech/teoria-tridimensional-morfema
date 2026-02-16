"""
Portuguese morphological analyzer.
"""

from __future__ import annotations

from typing import List

from ttm.analyzers.indo_european import IndoEuropeanAnalyzer
from ttm.core.dimensions import Height, Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import RootSpace


class PortugueseAnalyzer(IndoEuropeanAnalyzer):
    """Analyzer for Portuguese morphology."""

    def get_language_code(self) -> str:
        return "pt"

    def analyze_root(self, root: str) -> RootSpace:
        """Generate common inflections for a Portuguese stem."""
        space = RootSpace(root=root, language="pt")
        
        # Simple generation rules for demo purposes
        forms = [root]
        
        # Plural
        if root.endswith(("a", "e", "o", "u", "i")):
            forms.append(root + "s")
        elif root.endswith("r") or root.endswith("z"):
            forms.append(root + "es")
        elif root.endswith("m"):
            forms.append(root[:-1] + "ns")
            
        # Diminutive
        if root.endswith("a"):
            forms.append(root[:-1] + "inha")
        elif root.endswith("o"):
            forms.append(root[:-1] + "inho")
            
        for form in forms:
            space.add_morpheme(self.parse_morpheme(form))
            
        return space

    def parse_morpheme(self, form: str) -> Morpheme:
        """Parse Portuguese word into 3D dimensions."""
        root = form
        suffixes = []
        
        # Naively strip common suffixes for Width analysis
        original_form = form
        
        # Plural checking
        if form.endswith("s") and not form.endswith("ss"):
            if form.endswith("ns"):
                root = form[:-2] + "m"
                suffixes.append("PLURAL")
            elif form.endswith("es") and len(form) > 3: # rudimentary check
                root = form[:-2] 
                suffixes.append("PLURAL")
            elif form.endswith("is") and len(form) > 3: # papel -> papeis logic omitted for simplicity
                 pass 
            else:
                 root = form[:-1]
                 suffixes.append("PLURAL")
        
        # Diminutive checking
        if "inh" in form:
            if form.endswith("inha"):
                root = form.replace("inha", "a") # Restore gender roughly
                suffixes.append("DIMINUTIVE")
            elif form.endswith("inho"):
                root = form.replace("inho", "o")
                suffixes.append("DIMINUTIVE")

        # Configuration ID (Z-axis) based on stress (tonic syllable)
        # 1: Oxytone (aguda), 2: Paroxytone (grave), 3: Proparoxytone (esdrúxula)
        stress_config = self._detect_stress(original_form)
        
        width = Width(root=root, suffixes=suffixes)
        height = Height(base_form=original_form, configuration_id=stress_config)
        
        return Morpheme(
            form=original_form,
            root=root,
            language="pt",
            x=width,
            z=height
        )

    def _detect_stress(self, word: str) -> int:
        """Simple heuristic for Portuguese stress."""
        # Returns 1 (last), 2 (penultimate), 3 (antepenultimate)
        
        # Graphical accents
        if any(c in "áéíóúýàèìòùâêîôûãõ" for c in word):
            # If accent is on last syllable -> 1
            # If accent is on penultimate -> 2
            # ... roughly implementation
            return 0 # Placeholder for complex logic
            
        # Default rules
        if word.endswith(("a", "e", "o", "am", "em", "ns")):
            return 2 # Paroxytone
        return 1 # Oxytone
