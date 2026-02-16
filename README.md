# Teoria Tridimensional do Morfema
## Three-Dimensional Theory of the Morpheme

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)

**Uma implementaÃ§Ã£o computacional da Teoria Tridimensional do Morfema**  
*A computational implementation of the Three-Dimensional Theory of the Morpheme*

---

## ðŸ“š Sobre o Projeto | About the Project

Este repositÃ³rio implementa computacionalmente a **Teoria Tridimensional do Morfema**, desenvolvida no Ã¢mbito da *Sprachlehre* (Doutrina da LÃ­ngua) pelo projeto **Beit Or Ein Sof / DÄr NÅ«r al-Azal** (Ø¨×™×ª ××•×¨ Ù±×™×Ÿ ×¡×•×£ / Ø¯Ø§Ø± Ù†ÙˆØ± Ù±Ù„Ø£Ø²Ù„ â€” Casa da Luz Infinita).

A teoria propÃµe que o morfema, enquanto unidade mÃ­nima significativa da linguagem, possui **trÃªs dimensÃµes analÃ­ticas irredutÃ­veis**:

### As TrÃªs DimensÃµes | The Three Dimensions

```
                    ALTURA (eixo Z)
                    HEIGHT (Z-axis)
                    Suprassegmental-grÃ¡fica
                    Suprasegmental-graphical
                          â”‚
                          â”‚
        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â†’ LARGURA (eixo X)
        Prefixos    RAIZ/ROOT    Sufixos        WIDTH (X-axis)
        Prefixes               Suffixes         Combinatorial-derivational
                          â”‚
                          â”‚
                          â†“
                    PROFUNDIDADE (eixo Y)
                    DEPTH (Y-axis)
                    HermenÃªutico-semÃ¢ntica
                    Hermeneutic-semantic
```

#### 1. **LARGURA (X)** â€” DimensÃ£o CombinatÃ³rio-Derivacional
- Raiz consonantal + afixos (prefixos, sufixos)
- ExpansÃ£o derivacional
- Contexto sintagmÃ¡tico

#### 2. **PROFUNDIDADE (Y)** â€” DimensÃ£o HermenÃªutico-SemÃ¢ntica
- EstratificaÃ§Ã£o de sentidos
- NÃ­veis interpretativos (literal â†’ alegÃ³rico â†’ mÃ­stico)
- Polissemia estruturada

#### 3. **ALTURA (Z)** â€” DimensÃ£o Suprassegmental-GrÃ¡fica
- DiacrÃ­ticos e sinais vocÃ¡licos
- PontuaÃ§Ã£o hebraica (niqud)
- VocalizaÃ§Ã£o Ã¡rabe (tashkÄ«l)
- RepresentaÃ§Ã£o grÃ¡fica vertical

---

## ðŸŽ¯ Objetivos | Objectives

### ImplementaÃ§Ã£o Computacional
- [x] RepresentaÃ§Ã£o de morfemas em espaÃ§o vetorial 3D
- [x] AnÃ¡lise morfolÃ³gica de lÃ­nguas semÃ­ticas (Ã¡rabe, hebraico)
- [x] Modelagem de profundidade semÃ¢ntica
- [x] Processamento de diacrÃ­ticos e altura grÃ¡fica
- [ ] OCR para manuscritos com aparato diacrÃ­tico
- [ ] DesambiguaÃ§Ã£o semÃ¢ntica estratificada (WSD)
- [ ] VocalizaÃ§Ã£o automÃ¡tica de textos Ã¡rabes e hebraicos

### LÃ­nguas Suportadas
- âœ… Ãrabe (Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©)
- âœ… Hebraico (×¢×‘×¨×™×ª)
- âœ… PortuguÃªs
- âœ… InglÃªs
- ðŸš§ Russo (aspectologia eslava)
- ðŸš§ Mandarim (composiÃ§Ã£o sino-tibetana)
- ðŸš§ SÃ¢nscrito (sistema pÄá¹‡iniano)

---

## ðŸš€ InstalaÃ§Ã£o | Installation

### Requisitos | Requirements
```bash
Python >= 3.8
pip >= 21.0
```

### InstalaÃ§Ã£o via pip
```bash
pip install teoria-tridimensional-morfema
```

### InstalaÃ§Ã£o para desenvolvimento
```bash
git clone https://github.com/marcabru-tech/teoria-tridimensional-morfema.git
cd teoria-tridimensional-morfema
pip install -e ".[dev]"
```

---

## ðŸ’¡ Uso RÃ¡pido | Quick Start

### Exemplo 1: AnÃ¡lise da Raiz Ãrabe K-T-B (ÙƒØªØ¨)

```python
from ttm import MorphemeAnalyzer, Language

# Inicializar analisador
analyzer = MorphemeAnalyzer(language=Language.ARABIC)

# Analisar raiz K-T-B
root = analyzer.analyze_root("Ùƒ-Øª-Ø¨")

# Explorar largura (derivaÃ§Ãµes)
print(root.width.derivations)
# Output: ['ÙƒÙŽØªÙŽØ¨ÙŽ', 'ÙƒØ§ØªÙØ¨', 'Ù…ÙŽÙƒÙ’ØªÙˆØ¨', 'ÙƒÙØªØ§Ø¨', 'Ù…ÙŽÙƒÙ’ØªÙŽØ¨Ø©', ...]

# Explorar profundidade (camadas semÃ¢nticas)
for level in root.depth.semantic_levels:
    print(f"{level.name}: {level.meaning}")
# Output:
# Literal: escrever/escrita
# Cultural: destino (maktÅ«b)
# TeolÃ³gico: decreto divino

# Explorar altura (vocalizaÃ§Ãµes)
word = analyzer.parse("ÙƒØªØ¨")
print(word.height.vocalizations)
# Output: ['ÙƒÙŽØªÙŽØ¨ÙŽ (kataba)', 'ÙƒÙØªÙØ¨ÙŽ (kutiba)', 'ÙƒÙØªÙØ¨ (kutub)']
```

### Exemplo 2: AnÃ¡lise do Hebraico ×ž-×œ-×› (M-L-Kh)

```python
from ttm import MorphemeAnalyzer, Language

analyzer = MorphemeAnalyzer(language=Language.HEBREW)
root = analyzer.analyze_root("×ž-×œ-×›")

# Coordenadas 3D do morfema ×žÖ¶×œÖ¶×šÖ° (mÃ©lekh, "rei")
melekh = root.get_morpheme("×žÖ¶×œÖ¶×šÖ°")
print(melekh.coordinates)
# Output: (x=0, y=1, z=5)  # x: base, y: literal, z: padrÃ£o vocÃ¡lico

# Comparar com ×žÖ¸×œÖ·×šÖ° (malÃ¡kh, "reinou")
malakh = root.get_morpheme("×žÖ¸×œÖ·×šÖ°")
print(malakh.coordinates)
# Output: (x=0, y=1, z=8)  # mesma largura e profundidade, altura diferente
```

### Exemplo 3: DesambiguaÃ§Ã£o por Contexto

```python
# Palavra ambÃ­gua sem vocalizaÃ§Ã£o
ambiguous = analyzer.parse("×ž×œ×š")

# Desambiguar por contexto sintagmÃ¡tico (largura)
context = "×”×ž×œ×š ×’×“×•×œ"
disambiguated = analyzer.disambiguate(ambiguous, context=context)
print(disambiguated.meaning)
# Output: "rei" (nÃ£o "reinou" ou "reinado")
```

---

## ðŸ“– DocumentaÃ§Ã£o Completa | Full Documentation

### Estrutura do CÃ³digo
```
teoria-tridimensional-morfema/
â”œâ”€â”€ ttm/                          # Pacote principal
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ core/                     # NÃºcleo da biblioteca
â”‚   â”‚   â”œâ”€â”€ morpheme.py           # Classe Morpheme
â”‚   â”‚   â”œâ”€â”€ dimensions.py         # DimensÃµes X, Y, Z
â”‚   â”‚   â””â”€â”€ space.py              # EspaÃ§o tridimensional
â”‚   â”œâ”€â”€ analyzers/                # Analisadores por lÃ­ngua
â”‚   â”‚   â”œâ”€â”€ arabic.py             # Analisador Ã¡rabe
â”‚   â”‚   â”œâ”€â”€ hebrew.py             # Analisador hebraico
â”‚   â”‚   â””â”€â”€ indo_european.py      # LÃ­nguas indo-europeias
â”‚   â”œâ”€â”€ nlp/                      # Processamento de linguagem natural
â”‚   â”‚   â”œâ”€â”€ disambiguation.py    # WSD (desambiguaÃ§Ã£o)
â”‚   â”‚   â”œâ”€â”€ vocalization.py      # VocalizaÃ§Ã£o automÃ¡tica
â”‚   â”‚   â””â”€â”€ ocr.py               # Reconhecimento Ã³tico
â”‚   â””â”€â”€ utils/                    # UtilitÃ¡rios
â”‚       â”œâ”€â”€ transliteration.py   # TransliteraÃ§Ã£o
â”‚       â””â”€â”€ visualization.py     # VisualizaÃ§Ã£o 3D
â”œâ”€â”€ tests/                        # Testes unitÃ¡rios
â”œâ”€â”€ examples/                     # Exemplos de uso
â”œâ”€â”€ docs/                         # DocumentaÃ§Ã£o
â””â”€â”€ data/                         # Dados linguÃ­sticos
```

### Classes Principais

#### `Morpheme`
Representa um morfema no espaÃ§o tridimensional.

```python
class Morpheme:
    def __init__(self, form: str, root: str, language: Language):
        self.form = form              # Forma superficial
        self.root = root              # Raiz consonantal
        self.language = language      # LÃ­ngua
        self.x = Width()              # DimensÃ£o X (largura)
        self.y = Depth()              # DimensÃ£o Y (profundidade)
        self.z = Height()             # DimensÃ£o Z (altura)
    
    @property
    def coordinates(self) -> tuple[int, int, int]:
        """Retorna coordenadas (x, y, z) no espaÃ§o morfÃªmico"""
        return (self.x.position, self.y.level, self.z.configuration)
```

#### `Width` (Largura)
DimensÃ£o combinatÃ³rio-derivacional.

```python
class Width:
    def __init__(self):
        self.root: str                    # Raiz nuclear
        self.prefixes: list[str]          # Prefixos
        self.suffixes: list[str]          # Sufixos
        self.pattern: str                 # PadrÃ£o (mishqal/wazn)
        self.syntagmatic_context: str     # Contexto frasal
```

#### `Depth` (Profundidade)
DimensÃ£o hermenÃªutico-semÃ¢ntica.

```python
class Depth:
    def __init__(self):
        self.levels: list[SemanticLevel]
    
    class SemanticLevel:
        LITERAL = 1      # Peshat (×¤×©×˜), áº’Ähir (Ø¸Ø§Ù‡Ø±)
        ALLUSIVE = 2     # Remez (×¨×ž×–)
        HOMILETIC = 3    # Derash (×“×¨×©)
        MYSTICAL = 4     # Sod (×¡×•×“), BÄá¹­in (Ø¨Ø§Ø·Ù†)
```

#### `Height` (Altura)
DimensÃ£o suprassegmental-grÃ¡fica.

```python
class Height:
    def __init__(self):
        self.diacritics: dict           # DiacrÃ­ticos
        self.vowels: list[str]          # Vogais (niqud/tashkÄ«l)
        self.cantillation: list[str]    # Sinais de cantilaÃ§Ã£o
        self.configuration_id: int      # ID da configuraÃ§Ã£o grÃ¡fica
```

---

## ðŸ”¬ Exemplos AvanÃ§ados | Advanced Examples

### AnÃ¡lise Completa com VisualizaÃ§Ã£o 3D

```python
from ttm import MorphemeAnalyzer, Visualizer

analyzer = MorphemeAnalyzer(language=Language.ARABIC)
viz = Visualizer()

# Analisar mÃºltiplas derivaÃ§Ãµes da raiz K-T-B
root = analyzer.analyze_root("Ùƒ-Øª-Ø¨")
morphemes = root.get_all_morphemes()

# Visualizar no espaÃ§o 3D
viz.plot_morpheme_space(morphemes, save_path="ktb_space.html")
# Gera visualizaÃ§Ã£o interativa com plotly
```

### Processamento em Lote

```python
from ttm import BatchProcessor

processor = BatchProcessor(language=Language.HEBREW)

# Analisar texto completo
text = """
×‘Ö°Ö¼×¨Öµ××©Ö´××™×ª ×‘Ö¸Ö¼×¨Ö¸× ×Ö±×œÖ¹×”Ö´×™× ×Öµ×ª ×”Ö·×©Ö¸Ö¼××žÖ·×™Ö´× ×•Ö°×Öµ×ª ×”Ö¸×Ö¸×¨Ö¶×¥
"""

results = processor.process_text(text)

for morpheme in results:
    print(f"{morpheme.form} -> Raiz: {morpheme.root}, "
          f"Coordenadas: {morpheme.coordinates}")
```

### Treinamento de Modelo de DesambiguaÃ§Ã£o

```python
from ttm.nlp import DisambiguationModel

# Carregar corpus anotado
corpus = load_annotated_corpus("data/arabic_corpus.json")

# Treinar modelo
model = DisambiguationModel(language=Language.ARABIC)
model.train(corpus, epochs=10)

# Usar modelo para desambiguar
text = "ÙƒØªØ¨ Ø§Ù„Ø±Ø¬Ù„"
disambiguated = model.predict(text)
print(disambiguated)
# Output: ÙƒÙŽØªÙŽØ¨ÙŽ (kataba, perfectivo) vs ÙƒÙØªÙØ¨ (kutub, plural)
```

---

## ðŸ§ª Testes | Testing

```bash
# Executar todos os testes
pytest

# Testes com cobertura
pytest --cov=ttm --cov-report=html

# Testes especÃ­ficos
pytest tests/test_arabic_analyzer.py
```

---

## ðŸ“Š Datasets

### Dados IncluÃ­dos
- **RaÃ­zes Ã¡rabes**: 10,000+ raÃ­zes trilÃ­teras do LisÄn al-'Arab
- **RaÃ­zes hebraicas**: 8,000+ raÃ­zes do Ben-Yehuda Dictionary
- **PadrÃµes derivacionais**: 200+ mishqalim/awzÄn
- **Corpus anotado**: 50,000+ morfemas com anÃ¡lise tridimensional

### IntegraÃ§Ã£o com Zenodo
Os datasets estÃ£o disponÃ­veis no Zenodo com DOI permanente:
```
https://doi.org/10.5281/zenodo.XXXXXXX
```

---

## ðŸ¤ Contribuindo | Contributing

ContribuiÃ§Ãµes sÃ£o bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

### Ãreas PrioritÃ¡rias
1. ImplementaÃ§Ã£o de analisadores para novas lÃ­nguas
2. ExpansÃ£o dos datasets
3. Melhorias no OCR de manuscritos
4. OtimizaÃ§Ã£o de performance
5. TraduÃ§Ã£o da documentaÃ§Ã£o

---

## ðŸ“œ CitaÃ§Ã£o | Citation

Se vocÃª usar este projeto em pesquisa acadÃªmica, por favor cite:

### BibTeX
```bibtex
@article{machado2026teoria,
  title={A Teoria Tridimensional do Morfema: Uma ContribuiÃ§Ã£o da Sprachlehre Ã  CiÃªncia da Linguagem},
  author={Machado, Guilherme GonÃ§alves},
  journal={Beit Or Ein Sof / DÄr NÅ«r al-Azal},
  year={2026},
  doi={10.5281/zenodo.XXXXXXX},
  url={https://github.com/marcabru-tech/teoria-tridimensional-morfema}
}
```

### APA
```
Machado, G. G. (2026). A Teoria Tridimensional do Morfema: Uma ContribuiÃ§Ã£o 
da Sprachlehre Ã  CiÃªncia da Linguagem. Beit Or Ein Sof / DÄr NÅ«r al-Azal. 
https://doi.org/10.5281/zenodo.XXXXXXX
```

---

## ðŸ“„ LicenÃ§a | License

Este projeto estÃ¡ licenciado sob [CC BY-NC-SA 4.0](LICENSE).

**Creative Commons AtribuiÃ§Ã£o-NÃ£oComercial-CompartilhaIgual 4.0 Internacional**

VocÃª Ã© livre para:
- âœ… Compartilhar â€” copiar e redistribuir
- âœ… Adaptar â€” remixar, transformar e criar a partir do material

Sob as seguintes condiÃ§Ãµes:
- ðŸ“ AtribuiÃ§Ã£o â€” creditar o autor original
- ðŸš« NÃ£o Comercial â€” nÃ£o usar para fins comerciais
- â†©ï¸ CompartilhaIgual â€” distribuir contribuiÃ§Ãµes sob a mesma licenÃ§a

---

## ðŸ‘¥ Autores | Authors

**Guilherme GonÃ§alves Machado**
- Projeto: Beit Or Ein Sof / DÄr NÅ«r al-Azal
- Email: 
- ORCID: 

**HeterÃ´nimos Fundadores:**
- Ezra ben Sefarad (×¢×–×¨× ×‘×Ÿ ×¡×¤×¨×“) â€” TradiÃ§Ã£o hebraico-sefardita
- Ra'uf ibn Hadi al-AndalusÃ­ (Ø±Ø¤ÙˆÙ Ø¨Ù† Ù‡Ø§Ø¯ÙŠ Ø§Ù„Ø£Ù†Ø¯Ù„Ø³ÙŠ) â€” TradiÃ§Ã£o Ã¡rabe-islÃ¢mica

---

## ðŸ”— Links

- ðŸ“„ **Artigo completo**: [PDF no Zenodo](https://doi.org/10.5281/zenodo.XXXXXXX)
- ðŸ“š **DocumentaÃ§Ã£o**: [https://ttm.readthedocs.io](https://ttm.readthedocs.io)
- ðŸ› **Issues**: [GitHub Issues](https://github.com/marcabru-tech/teoria-tridimensional-morfema/issues)
- ðŸ’¬ **DiscussÃµes**: [GitHub Discussions](https://github.com/marcabru-tech/teoria-tridimensional-morfema/discussions)

---

## ðŸ™ Agradecimentos | Acknowledgments

Este projeto dialoga com as seguintes tradiÃ§Ãµes intelectuais:
- PÄá¹‡ini (à¤ªà¤¾à¤£à¤¿à¤¨à¤¿, sÃ©c. Vâ€“IV a.C.) â€” Aá¹£á¹­ÄdhyÄyÄ«
- SÄ«bawayhi (Ø³ÙŠØ¨ÙˆÙŠÙ‡, sÃ©c. VIII) â€” Al-KitÄb
- Al-KhalÄ«l ibn Aá¸¥mad (Ø§Ù„Ø®Ù„ÙŠÙ„ Ø¨Ù† Ø£Ø­Ù…Ø¯, sÃ©c. VIII) â€” KitÄb al-'Ayn
- Rashi (×¨×©"×™, sÃ©c. XI) â€” Exegese talmÃºdica
- Wilhelm von Humboldt (sÃ©c. XIX) â€” Sprachwissenschaft

---

**×‘×¡×´×“ | Ø¨Ø³Ù… Ø§Ù„Ù„Ù‡ Ø§Ù„Ø±Ø­Ù…Ù† Ø§Ù„Ø±Ø­ÙŠÙ…**

*Beit Or Ein Sof / DÄr NÅ«r al-Azal*  
*Casa da Luz Infinita*

