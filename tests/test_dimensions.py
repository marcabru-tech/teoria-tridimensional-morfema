"""Tests for Width, Depth, and Height dimension classes."""

import pytest

from ttm.core.dimensions import (
    Depth,
    Diacritic,
    Height,
    SemanticLayer,
    SemanticLevel,
    Width,
)


class TestWidth:
    """Tests for the Width (X) dimension."""

    def test_default_position(self):
        w = Width()
        assert w.position == 0

    def test_add_prefix(self):
        w = Width(root="كتب")
        w.add_prefix("ال")
        assert "ال" in w.prefixes
        assert w.derivation_degree == 1

    def test_add_suffix(self):
        w = Width(root="كتب")
        w.add_suffix("ة")
        assert "ة" in w.suffixes
        assert w.derivation_degree == 1

    def test_full_form(self):
        w = Width(root="كتب", prefixes=["ال"], suffixes=["ة"])
        assert w.full_form == "الكتبة"

    def test_multiple_affixes(self):
        w = Width(root="test")
        w.add_prefix("un")
        w.add_suffix("able")
        w.add_suffix("ness")
        assert w.derivation_degree == 3
        assert w.full_form == "untestableness"


class TestDepth:
    """Tests for the Depth (Y) dimension."""

    def test_default_level(self):
        d = Depth()
        assert d.level == 1

    def test_add_layer(self):
        d = Depth()
        layer = d.add_layer(SemanticLevel.LITERAL, "to write")
        assert isinstance(layer, SemanticLayer)
        assert len(d.levels) == 1

    def test_get_layer(self, sample_depth):
        layer = sample_depth.get_layer(SemanticLevel.LITERAL)
        assert layer is not None
        assert layer.meaning == "to write"

    def test_get_layer_not_found(self):
        d = Depth()
        assert d.get_layer(SemanticLevel.MYSTICAL) is None

    def test_literal_meaning(self, sample_depth):
        assert sample_depth.literal_meaning == "to write"

    def test_mystical_meaning(self, sample_depth):
        assert sample_depth.mystical_meaning == "divine decree (maktūb)"

    def test_semantic_levels_order(self):
        assert SemanticLevel.LITERAL < SemanticLevel.ALLUSIVE
        assert SemanticLevel.ALLUSIVE < SemanticLevel.HOMILETIC
        assert SemanticLevel.HOMILETIC < SemanticLevel.MYSTICAL


class TestHeight:
    """Tests for the Height (Z) dimension."""

    def test_default_configuration(self):
        h = Height()
        assert h.configuration == 0

    def test_has_vocalization_true(self, sample_height):
        assert sample_height.has_vocalization is True

    def test_has_vocalization_false(self):
        h = Height()
        assert h.has_vocalization is False

    def test_add_diacritic(self):
        h = Height()
        d = h.add_diacritic("\u064E", "fatḥa", "above", "vowel")
        assert isinstance(d, Diacritic)
        assert len(h.diacritics) == 1

    def test_vowel_pattern(self):
        h = Height(vowels=["a", "i", "u"])
        assert h.vowel_pattern == "a-i-u"

    def test_vowel_pattern_empty(self):
        h = Height()
        assert h.vowel_pattern == ""

    def test_get_diacritics_by_position(self):
        h = Height()
        h.add_diacritic("\u064E", "fatḥa", "above", "vowel")
        h.add_diacritic("\u0650", "kasra", "below", "vowel")
        h.add_diacritic("\u064F", "ḍamma", "above", "vowel")

        above = h.get_diacritics_by_position("above")
        assert len(above) == 2

        below = h.get_diacritics_by_position("below")
        assert len(below) == 1


class TestDiacritic:
    """Tests for the Diacritic dataclass."""

    def test_creation(self):
        d = Diacritic(symbol="\u064E", name="fatḥa")
        assert d.symbol == "\u064E"
        assert d.name == "fatḥa"
        assert d.position == "above"
        assert d.function == "vowel"

    def test_repr(self):
        d = Diacritic(symbol="\u064E", name="fatḥa")
        r = repr(d)
        assert "fatḥa" in r


class TestSemanticLayer:
    """Tests for the SemanticLayer dataclass."""

    def test_creation(self):
        layer = SemanticLayer(
            level=SemanticLevel.LITERAL,
            meaning="to write",
            tradition="arabic",
        )
        assert layer.level == SemanticLevel.LITERAL
        assert layer.meaning == "to write"
        assert layer.tradition == "arabic"

    def test_repr(self):
        layer = SemanticLayer(level=SemanticLevel.MYSTICAL, meaning="destiny")
        r = repr(layer)
        assert "MYSTICAL" in r
        assert "destiny" in r
