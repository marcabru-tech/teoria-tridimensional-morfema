"""Tests for MorphemeSpace and RootSpace classes."""

import pytest

from ttm.core.morpheme import Morpheme
from ttm.core.space import MorphemeSpace, RootSpace


class TestMorphemeSpace:
    """Tests for the MorphemeSpace class."""

    def test_empty_space(self):
        space = MorphemeSpace()
        assert len(space) == 0

    def test_add_morpheme(self, kataba_morpheme):
        space = MorphemeSpace()
        space.add_morpheme(kataba_morpheme)
        assert len(space) == 1

    def test_remove_morpheme(self, kataba_morpheme):
        space = MorphemeSpace()
        space.add_morpheme(kataba_morpheme)
        assert space.remove_morpheme(kataba_morpheme) is True
        assert len(space) == 0

    def test_remove_nonexistent(self, kataba_morpheme):
        space = MorphemeSpace()
        assert space.remove_morpheme(kataba_morpheme) is False

    def test_get_morphemes_by_root(self, ktb_root_space):
        results = ktb_root_space.get_morphemes_by_root("ك-ت-ب")
        assert len(results) == 3

    def test_get_morphemes_by_root_empty(self, ktb_root_space):
        results = ktb_root_space.get_morphemes_by_root("ق-ر-أ")
        assert len(results) == 0

    def test_find_nearest(self, ktb_root_space, kataba_morpheme):
        nearest = ktb_root_space.find_nearest(kataba_morpheme, k=2)
        assert len(nearest) == 2
        # Each entry is (morpheme, distance)
        assert all(isinstance(n[0], Morpheme) for n in nearest)
        assert all(isinstance(n[1], float) for n in nearest)
        # Sorted by distance
        assert nearest[0][1] <= nearest[1][1]

    def test_get_morphemes_in_range(self, ktb_root_space, kataba_morpheme):
        center = kataba_morpheme.coordinates
        results = ktb_root_space.get_morphemes_in_range(center, radius=100.0)
        assert len(results) >= 1  # At least kataba itself

    def test_filter_morphemes(self, ktb_root_space):
        results = ktb_root_space.filter_morphemes(
            lambda m: m.gloss == "writer"
        )
        assert len(results) == 1
        assert results[0].form == "كَاتِب"

    def test_compute_density(self, ktb_root_space, kataba_morpheme):
        density = ktb_root_space.compute_density(
            kataba_morpheme.coordinates, radius=100.0
        )
        assert density > 0

    def test_compute_density_zero_radius(self, ktb_root_space, kataba_morpheme):
        density = ktb_root_space.compute_density(
            kataba_morpheme.coordinates, radius=0
        )
        assert density == 0.0

    def test_get_statistics(self, ktb_root_space):
        stats = ktb_root_space.get_statistics()
        assert stats["count"] == 3
        assert stats["unique_roots"] == 1
        assert "x_range" in stats
        assert "y_range" in stats
        assert "z_range" in stats

    def test_get_statistics_empty(self):
        space = MorphemeSpace()
        stats = space.get_statistics()
        assert stats["count"] == 0

    def test_repr(self, ktb_root_space):
        r = repr(ktb_root_space)
        assert "3" in r


class TestRootSpace:
    """Tests for the RootSpace subclass."""

    def test_creation(self):
        space = RootSpace(root="ك-ت-ب", language="ar")
        assert space.root == "ك-ت-ب"
        assert space.language == "ar"

    def test_add_matching_root(self, kataba_morpheme):
        space = RootSpace(root="ك-ت-ب", language="ar")
        space.add_morpheme(kataba_morpheme)
        assert len(space) == 1

    def test_add_wrong_root(self):
        space = RootSpace(root="ك-ت-ب")
        wrong = Morpheme(form="test", root="ق-ر-أ")
        with pytest.raises(ValueError, match="doesn't match"):
            space.add_morpheme(wrong)

    def test_get_by_derivation_degree(self, ktb_root_space):
        base = ktb_root_space.get_by_derivation_degree(0)
        derived = ktb_root_space.get_by_derivation_degree(1)
        assert len(base) >= 1
        assert len(derived) >= 1

    def test_get_derivation_tree(self, ktb_root_space):
        tree = ktb_root_space.get_derivation_tree()
        assert isinstance(tree, dict)
        assert all(isinstance(k, int) for k in tree.keys())

    def test_repr(self):
        space = RootSpace(root="ك-ت-ب", language="ar")
        r = repr(space)
        assert "ك-ت-ب" in r
        assert "ar" in r
