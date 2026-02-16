"""
MorphemeSpace and RootSpace — spatial containers for morphemes.

Provides spatial operations: nearest-neighbor search, radial queries,
filtering, density computation, and statistical summaries.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Tuple

from ttm.core.morpheme import Morpheme


@dataclass
class MorphemeSpace:
    """A three-dimensional space containing morphemes.

    Attributes:
        morphemes: List of morphemes in this space.
        max_x: Maximum extent on X axis (derivation).
        max_y: Maximum extent on Y axis (depth).
        max_z: Maximum extent on Z axis (height).
    """

    morphemes: List[Morpheme] = field(default_factory=list)
    max_x: int = 10
    max_y: int = 4
    max_z: int = 20

    def add_morpheme(self, morpheme: Morpheme) -> None:
        """Add a morpheme to the space.

        Args:
            morpheme: The morpheme to add.
        """
        self.morphemes.append(morpheme)

    def remove_morpheme(self, morpheme: Morpheme) -> bool:
        """Remove a morpheme from the space.

        Args:
            morpheme: The morpheme to remove.

        Returns:
            True if removed, False if not found.
        """
        try:
            self.morphemes.remove(morpheme)
            return True
        except ValueError:
            return False

    def get_morphemes_by_root(self, root: str) -> List[Morpheme]:
        """Get all morphemes sharing a given root.

        Args:
            root: The consonantal root to search for.

        Returns:
            List of matching morphemes.
        """
        return [m for m in self.morphemes if m.root == root]

    def get_morphemes_at_coordinates(
        self, x: int, y: int, z: int
    ) -> List[Morpheme]:
        """Get morphemes at exact coordinates.

        Args:
            x: X coordinate.
            y: Y coordinate.
            z: Z coordinate.

        Returns:
            List of morphemes at those coordinates.
        """
        return [m for m in self.morphemes if m.coordinates == (x, y, z)]

    def get_morphemes_in_range(
        self, center: Tuple[int, int, int], radius: float
    ) -> List[Morpheme]:
        """Find all morphemes within a radius of a center point.

        Args:
            center: (x, y, z) center coordinates.
            radius: Maximum distance from center.

        Returns:
            List of morphemes within the specified radius.
        """
        cx, cy, cz = center
        result = []
        for morpheme in self.morphemes:
            mx, my, mz = morpheme.coordinates
            distance = math.sqrt(
                (mx - cx) ** 2 + (my - cy) ** 2 + (mz - cz) ** 2
            )
            if distance <= radius:
                result.append(morpheme)
        return result

    def find_nearest(
        self, morpheme: Morpheme, k: int = 5
    ) -> List[Tuple[Morpheme, float]]:
        """Find the k nearest neighbors to a morpheme.

        Args:
            morpheme: The reference morpheme.
            k: Number of neighbors to return.

        Returns:
            List of (morpheme, distance) tuples sorted by distance.
        """
        distances = [
            (other, morpheme.distance_to(other))
            for other in self.morphemes
            if other is not morpheme
        ]
        distances.sort(key=lambda x: x[1])
        return distances[:k]

    def filter_morphemes(
        self, predicate: Callable[[Morpheme], bool]
    ) -> List[Morpheme]:
        """Filter morphemes using a predicate function.

        Args:
            predicate: A function that returns True for morphemes to include.

        Returns:
            List of matching morphemes.
        """
        return [m for m in self.morphemes if predicate(m)]

    def compute_density(
        self, center: Tuple[int, int, int], radius: float
    ) -> float:
        """Compute the density of morphemes in a spherical region.

        Args:
            center: Center of the region.
            radius: Radius of the region.

        Returns:
            Number of morphemes per unit volume.
        """
        if radius <= 0:
            return 0.0
        count = len(self.get_morphemes_in_range(center, radius))
        volume = (4 / 3) * math.pi * (radius ** 3)
        return count / volume

    def get_statistics(self) -> Dict:
        """Get statistical summary of the morpheme space.

        Returns:
            Dictionary with counts, coordinate ranges, and language distribution.
        """
        if not self.morphemes:
            return {"count": 0}

        coords = [m.coordinates for m in self.morphemes]
        xs = [c[0] for c in coords]
        ys = [c[1] for c in coords]
        zs = [c[2] for c in coords]

        languages: Dict[str, int] = {}
        roots: Dict[str, int] = {}
        for m in self.morphemes:
            languages[m.language] = languages.get(m.language, 0) + 1
            roots[m.root] = roots.get(m.root, 0) + 1

        return {
            "count": len(self.morphemes),
            "x_range": (min(xs), max(xs)),
            "y_range": (min(ys), max(ys)),
            "z_range": (min(zs), max(zs)),
            "languages": languages,
            "unique_roots": len(roots),
            "roots": roots,
        }

    def __len__(self) -> int:
        return len(self.morphemes)

    def __repr__(self) -> str:
        return f"MorphemeSpace(n={len(self.morphemes)})"


class RootSpace(MorphemeSpace):
    """A specialized morpheme space for a single root and its derivations.

    Attributes:
        root: The consonantal root.
        language: Language code.
    """

    def __init__(
        self,
        root: str,
        language: str = "",
        morphemes: Optional[List[Morpheme]] = None,
    ):
        super().__init__(morphemes=morphemes or [])
        self.root = root
        self.language = language

    def add_morpheme(self, morpheme: Morpheme) -> None:
        """Add a morpheme, enforcing root consistency.

        Args:
            morpheme: Morpheme to add (must match this space's root).

        Raises:
            ValueError: If the morpheme's root doesn't match.
        """
        if morpheme.root != self.root:
            raise ValueError(
                f"Morpheme root '{morpheme.root}' doesn't match "
                f"space root '{self.root}'"
            )
        super().add_morpheme(morpheme)

    def get_by_derivation_degree(self, degree: int) -> List[Morpheme]:
        """Get morphemes at a specific derivation degree.

        Args:
            degree: The derivation degree to filter by.

        Returns:
            List of morphemes with the specified derivation degree.
        """
        return [
            m for m in self.morphemes
            if m.x.derivation_degree == degree
        ]

    def get_derivation_tree(self) -> Dict[int, List[Morpheme]]:
        """Get morphemes organized by derivation degree.

        Returns:
            Dictionary mapping derivation degree to list of morphemes.
        """
        tree: Dict[int, List[Morpheme]] = {}
        for m in self.morphemes:
            degree = m.x.derivation_degree
            if degree not in tree:
                tree[degree] = []
            tree[degree].append(m)
        return tree

    def __repr__(self) -> str:
        return (
            f"RootSpace(root='{self.root}', language='{self.language}', "
            f"n={len(self.morphemes)})"
        )
