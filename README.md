# Teoria Tridimensional do Morfema
## Three-Dimensional Theory of the Morpheme

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18662347.svg)](https://doi.org/10.5281/zenodo.18662347)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)

**Uma implementação computacional da Teoria Tridimensional do Morfema**  
*A computational implementation of the Three-Dimensional Theory of the Morpheme*

---

## 📚 Sobre o Projeto | About the Project

Este repositório implementa computacionalmente a **Teoria Tridimensional do Morfema**, desenvolvida no âmbito da *Sprachlehre* (Doutrina da Língua) pelo projeto **Beit Or Ein Sof / Dār Nūr al-Azal** (בית אור אין סוף / دار نور الأزل — Casa da Luz Infinita).

A teoria propõe que o morfema, enquanto unidade mínima significativa da linguagem, possui **três dimensões analíticas irredutíveis**:

### As Três Dimensões | The Three Dimensions

```
                    ALTURA (eixo Z)
                    HEIGHT (Z-axis)
                    Suprassegmental-gráfica
                    Suprasegmental-graphical
                          │
                          │
        ──────────────────┼──────────────────→ LARGURA (eixo X)
        Prefixos    RAIZ/ROOT    Sufixos        WIDTH (X-axis)
        Prefixes               Suffixes         Combinatorial-derivational
                          │
                          │
                          ↓
                    PROFUNDIDADE (eixo Y)
                    DEPTH (Y-axis)
                    Hermenêutico-semântica
                    Hermeneutic-semantic
```

#### 1. **LARGURA (X)** — Dimensão Combinatório-Derivacional
- Raiz consonantal + afixos (prefixos, sufixos)
- Expansão derivacional
- Contexto sintagmático

#### 2. **PROFUNDIDADE (Y)** — Dimensão Hermenêutico-Semântica
- Estratificação de sentidos
- Níveis interpretativos (literal → alegórico → místico)
- Polissemia estruturada

#### 3. **ALTURA (Z)** — Dimensão Suprassegmental-Gráfica
- Diacríticos e sinais vocálicos
- Pontuação hebraica (niqud)
- Vocalização árabe (tashkīl)
- Representação gráfica vertical

---

## 🎯 Objetivos | Objectives

### Implementação Computacional
- [x] Representação de morfemas em espaço vetorial 3D
- [x] Análise morfológica de línguas semíticas (árabe, hebraico)
- [x] Modelagem de profundidade semântica
- [x] Processamento de diacríticos e altura gráfica
- [ ] OCR para manuscritos com aparato diacrítico
- [ ] Desambiguação semântica estratificada (WSD)
- [ ] Vocalização automática de textos árabes e hebraicos

### Línguas Suportadas
- ✅ **Árabe** (Análise Automática Completa)
- ✅ **Hebraico** (Análise Automática Completa)
- ✅ **Português** (Análise Morfológica Base)
- ✅ **Inglês** (Análise Morfológica Base)
- ✅ **Russo** (Suporte a Aspecto e Acentuação)
- ✅ **Mandarim** (Suporte a Tons e Pinyin)
- ✅ **Sânscrito** (Suporte a Raízes e Conjugação)

---

## 🚀 Instalação | Installation

### Requisitos | Requirements
```bash
Python >= 3.8
pip >= 21.0
```

### Instalação via pip
```bash
pip install teoria-tridimensional-morfema
```

### Instalação para desenvolvimento
```bash
git clone https://github.com/marcabru-tech/teoria-tridimensional-morfema.git
cd teoria-tridimensional-morfema
pip install -e ".[dev]"
```

---

## 💡 Uso Rápido | Quick Start

### Exemplo 1: Análise da Raiz Árabe K-T-B (كتب)

```python
from ttm import MorphemeAnalyzer, Language

# Inicializar analisador
analyzer = MorphemeAnalyzer(language=Language.ARABIC)

# Analisar raiz K-T-B
root = analyzer.analyze_root("ك-ت-ب")

# Explorar largura (derivações)
print(root.width.derivations)
# Output: ['كَتبَ', 'كاتِب', 'مَكْتوب', 'كِتاب', 'مَكْتَبة', ...]

# Explorar profundidade (camadas semânticas)
for level in root.depth.semantic_levels:
    print(f"{level.name}: {level.meaning}")
# Output:
# Literal: escrever/escrita
# Cultural: destino (maktūb)
# Teológico: decreto divino

# Explorar altura (vocalizações)
word = analyzer.parse("كتب")
print(word.height.vocalizations)
# Output: ['كَتَبَ (kataba)', 'كُتِبَ (kutiba)', 'كُتُب (kutub)']
```

### Exemplo 2: Análise do Hebraico מ-ל-כ (M-L-Kh)

```python
from ttm import MorphemeAnalyzer, Language

analyzer = MorphemeAnalyzer(language=Language.HEBREW)
root = analyzer.analyze_root("מ-ל-ך")

# Coordenadas 3D do morfema מֶלֶךְ (mélekh, "rei")
melekh = root.get_morpheme("מֶלֶךְ")
print(melekh.coordinates)
# Output: (x=0, y=1, z=5)  # x: base, y: literal, z: padrão vocálico

# Comparar com מָלַךְ (malákh, "reinou")
malakh = root.get_morpheme("מָלַךְ")
print(malakh.coordinates)
# Output: (x=0, y=1, z=8)  # mesma largura e profundidade, altura diferente
```

### Exemplo 3: Desambiguação por Contexto

```python
# Palavra ambígua sem vocalização
ambiguous = analyzer.parse("מלך")

# Desambiguar por contexto sintagmático (largura)
context = "המלך גדול"
disambiguated = analyzer.disambiguate(ambiguous, context=context)
print(disambiguated.meaning)
# Output: "rei" (não "reinou" ou "reinado")
```

---

## 📖 Documentação Completa | Full Documentation

### Estrutura do Código
```
teoria-tridimensional-morfema/
├── ttm/                          # Pacote principal
│   ├── __init__.py
│   ├── core/                     # Núcleo da biblioteca
│   │   ├── morpheme.py           # Classe Morpheme
│   │   ├── dimensions.py         # Dimensões X, Y, Z
│   │   └── space.py              # Espaço tridimensional
│   ├── analyzers/                # Analisadores por língua
│   │   ├── arabic.py             # Analisador árabe
│   │   ├── hebrew.py             # Analisador hebraico
│   │   └── indo_european.py      # Línguas indo-europeias
│   ├── nlp/                      # Processamento de linguagem natural
│   │   ├── disambiguation.py    # WSD (desambiguação)
│   │   ├── vocalization.py      # Vocalização automática
│   │   └── ocr.py               # Reconhecimento ótico
│   └── utils/                    # Utilitários
│       ├── transliteration.py   # Transliteração
│       └── visualization.py     # Visualização 3D
├── tests/                        # Testes unitários
├── examples/                     # Exemplos de uso
├── docs/                         # Documentação
└── data/                         # Dados linguísticos
```

### Classes Principais

#### `Morpheme`
Representa um morfema no espaço tridimensional.

```python
class Morpheme:
    def __init__(self, form: str, root: str, language: Language):
        self.form = form              # Forma superficial
        self.root = root              # Raiz consonantal
        self.language = language      # Língua
        self.x = Width()              # Dimensão X (largura)
        self.y = Depth()              # Dimensão Y (profundidade)
        self.z = Height()             # Dimensão Z (altura)
    
    @property
    def coordinates(self) -> tuple[int, int, int]:
        """Retorna coordenadas (x, y, z) no espaço morfêmico"""
        return (self.x.position, self.y.level, self.z.configuration)
```

#### `Width` (Largura)
Dimensão combinatório-derivacional.

```python
class Width:
    def __init__(self):
        self.root: str                    # Raiz nuclear
        self.prefixes: list[str]          # Prefixos
        self.suffixes: list[str]          # Sufixos
        self.pattern: str                 # Padrão (mishqal/wazn)
        self.syntagmatic_context: str     # Contexto frasal
```

#### `Depth` (Profundidade)
Dimensão hermenêutico-semântica.

```python
class Depth:
    def __init__(self):
        self.levels: list[SemanticLevel]
    
    class SemanticLevel:
        LITERAL = 1      # Peshat (פשט), Ẓāhir (ظاهر)
        ALLUSIVE = 2     # Remez (רמז)
        HOMILETIC = 3    # Derash (דרש)
        MYSTICAL = 4     # Sod (סוד), Bāṭin (باطن)
```

#### `Height` (Altura)
Dimensão suprassegmental-gráfica.

```python
class Height:
    def __init__(self):
        self.diacritics: dict           # Diacríticos
        self.vowels: list[str]          # Vogais (niqud/tashkīl)
        self.cantillation: list[str]    # Sinais de cantilação
        self.configuration_id: int      # ID da configuração gráfica
```

---

## 🔬 Exemplos Avançados | Advanced Examples

### Análise Completa com Visualização 3D

```python
from ttm import MorphemeAnalyzer, Visualizer

analyzer = MorphemeAnalyzer(language=Language.ARABIC)
viz = Visualizer()

# Analisar múltiplas derivações da raiz K-T-B
root = analyzer.analyze_root("ك-ت-ب")
morphemes = root.get_all_morphemes()

# Visualizar no espaço 3D
viz.plot_morpheme_space(morphemes, save_path="ktb_space.html")
# Gera visualização interativa com plotly
```

### Processamento em Lote

```python
from ttm import BatchProcessor

processor = BatchProcessor(language=Language.HEBREW)

# Analisar texto completo
text = """
בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ
"""

results = processor.process_text(text)

for morpheme in results:
    print(f"{morpheme.form} -> Raiz: {morpheme.root}, "
          f"Coordenadas: {morpheme.coordinates}")
```

---

## 📊 Datasets

### Dados Incluídos
- **Raízes árabes**: 10,000+ raízes trilíteras do Lisān al-'Arab
- **Raízes hebraicas**: 8,000+ raízes do Ben-Yehuda Dictionary
- **Padrões derivacionais**: 200+ mishqalim/awzān
- **Corpus anotado**: 50,000+ morfemas com análise tridimensional

### Integração com Zenodo
Os datasets estão disponíveis no Zenodo com DOI permanente:
```
https://doi.org/10.5281/zenodo.18662347
```

---

## 🤝 Contribuindo | Contributing

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

### Áreas Prioritárias
1. Implementação de analisadores para novas línguas
2. Expansão dos datasets
3. Melhorias no OCR de manuscritos
4. Otimização de performance
5. Tradução da documentação

---

## 📜 Citação | Citation

Se você usar este projeto em pesquisa acadêmica, por favor cite:

### BibTeX
```bibtex
@article{machado2026teoria,
  title={A Teoria Tridimensional do Morfema: Uma Contribuição da Sprachlehre à Ciência da Linguagem},
  author={Machado, Guilherme Gonçalves},
  journal={Beit Or Ein Sof / Dār Nūr al-Azal},
  year={2026},
  doi={10.5281/zenodo.18662347},
  url={https://github.com/marcabru-tech/teoria-tridimensional-morfema}
}
```

### APA
```
Machado, G. G. (2026). A Teoria Tridimensional do Morfema: Uma Contribuição 
da Sprachlehre à Ciência da Linguagem. Beit Or Ein Sof / Dār Nūr al-Azal. 
https://doi.org/10.5281/zenodo.18662347
```

---

## 📄 Licença | License

Este projeto está licenciado sob [CC BY-NC-SA 4.0](LICENSE).

**Creative Commons Atribuição-NãoComercial-CompartilhaIgual 4.0 Internacional**

Você é livre para:
- ✅ Compartilhar — copiar e redistribuir
- ✅ Adaptar — remixar, transformar e criar a partir do material

Sob as seguintes condições:
- 📝 Atribuição — creditar o autor original
- 🚫 Não Comercial — não usar para fins comerciais
- ↩️ CompartilhaIgual — distribuir contribuições sob a mesma licença

---

## 👥 Autores | Authors

**Guilherme Gonçalves Machado**
- **Projeto**: Beit Or Ein Sof / Dār Nūr al-Azal (בית אור אין סוף / دار نور الأزل)
- **GitHub**: [marcabru-tech](https://github.com/marcabru-tech)
- **Email**: guilherme.machado@marcabru.tech 

**Heterônimos Fundadores:**
- Ezra ben Sefarad (עזרא בן ספרד) — Tradição hebraico-sefardita
- Ra'uf ibn Hadi al-Andalusī (رؤوف بن هادي الأندلسي) — Tradição árabe-islâmica

---

## 🔗 Links

- 📄 **Artigo completo**: [PDF no Zenodo](https://doi.org/10.5281/zenodo.18662347)
- 📚 **Documentação**: [https://ttm.readthedocs.io](https://ttm.readthedocs.io)
- 🐛 **Issues**: [GitHub Issues](https://github.com/marcabru-tech/teoria-tridimensional-morfema/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/marcabru-tech/teoria-tridimensional-morfema/discussions)

---

## 🙏 Agradecimentos | Acknowledgments

Este projeto dialoga com as seguintes tradições intelectuais:
- Pāṇini (पाणिनि, séc. V–IV a.C.) — Aṣṭādhyāyī
- Sībawayhi (سيبويه, séc. VIII) — Al-Kitāb
- Al-Khalīl ibn Aḥmad (الخليل بن أحمد, séc. VIII) — Kitāb al-'Ayn
- Rashi (רש"י, séc. XI) — Exegese talmúdica
- Wilhelm von Humboldt (séc. XIX) — Sprachwissenschaft

---

**בס״ד | بسم الله الرحمن الرحيم**

*Beit Or Ein Sof / Dār Nūr al-Azal*  
*Casa da Luz Infinita*
