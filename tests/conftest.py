"""Shared fixtures for TTM tests."""

import pytest

from ttm.core.dimensions import Depth, Height, SemanticLevel, Width
from ttm.core.morpheme import Morpheme
from ttm.core.space import MorphemeSpace, RootSpace


@pytest.fixture
def sample_width():
    """A Width dimension for testing."""
    return Width(
        root="ك-ت-ب",
        pattern="فَعَلَ",
        derivation_degree=0,
    )


@pytest.fixture
def sample_depth():
    """A Depth dimension with literal and cultural layers."""
    depth = Depth(semantic_field="escrita")
    depth.add_layer(SemanticLevel.LITERAL, "to write")
    depth.add_layer(SemanticLevel.ALLUSIVE, "to record / prescribe")
    depth.add_layer(SemanticLevel.MYSTICAL, "divine decree (maktūb)")
    return depth


@pytest.fixture
def sample_height():
    """A Height dimension with Arabic diacritics."""
    height = Height(
        base_form="كتب",
        configuration_id=1,
        vowels=["a", "a", "a"],
    )
    height.add_diacritic("\u064E", "fatḥa", "above", "vowel")  # فَتحة
    return height


@pytest.fixture
def kataba_morpheme(sample_width, sample_depth, sample_height):
    """A complete morpheme for كَتَبَ (kataba, 'he wrote')."""
    return Morpheme(
        form="كَتَبَ",
        root="ك-ت-ب",
        language="ar",
        gloss="he wrote",
        x=sample_width,
        y=sample_depth,
        z=sample_height,
    )


@pytest.fixture
def kaatib_morpheme():
    """A morpheme for كَاتِب (kātib, 'writer')."""
    width = Width(root="ك-ت-ب", pattern="فَاعِل", derivation_degree=1)
    depth = Depth(semantic_field="escrita")
    depth.add_layer(SemanticLevel.LITERAL, "writer")
    height = Height(base_form="كتب", configuration_id=2, vowels=["a", "i"])
    return Morpheme(
        form="كَاتِب",
        root="ك-ت-ب",
        language="ar",
        gloss="writer",
        x=width,
        y=depth,
        z=height,
    )


@pytest.fixture
def maktub_morpheme():
    """A morpheme for مَكْتُوب (maktūb, 'written/destiny')."""
    width = Width(root="ك-ت-ب", pattern="مَفْعُول", derivation_degree=1)
    depth = Depth(semantic_field="escrita", current_level=2)
    depth.add_layer(SemanticLevel.LITERAL, "written")
    depth.add_layer(SemanticLevel.MYSTICAL, "destiny / divine decree")
    height = Height(base_form="كتب", configuration_id=3, vowels=["a", "u", "u"])
    return Morpheme(
        form="مَكْتُوب",
        root="ك-ت-ب",
        language="ar",
        gloss="written / destiny",
        x=width,
        y=depth,
        z=height,
    )


@pytest.fixture
def ktb_root_space(kataba_morpheme, kaatib_morpheme, maktub_morpheme):
    """A RootSpace for the K-T-B root with 3 morphemes."""
    space = RootSpace(root="ك-ت-ب", language="ar")
    space.add_morpheme(kataba_morpheme)
    space.add_morpheme(kaatib_morpheme)
    space.add_morpheme(maktub_morpheme)
    return space
