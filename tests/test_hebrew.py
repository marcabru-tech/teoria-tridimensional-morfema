"""Tests for the Hebrew analyzer."""

from ttm.analyzers.hebrew import HebrewAnalyzer, strip_niqqud
from ttm.core.morpheme import Morpheme


class TestHebrewAnalyzer:
    """Tests for HebrewAnalyzer."""

    def setup_method(self):
        self.analyzer = HebrewAnalyzer()

    def test_strip_niqqud(self):
        assert strip_niqqud("מֶלֶךְ") == "מלך"
        assert strip_niqqud("שָׁמַר") == "שמר"

    def test_analyze_root(self):
        space = self.analyzer.analyze_root("מ-ל-ך")
        assert space.root == "מ-ל-ך"
        assert len(space.morphemes) >= 1
        
        # Check specific morpheme
        king = next((m for m in space.morphemes if m.form == "מֶלֶךְ"), None)
        assert king is not None
        assert king.gloss == "king"

    def test_parse_morpheme(self):
        m = self.analyzer.parse_morpheme("מֶלֶךְ")
        assert isinstance(m, Morpheme)
        assert m.language == "he"
        assert m.z.base_form == "מלך"
        assert len(m.z.vowels) > 0

    def test_vocalize(self):
        # "מלך" can be Melekh (King) or Malakh (He ruled)
        options = self.analyzer.vocalize("מלך")
        assert "מֶלֶךְ" in options
        assert "מָלַךְ" in options
