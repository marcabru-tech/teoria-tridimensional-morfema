"""
Teoria Tridimensional do Morfema (TTM)
======================================

Uma implementação computacional da Teoria Tridimensional do Morfema,
que propõe três dimensões analíticas irredutíveis:

- **Largura (X)**: Dimensão combinatório-derivacional
- **Profundidade (Y)**: Dimensão hermenêutico-semântica
- **Altura (Z)**: Dimensão suprassegmental-gráfica
"""

__version__ = "0.1.0"
__author__ = "Guilherme Gonçalves Machado"
__license__ = "CC BY-NC-SA 4.0"

from ttm.core.morpheme import Morpheme
from ttm.core.dimensions import Width, Depth, Height, SemanticLevel, SemanticLayer, Diacritic
from ttm.core.space import MorphemeSpace, RootSpace
from ttm.utils.language import Language, LanguageFeatures

__all__ = [
    "Morpheme",
    "Width",
    "Depth",
    "Height",
    "SemanticLevel",
    "SemanticLayer",
    "Diacritic",
    "MorphemeSpace",
    "RootSpace",
    "Language",
    "LanguageFeatures",
]
