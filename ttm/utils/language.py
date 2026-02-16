"""Language enum and features for supported languages."""

from __future__ import annotations

import enum
from dataclasses import dataclass
from typing import Optional


class Language(enum.Enum):
    """Supported languages with ISO 639-1 codes."""

    # Semitic languages
    ARABIC = "ar"
    HEBREW = "he"
    ARAMAIC = "arc"
    AMHARIC = "am"
    TIGRINYA = "ti"
    MALTESE = "mt"
    SYRIAC = "syc"

    # Indo-European languages
    PORTUGUESE = "pt"
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    RUSSIAN = "ru"
    HINDI = "hi"
    PERSIAN = "fa"
    GREEK = "el"
    LATIN = "la"
    SANSKRIT = "sa"

    # Sino-Tibetan
    CHINESE = "zh"

    # Turkic
    TURKISH = "tr"

    # Japonic
    JAPANESE = "ja"

    # Koreanic
    KOREAN = "ko"

    # Austronesian
    MALAY = "ms"

    # Dravidian
    TAMIL = "ta"


class MorphologicalType(enum.Enum):
    """Morphological typology classification."""

    ISOLATING = "isolating"
    AGGLUTINATIVE = "agglutinative"
    FUSIONAL = "fusional"
    POLYSYNTHETIC = "polysynthetic"
    INTROFLECTIVE = "introflective"  # Non-concatenative (Semitic)


class WritingDirection(enum.Enum):
    """Writing direction."""

    LTR = "left-to-right"
    RTL = "right-to-left"
    TTB = "top-to-bottom"


@dataclass
class LanguageFeatures:
    """Typological and structural features of a language.

    Attributes:
        language: The language.
        morphological_type: Morphological typology.
        writing_direction: Direction of writing.
        has_consonantal_root: Whether the language uses consonantal roots.
        has_diacritics: Whether the language uses diacritical marks.
        has_tonal_system: Whether the language has lexical tone.
        script: Name of the writing system.
        description: Brief description.
    """

    language: Language
    morphological_type: MorphologicalType
    writing_direction: WritingDirection = WritingDirection.LTR
    has_consonantal_root: bool = False
    has_diacritics: bool = False
    has_tonal_system: bool = False
    script: str = ""
    description: str = ""


# Pre-configured features for major languages
LANGUAGE_FEATURES = {
    Language.ARABIC: LanguageFeatures(
        language=Language.ARABIC,
        morphological_type=MorphologicalType.INTROFLECTIVE,
        writing_direction=WritingDirection.RTL,
        has_consonantal_root=True,
        has_diacritics=True,
        script="Arabic",
        description="Arabic — introflective Semitic with trilateral root system and tashkīl",
    ),
    Language.HEBREW: LanguageFeatures(
        language=Language.HEBREW,
        morphological_type=MorphologicalType.INTROFLECTIVE,
        writing_direction=WritingDirection.RTL,
        has_consonantal_root=True,
        has_diacritics=True,
        script="Hebrew",
        description="Hebrew — introflective Semitic with trilateral root system and niqud",
    ),
    Language.PORTUGUESE: LanguageFeatures(
        language=Language.PORTUGUESE,
        morphological_type=MorphologicalType.FUSIONAL,
        writing_direction=WritingDirection.LTR,
        has_diacritics=True,
        script="Latin",
        description="Portuguese — fusional Indo-European with rich verbal morphology",
    ),
    Language.ENGLISH: LanguageFeatures(
        language=Language.ENGLISH,
        morphological_type=MorphologicalType.FUSIONAL,
        writing_direction=WritingDirection.LTR,
        script="Latin",
        description="English — weakly fusional Germanic with analytic tendencies",
    ),
    Language.RUSSIAN: LanguageFeatures(
        language=Language.RUSSIAN,
        morphological_type=MorphologicalType.FUSIONAL,
        writing_direction=WritingDirection.LTR,
        script="Cyrillic",
        description="Russian — fusional Slavic with aspectual pairs and case system",
    ),
    Language.CHINESE: LanguageFeatures(
        language=Language.CHINESE,
        morphological_type=MorphologicalType.ISOLATING,
        writing_direction=WritingDirection.LTR,
        has_tonal_system=True,
        script="Hanzi",
        description="Chinese (Mandarin) — isolating Sino-Tibetan with tonal contrasts",
    ),
    Language.SANSKRIT: LanguageFeatures(
        language=Language.SANSKRIT,
        morphological_type=MorphologicalType.FUSIONAL,
        writing_direction=WritingDirection.LTR,
        has_diacritics=True,
        script="Devanagari",
        description="Sanskrit — Pāṇinian system with complex sandhi and derivation",
    ),
    Language.TURKISH: LanguageFeatures(
        language=Language.TURKISH,
        morphological_type=MorphologicalType.AGGLUTINATIVE,
        writing_direction=WritingDirection.LTR,
        script="Latin",
        description="Turkish — agglutinative Turkic with vowel harmony",
    ),
    Language.JAPANESE: LanguageFeatures(
        language=Language.JAPANESE,
        morphological_type=MorphologicalType.AGGLUTINATIVE,
        writing_direction=WritingDirection.LTR,
        script="Kana/Kanji",
        description="Japanese — agglutinative with multiple writing systems",
    ),
    Language.PERSIAN: LanguageFeatures(
        language=Language.PERSIAN,
        morphological_type=MorphologicalType.FUSIONAL,
        writing_direction=WritingDirection.RTL,
        has_diacritics=True,
        script="Arabic",
        description="Persian — Indo-European written in Arabic script",
    ),
}


def get_features(language: Language) -> Optional[LanguageFeatures]:
    """Get the typological features for a language.

    Args:
        language: A Language enum member.

    Returns:
        LanguageFeatures if available, None otherwise.
    """
    return LANGUAGE_FEATURES.get(language)
