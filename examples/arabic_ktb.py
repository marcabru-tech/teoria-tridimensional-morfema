#!/usr/bin/env python3
"""
Example: Analysis of the Arabic root K-T-B (ك-ت-ب)
============================================================

This example demonstrates the Three-Dimensional Theory of the Morpheme
by analyzing the Arabic trilateral root K-T-B (كتب), which produces
words related to writing, books, and (in mystical tradition) destiny.

The root is analyzed across three dimensions:
  X (Width)  — derivational patterns
  Y (Depth)  — semantic layers (literal → mystical)
  Z (Height) — diacritical/vocalic configurations
"""

from ttm.core.dimensions import Depth, Height, SemanticLevel, Width
from ttm.core.morpheme import Morpheme, create_semitic_morpheme
from ttm.core.space import RootSpace

import sys
import io

# Ensure UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


def main():
    print("=" * 60)
    print("  Teoria Tridimensional do Morfema")
    print("  Análise da Raiz Árabe K-T-B (ك-ت-ب)")
    print("=" * 60)
    print()

    # --- Create RootSpace ---
    space = RootSpace(root="ك-ت-ب", language="ar")

    # --- 1. كَتَبَ (kataba) — "he wrote" ---
    kataba = create_semitic_morpheme(
        form="كَتَبَ",
        root="ك-ت-ب",
        language="ar",
        gloss="he wrote",
        pattern="فَعَلَ",
        derivation_degree=0,
        semantic_field="escrita",
        semantic_layers=[
            (SemanticLevel.LITERAL, "to write / he wrote"),
        ],
        configuration_id=1,
        vowels=["a", "a", "a"],
    )
    space.add_morpheme(kataba)

    # --- 2. كَاتِب (kātib) — "writer" ---
    kaatib = create_semitic_morpheme(
        form="كَاتِب",
        root="ك-ت-ب",
        language="ar",
        gloss="writer",
        pattern="فَاعِل",
        derivation_degree=1,
        semantic_field="escrita",
        semantic_layers=[
            (SemanticLevel.LITERAL, "writer / scribe"),
        ],
        configuration_id=2,
        vowels=["aa", "i"],
    )
    space.add_morpheme(kaatib)

    # --- 3. كِتَاب (kitāb) — "book" ---
    kitaab = create_semitic_morpheme(
        form="كِتَاب",
        root="ك-ت-ب",
        language="ar",
        gloss="book",
        pattern="فِعَال",
        derivation_degree=1,
        semantic_field="escrita",
        semantic_layers=[
            (SemanticLevel.LITERAL, "book"),
            (SemanticLevel.ALLUSIVE, "scripture / the Book"),
        ],
        configuration_id=3,
        vowels=["i", "aa"],
    )
    space.add_morpheme(kitaab)

    # --- 4. مَكْتُوب (maktūb) — "written / destiny" ---
    maktub = create_semitic_morpheme(
        form="مَكْتُوب",
        root="ك-ت-ب",
        language="ar",
        gloss="written / destiny",
        pattern="مَفْعُول",
        derivation_degree=1,
        semantic_field="escrita",
        semantic_layers=[
            (SemanticLevel.LITERAL, "written"),
            (SemanticLevel.ALLUSIVE, "letter / missive"),
            (SemanticLevel.MYSTICAL, "destiny / divine decree"),
        ],
        configuration_id=4,
        vowels=["a", "uu"],
    )
    space.add_morpheme(maktub)

    # --- 5. مَكْتَبَة (maktaba) — "library" ---
    maktaba = create_semitic_morpheme(
        form="مَكْتَبَة",
        root="ك-ت-ب",
        language="ar",
        gloss="library",
        pattern="مَفْعَلَة",
        derivation_degree=2,
        semantic_field="escrita",
        semantic_layers=[
            (SemanticLevel.LITERAL, "library / bookstore"),
        ],
        configuration_id=5,
        vowels=["a", "a", "a"],
    )
    space.add_morpheme(maktaba)

    # --- 6. كُتُب (kutub) — "books" (plural) ---
    kutub = create_semitic_morpheme(
        form="كُتُب",
        root="ك-ت-ب",
        language="ar",
        gloss="books",
        pattern="فُعُل",
        derivation_degree=1,
        semantic_field="escrita",
        semantic_layers=[
            (SemanticLevel.LITERAL, "books (broken plural of kitāb)"),
        ],
        configuration_id=6,
        vowels=["u", "u"],
    )
    space.add_morpheme(kutub)

    # --- 7. كِتَابَة (kitāba) — "writing (act of)" ---
    kitaaba = create_semitic_morpheme(
        form="كِتَابَة",
        root="ك-ت-ب",
        language="ar",
        gloss="writing (act of)",
        pattern="فِعَالَة",
        derivation_degree=1,
        semantic_field="escrita",
        semantic_layers=[
            (SemanticLevel.LITERAL, "writing / the act of writing"),
        ],
        configuration_id=7,
        vowels=["i", "aa", "a"],
    )
    space.add_morpheme(kitaaba)

    # ========================================
    # Display analysis
    # ========================================

    print("📊 Morphemes in the K-T-B space:")
    print("-" * 60)
    for m in space.morphemes:
        coords = m.coordinates
        print(
            f"  {m.form:12s}  ({m.gloss:25s})  "
            f"coords=({coords[0]}, {coords[1]}, {coords[2]})"
        )
    print()

    # --- Distances ---
    print("📐 Distances between morphemes:")
    print("-" * 60)
    for i, m1 in enumerate(space.morphemes):
        for m2 in space.morphemes[i + 1 :]:
            d = m1.distance_to(m2)
            print(f"  {m1.form} ↔ {m2.form}: {d:.2f}")
    print()

    # --- Nearest neighbors for مَكْتُوب ---
    print("🔍 Nearest neighbors of مَكْتُوب (maktūb):")
    print("-" * 60)
    nearest = space.find_nearest(maktub, k=3)
    for m, dist in nearest:
        print(f"  {m.form} ({m.gloss}) — distance: {dist:.2f}")
    print()

    # --- Depth analysis of مَكْتُوب ---
    print("🔬 Semantic depth analysis of مَكْتُوب (maktūb):")
    print("-" * 60)
    for layer in maktub.y.levels:
        print(f"  {layer.level.name:10s}: {layer.meaning}")
    print()

    # --- Space statistics ---
    stats = space.get_statistics()
    print("📈 Space statistics:")
    print("-" * 60)
    print(f"  Total morphemes: {stats['count']}")
    print(f"  X range: {stats['x_range']}")
    print(f"  Y range: {stats['y_range']}")
    print(f"  Z range: {stats['z_range']}")
    print(f"  Unique roots: {stats['unique_roots']}")
    print()

    # --- Derivation tree ---
    tree = space.get_derivation_tree()
    print("🌳 Derivation tree:")
    print("-" * 60)
    for degree, morphemes in sorted(tree.items()):
        print(f"  Degree {degree}:")
        for m in morphemes:
            print(f"    └─ {m.form} ({m.gloss})")
    print()

    # --- Serialization demo ---
    print("💾 Serialization (مَكْتُوب as dict):")
    print("-" * 60)
    d = maktub.to_dict()
    for key, value in d.items():
        print(f"  {key}: {value}")
    print()

    print("✅ Analysis complete!")
    print()
    print("بس״ד | بسم الله الرحمن الرحيم")
    print("Beit Or Ein Sof / Dār Nūr al-Azal")


if __name__ == "__main__":
    main()
