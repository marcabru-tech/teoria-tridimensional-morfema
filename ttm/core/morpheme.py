"""
Morpheme class — the central entity of the Three-Dimensional Theory.

A Morpheme is represented as a point in 3D space with coordinates
derived from its Width (X), Depth (Y), and Height (Z) dimensions.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Dict, Optional, Tuple

from ttm.core.dimensions import Depth, Diacritic, Height, SemanticLayer, SemanticLevel, Width


@dataclass
class Morpheme:
    """A morpheme in three-dimensional space.

    Attributes:
        form: Surface form (with vocalization if available).
        root: Consonantal root or radical.
        language: Language identifier string (e.g. 'ar', 'he', 'pt').
        gloss: Translation or gloss.
        x: Width dimension (combinatorial-derivational).
        y: Depth dimension (hermeneutic-semantic).
        z: Height dimension (suprasegmental-graphical).
        metadata: Additional metadata.
    """

    form: str
    root: str
    language: str = ""
    gloss: str = ""
    x: Width = field(default_factory=Width)
    y: Depth = field(default_factory=Depth)
    z: Height = field(default_factory=Height)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def coordinates(self) -> Tuple[int, int, int]:
        """Returns the (x, y, z) coordinates in morphemic space."""
        return (self.x.position, self.y.level, self.z.configuration)

    def distance_to(self, other: Morpheme) -> float:
        """Compute Euclidean distance to another morpheme.

        Args:
            other: Another Morpheme instance.

        Returns:
            The Euclidean distance between the two morphemes in 3D space.
        """
        x1, y1, z1 = self.coordinates
        x2, y2, z2 = other.coordinates
        return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2)

    def translate_along_x(self, prefix: str = "", suffix: str = "") -> Morpheme:
        """Create a derived morpheme by adding affixes (translation along X axis).

        Args:
            prefix: Prefix to add.
            suffix: Suffix to add.

        Returns:
            A new Morpheme with updated Width.
        """
        new_width = Width(
            root=self.x.root or self.root,
            prefixes=self.x.prefixes.copy(),
            suffixes=self.x.suffixes.copy(),
            pattern=self.x.pattern,
            derivation_degree=self.x.derivation_degree,
        )
        if prefix:
            new_width.add_prefix(prefix)
        if suffix:
            new_width.add_suffix(suffix)

        return Morpheme(
            form=new_width.full_form,
            root=self.root,
            language=self.language,
            gloss=self.gloss,
            x=new_width,
            y=Depth(
                levels=self.y.levels.copy(),
                current_level=self.y.current_level,
                semantic_field=self.y.semantic_field,
            ),
            z=Height(
                base_form=self.z.base_form,
                diacritics=self.z.diacritics.copy(),
                vowels=self.z.vowels.copy(),
                configuration_id=self.z.configuration_id,
            ),
        )

    def translate_along_y(self, level: SemanticLevel) -> Morpheme:
        """Create a morpheme at a different semantic level (translation along Y axis).

        Args:
            level: The target SemanticLevel.

        Returns:
            A new Morpheme with updated Depth.
        """
        new_depth = Depth(
            levels=self.y.levels.copy(),
            current_level=level.value,
            semantic_field=self.y.semantic_field,
        )
        return Morpheme(
            form=self.form,
            root=self.root,
            language=self.language,
            gloss=self.gloss,
            x=self.x,
            y=new_depth,
            z=self.z,
        )

    def translate_along_z(self, vocalization: str, config_id: int) -> Morpheme:
        """Create a revocalized morpheme (translation along Z axis).

        Args:
            vocalization: The new vocalized form.
            config_id: The new configuration ID.

        Returns:
            A new Morpheme with updated Height.
        """
        new_height = Height(
            base_form=self.z.base_form or self.form,
            configuration_id=config_id,
        )
        return Morpheme(
            form=vocalization,
            root=self.root,
            language=self.language,
            gloss=self.gloss,
            x=self.x,
            y=self.y,
            z=new_height,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Serialize the morpheme to a dictionary.

        Returns:
            Dictionary representation of the morpheme.
        """
        return {
            "form": self.form,
            "root": self.root,
            "language": self.language,
            "gloss": self.gloss,
            "coordinates": list(self.coordinates),
            "width": {
                "root": self.x.root,
                "prefixes": self.x.prefixes,
                "suffixes": self.x.suffixes,
                "pattern": self.x.pattern,
                "derivation_degree": self.x.derivation_degree,
            },
            "depth": {
                "current_level": self.y.current_level,
                "semantic_field": self.y.semantic_field,
                "levels": [
                    {
                        "level": layer.level.value,
                        "level_name": layer.level.name,
                        "meaning": layer.meaning,
                        "tradition": layer.tradition,
                    }
                    for layer in self.y.levels
                ],
            },
            "height": {
                "base_form": self.z.base_form,
                "configuration_id": self.z.configuration_id,
                "vowels": self.z.vowels,
                "diacritics": [
                    {"symbol": d.symbol, "name": d.name, "position": d.position}
                    for d in self.z.diacritics
                ],
            },
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Morpheme:
        """Deserialize a morpheme from a dictionary.

        Args:
            data: Dictionary with morpheme data.

        Returns:
            A Morpheme instance.
        """
        width_data = data.get("width", {})
        depth_data = data.get("depth", {})
        height_data = data.get("height", {})

        width = Width(
            root=width_data.get("root", ""),
            prefixes=width_data.get("prefixes", []),
            suffixes=width_data.get("suffixes", []),
            pattern=width_data.get("pattern", ""),
            derivation_degree=width_data.get("derivation_degree", 0),
        )

        depth = Depth(
            current_level=depth_data.get("current_level", 1),
            semantic_field=depth_data.get("semantic_field", ""),
        )
        for layer_data in depth_data.get("levels", []):
            depth.add_layer(
                level=SemanticLevel(layer_data["level"]),
                meaning=layer_data["meaning"],
                tradition=layer_data.get("tradition", ""),
            )

        height = Height(
            base_form=height_data.get("base_form", ""),
            configuration_id=height_data.get("configuration_id", 0),
            vowels=height_data.get("vowels", []),
        )
        for d_data in height_data.get("diacritics", []):
            height.add_diacritic(
                symbol=d_data["symbol"],
                name=d_data["name"],
                position=d_data.get("position", "above"),
            )

        return cls(
            form=data["form"],
            root=data["root"],
            language=data.get("language", ""),
            gloss=data.get("gloss", ""),
            x=width,
            y=depth,
            z=height,
            metadata=data.get("metadata", {}),
        )

    def __repr__(self) -> str:
        coords = self.coordinates
        return (
            f"Morpheme(form='{self.form}', root='{self.root}', "
            f"coords=({coords[0]}, {coords[1]}, {coords[2]}))"
        )


def create_semitic_morpheme(
    form: str,
    root: str,
    language: str,
    gloss: str,
    pattern: str = "",
    derivation_degree: int = 0,
    semantic_field: str = "",
    semantic_layers: Optional[list] = None,
    configuration_id: int = 0,
    vowels: Optional[list] = None,
) -> Morpheme:
    """Convenience factory for creating Semitic morphemes.

    Args:
        form: Surface form.
        root: Consonantal root (e.g. 'ك-ت-ب').
        language: Language code.
        gloss: Translation.
        pattern: Derivational pattern (wazn/mishqal).
        derivation_degree: Degree of derivation from root.
        semantic_field: Semantic field.
        semantic_layers: List of (SemanticLevel, meaning) tuples.
        configuration_id: Vocalic configuration ID.
        vowels: List of vowels.

    Returns:
        A fully configured Morpheme.
    """
    width = Width(
        root=root,
        pattern=pattern,
        derivation_degree=derivation_degree,
    )

    depth = Depth(semantic_field=semantic_field)
    if semantic_layers:
        for level, meaning in semantic_layers:
            depth.add_layer(level=level, meaning=meaning)

    height = Height(
        base_form=root,
        configuration_id=configuration_id,
        vowels=vowels or [],
    )

    return Morpheme(
        form=form,
        root=root,
        language=language,
        gloss=gloss,
        x=width,
        y=depth,
        z=height,
    )
