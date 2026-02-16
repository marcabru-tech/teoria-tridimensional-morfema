"""Tests for Mandarin analyzer."""

from ttm.analyzers.mandarin import MandarinAnalyzer


class TestMandarinAnalyzer:
    def setup_method(self):
        self.analyzer = MandarinAnalyzer()

    def test_analyze_root(self):
        space = self.analyzer.analyze_root("好")
        assert space.root == "好"

    def test_parse_morpheme_with_pinyin(self):
        # hǎo (3rd tone)
        m = self.analyzer.parse_morpheme("好", pinyin="hǎo")
        assert m.language == "zh"
        assert m.z.configuration_id == 3  # Tone 3

    def test_parse_morpheme_neutral_tone(self):
        # ma (neutral)
        m = self.analyzer.parse_morpheme("吗", pinyin="ma")
        assert m.z.configuration_id == 5

    def test_parse_morpheme_first_tone(self):
        # mā (1st tone)
        m = self.analyzer.parse_morpheme("妈", pinyin="mā")
        assert m.z.configuration_id == 1
