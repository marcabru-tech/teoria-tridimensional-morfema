"""
Dimension classes for the Three-Dimensional Theory of the Morpheme.

Defines the three irreducible analytical dimensions:
- Width (X): Combinatorial-derivational dimension
- Depth (Y): Hermeneutic-semantic dimension
- Height (Z): Suprasegmental-graphical dimension
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from typing import List, Optional


class SemanticLevel(enum.IntEnum):
    """Semantic depth levels based on PaRDeS / Ẓāhir-Bāṭin traditions.

    PaRDeS (Hebrew): Peshat, Remez, Derash, Sod
    Ẓāhir/Bāṭin (Arabic): Apparent, Hidden
    """

    LITERAL = 1       # Peshat (פשט) / Ẓāhir (ظاهر)
    ALLUSIVE = 2      # Remez (רמז)
    HOMILETIC = 3     # Derash (דרש)
    MYSTICAL = 4      # Sod (סוד) / Bāṭin (باطن)


@dataclass
class SemanticLayer:
    """A single semantic layer within the Depth dimension.

    Attributes:
        level: The semantic level (LITERAL, ALLUSIVE, HOMILETIC, MYSTICAL).
        meaning: The meaning at this level.
        tradition: The interpretive tradition (e.g. 'rabbinic', 'sufi', 'patristic').
        source: Reference or source text.
    """

    level: SemanticLevel
    meaning: str
    tradition: str = ""
    source: str = ""

    def __repr__(self) -> str:
        return f"SemanticLayer({self.level.name}: '{self.meaning}')"


@dataclass
class Diacritic:
    """A diacritical mark in the Height dimension.

    Attributes:
        symbol: The Unicode diacritic character.
        name: Human-readable name (e.g. 'fatḥa', 'ḥiriq').
        position: Position relative to base character ('above', 'below', 'inline').
        function: Linguistic function ('vowel', 'gemination', 'cantillation', 'other').
    """

    symbol: str
    name: str
    position: str = "above"
    function: str = "vowel"

    def __repr__(self) -> str:
        return f"Diacritic('{self.symbol}', {self.name})"


@dataclass
class Width:
    """Combinatorial-derivational dimension (X axis).

    Represents the morphological structure of a morpheme in terms
    of its root, affixes, and derivational pattern.

    Attributes:
        root: The nuclear consonantal root.
        prefixes: List of prefixes attached.
        suffixes: List of suffixes attached.
        pattern: The derivational pattern (mishqal/wazn).
        derivation_degree: Degree of derivation from the root (0 = root itself).
        syntagmatic_context: Phrasal context.
        possible_derivations: Known derivations from this root.
    """

    root: str = ""
    prefixes: List[str] = field(default_factory=list)
    suffixes: List[str] = field(default_factory=list)
    pattern: str = ""
    derivation_degree: int = 0
    syntagmatic_context: str = ""
    possible_derivations: List[str] = field(default_factory=list)

    @property
    def position(self) -> int:
        """Numeric position on the X axis (derivation degree)."""
        return self.derivation_degree

    @property
    def full_form(self) -> str:
        """Reconstructs the full form from root + affixes."""
        prefix_str = "".join(self.prefixes)
        suffix_str = "".join(self.suffixes)
        return f"{prefix_str}{self.root}{suffix_str}"

    def add_prefix(self, prefix: str) -> None:
        """Add a prefix and increment derivation degree."""
        self.prefixes.append(prefix)
        self.derivation_degree += 1

    def add_suffix(self, suffix: str) -> None:
        """Add a suffix and increment derivation degree."""
        self.suffixes.append(suffix)
        self.derivation_degree += 1


@dataclass
class Depth:
    """Hermeneutic-semantic dimension (Y axis).

    Represents the stratification of meaning from literal
    to mystical interpretation.

    Attributes:
        levels: List of semantic layers.
        current_level: The level currently in focus (1-4).
        semantic_field: The semantic field (e.g. 'writing', 'kingship').
        polysemy_type: Type of polysemy ('regular', 'irregular', 'homonymy').
    """

    levels: List[SemanticLayer] = field(default_factory=list)
    current_level: int = 1
    semantic_field: str = ""
    polysemy_type: str = "regular"

    @property
    def level(self) -> int:
        """Numeric position on the Y axis."""
        return self.current_level

    def add_layer(self, level: SemanticLevel, meaning: str, **kwargs) -> SemanticLayer:
        """Add a semantic layer.

        Args:
            level: The semantic level.
            meaning: The meaning at this level.
            **kwargs: Additional keyword arguments for SemanticLayer.

        Returns:
            The created SemanticLayer.
        """
        layer = SemanticLayer(level=level, meaning=meaning, **kwargs)
        self.levels.append(layer)
        return layer

    def get_layer(self, level: SemanticLevel) -> Optional[SemanticLayer]:
        """Get the semantic layer at a specific level.

        Args:
            level: The semantic level to retrieve.

        Returns:
            The SemanticLayer if found, None otherwise.
        """
        for layer in self.levels:
            if layer.level == level:
                return layer
        return None

    @property
    def literal_meaning(self) -> Optional[str]:
        """Shortcut for the literal meaning."""
        layer = self.get_layer(SemanticLevel.LITERAL)
        return layer.meaning if layer else None

    @property
    def mystical_meaning(self) -> Optional[str]:
        """Shortcut for the mystical meaning."""
        layer = self.get_layer(SemanticLevel.MYSTICAL)
        return layer.meaning if layer else None


@dataclass
class Height:
    """Suprasegmental-graphical dimension (Z axis).

    Represents the vertical/diacritical information of a morpheme,
    including vowel points, cantillation marks, and other graphical features.

    Attributes:
        base_form: The base consonantal form (without diacritics).
        diacritics: List of diacritical marks.
        vowels: List of vowels.
        cantillation: List of cantillation marks.
        configuration_id: Numeric ID of the vocalic configuration.
        alternative_vocalizations: Other possible vocalizations.
    """

    base_form: str = ""
    diacritics: List[Diacritic] = field(default_factory=list)
    vowels: List[str] = field(default_factory=list)
    cantillation: List[str] = field(default_factory=list)
    configuration_id: int = 0
    alternative_vocalizations: List[str] = field(default_factory=list)

    @property
    def configuration(self) -> int:
        """Numeric position on the Z axis."""
        return self.configuration_id

    @property
    def has_vocalization(self) -> bool:
        """Whether any vocalization is present."""
        return len(self.diacritics) > 0 or len(self.vowels) > 0

    @property
    def vowel_pattern(self) -> str:
        """Returns the vowel pattern as a string."""
        return "-".join(self.vowels) if self.vowels else ""

    def add_diacritic(
        self,
        symbol: str,
        name: str,
        position: str = "above",
        function: str = "vowel",
    ) -> Diacritic:
        """Add a diacritical mark.

        Args:
            symbol: The Unicode diacritic character.
            name: Human-readable name.
            position: Position relative to base character.
            function: Linguistic function.

        Returns:
            The created Diacritic.
        """
        d = Diacritic(symbol=symbol, name=name, position=position, function=function)
        self.diacritics.append(d)
        return d

    def get_diacritics_by_position(self, position: str) -> List[Diacritic]:
        """Filter diacritics by position.

        Args:
            position: Position to filter by ('above', 'below', 'inline').

        Returns:
            List of matching diacritics.
        """
        return [d for d in self.diacritics if d.position == position]
