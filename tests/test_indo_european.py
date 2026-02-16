"""Tests for Indo-European analyzers (Portuguese/English)."""

from ttm.analyzers.english import EnglishAnalyzer
from ttm.analyzers.portuguese import PortugueseAnalyzer


class TestPortugueseAnalyzer:
    def setup_method(self):
        self.analyzer = PortugueseAnalyzer()

    def test_analyze_root(self):
        space = self.analyzer.analyze_root("casa")
        forms = [m.form for m in space.morphemes]
        assert "casa" in forms
        assert "casas" in forms
        assert "casinha" in forms

    def test_parse_morpheme(self):
        m = self.analyzer.parse_morpheme("gatinho")
        assert m.root == "gato"  # assuming crude replacement logic in simplified analyzer
        assert "DIMINUTIVE" in m.x.suffixes
        
        m_plural = self.analyzer.parse_morpheme("livros")
        assert m_plural.root == "livro"
        assert "PLURAL" in m_plural.x.suffixes


class TestEnglishAnalyzer:
    def setup_method(self):
        self.analyzer = EnglishAnalyzer()

    def test_analyze_root(self):
        space = self.analyzer.analyze_root("walk")
        forms = [m.form for m in space.morphemes]
        assert "walk" in forms
        assert "walks" in forms
        assert "walking" in forms
        assert "walked" in forms

    def test_parse_morpheme(self):
        m = self.analyzer.parse_morpheme("playing")
        assert m.root == "play"
        assert "PROG" in m.x.suffixes
