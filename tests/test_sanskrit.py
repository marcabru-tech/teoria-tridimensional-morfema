"""Tests for Sanskrit analyzer."""

from ttm.analyzers.sanskrit import SanskritAnalyzer


class TestSanskritAnalyzer:
    def setup_method(self):
        self.analyzer = SanskritAnalyzer()

    def test_analyze_root_gam(self):
        space = self.analyzer.analyze_root("gam")
        forms = [m.form for m in space.morphemes]
        assert "gacchati" in forms

    def test_parse_morpheme_conjugation(self):
        m = self.analyzer.parse_morpheme("gacchati")
        assert m.root == "gam"
        assert "PRESENT_3SG" in m.x.suffixes
