"""Tests for Russian analyzer."""

from ttm.analyzers.russian import RussianAnalyzer


class TestRussianAnalyzer:
    def setup_method(self):
        self.analyzer = RussianAnalyzer()

    def test_analyze_root_aspect(self):
        space = self.analyzer.analyze_root("chitat") # read (imp)
        forms = [m.form for m in space.morphemes]
        assert "chitat" in forms
        assert "prochitat" in forms # read (perf)

    def test_parse_morpheme_aspect(self):
        m_imp = self.analyzer.parse_morpheme("chitat")
        # Check depth for aspect info
        assert "Aspect: IMPERFECTIVE" in m_imp.y.levels[0].meaning

        m_perf = self.analyzer.parse_morpheme("prochitat")
        assert "Aspect: PERFECTIVE" in m_perf.y.levels[0].meaning
