"""Tests for the Morpheme class."""

import math

import pytest

from ttm.core.dimensions import SemanticLevel
from ttm.core.morpheme import Morpheme, create_semitic_morpheme


class TestMorphemeCreation:
    """Tests for morpheme creation and basic properties."""

    def test_basic_creation(self):
        m = Morpheme(form="test", root="tst", language="en", gloss="test word")
        assert m.form == "test"
        assert m.root == "tst"
        assert m.language == "en"
        assert m.gloss == "test word"

    def test_default_dimensions(self):
        m = Morpheme(form="test", root="tst")
        assert m.x.position == 0
        assert m.y.level == 1
        assert m.z.configuration == 0

    def test_coordinates(self, kataba_morpheme):
        coords = kataba_morpheme.coordinates
        assert isinstance(coords, tuple)
        assert len(coords) == 3

    def test_repr(self, kataba_morpheme):
        r = repr(kataba_morpheme)
        assert "كَتَبَ" in r
        assert "ك-ت-ب" in r

    def test_arabic_morpheme(self, kataba_morpheme):
        assert kataba_morpheme.form == "كَتَبَ"
        assert kataba_morpheme.root == "ك-ت-ب"
        assert kataba_morpheme.language == "ar"


class TestMorphemeDistance:
    """Tests for distance calculations."""

    def test_distance_to_self(self, kataba_morpheme):
        assert kataba_morpheme.distance_to(kataba_morpheme) == 0.0

    def test_distance_symmetric(self, kataba_morpheme, kaatib_morpheme):
        d1 = kataba_morpheme.distance_to(kaatib_morpheme)
        d2 = kaatib_morpheme.distance_to(kataba_morpheme)
        assert abs(d1 - d2) < 1e-10

    def test_distance_positive(self, kataba_morpheme, maktub_morpheme):
        d = kataba_morpheme.distance_to(maktub_morpheme)
        assert d >= 0.0

    def test_distance_triangle_inequality(
        self, kataba_morpheme, kaatib_morpheme, maktub_morpheme
    ):
        d_ab = kataba_morpheme.distance_to(kaatib_morpheme)
        d_bc = kaatib_morpheme.distance_to(maktub_morpheme)
        d_ac = kataba_morpheme.distance_to(maktub_morpheme)
        assert d_ac <= d_ab + d_bc + 1e-10


class TestMorphemeTranslation:
    """Tests for axis translations."""

    def test_translate_along_x(self, kataba_morpheme):
        derived = kataba_morpheme.translate_along_x(prefix="ال")
        assert derived.root == kataba_morpheme.root
        assert derived.x.derivation_degree > kataba_morpheme.x.derivation_degree

    def test_translate_along_y(self, kataba_morpheme):
        mystical = kataba_morpheme.translate_along_y(SemanticLevel.MYSTICAL)
        assert mystical.y.current_level == SemanticLevel.MYSTICAL
        assert mystical.form == kataba_morpheme.form

    def test_translate_along_z(self, kataba_morpheme):
        revocalized = kataba_morpheme.translate_along_z("كُتِبَ", config_id=5)
        assert revocalized.form == "كُتِبَ"
        assert revocalized.z.configuration_id == 5
        assert revocalized.root == kataba_morpheme.root


class TestMorphemeSerialization:
    """Tests for serialization/deserialization."""

    def test_to_dict(self, kataba_morpheme):
        d = kataba_morpheme.to_dict()
        assert d["form"] == "كَتَبَ"
        assert d["root"] == "ك-ت-ب"
        assert "coordinates" in d
        assert "width" in d
        assert "depth" in d
        assert "height" in d

    def test_roundtrip(self, kataba_morpheme):
        d = kataba_morpheme.to_dict()
        restored = Morpheme.from_dict(d)
        assert restored.form == kataba_morpheme.form
        assert restored.root == kataba_morpheme.root
        assert restored.language == kataba_morpheme.language

    def test_from_dict_minimal(self):
        data = {"form": "test", "root": "tst"}
        m = Morpheme.from_dict(data)
        assert m.form == "test"
        assert m.root == "tst"


class TestCreateSemiticMorpheme:
    """Tests for the convenience factory function."""

    def test_basic_factory(self):
        m = create_semitic_morpheme(
            form="كَتَبَ",
            root="ك-ت-ب",
            language="ar",
            gloss="he wrote",
            pattern="فَعَلَ",
        )
        assert m.form == "كَتَبَ"
        assert m.x.pattern == "فَعَلَ"
        assert m.x.root == "ك-ت-ب"

    def test_factory_with_layers(self):
        m = create_semitic_morpheme(
            form="مَكْتُوب",
            root="ك-ت-ب",
            language="ar",
            gloss="written/destiny",
            semantic_field="escrita",
            semantic_layers=[
                (SemanticLevel.LITERAL, "written"),
                (SemanticLevel.MYSTICAL, "destiny"),
            ],
        )
        assert len(m.y.levels) == 2
        assert m.y.literal_meaning == "written"
        assert m.y.mystical_meaning == "destiny"
