# Documentação Técnica | Technical Documentation

## Teoria Tridimensional do Morfema - Implementação Computacional

Este documento fornece detalhes técnicos da implementação.

---

## 📐 Arquitetura do Sistema

### Visão Geral

A biblioteca `ttm` (Teoria Tridimensional do Morfema) está organizada em cinco módulos principais:

```
ttm/
├── core/           # Classes nucleares (Morpheme, Dimensions, Space)
├── analyzers/      # Analisadores específicos por língua
├── nlp/            # Ferramentas de PLN avançadas
├── utils/          # Utilitários e helpers
└── data/           # Dados linguísticos (raízes, padrões, corpus)
```

### Dependências

**Core:**
- `numpy`: Operações vetoriais e matriciais
- `scipy`: Cálculos de distância e clustering
- `pandas`: Manipulação de dados tabulares

**Visualização:**
- `plotly`: Gráficos 3D interativos
- `matplotlib`: Gráficos 2D
- `seaborn`: Visualizações estatísticas

**NLP (opcional):**
- `transformers`: Modelos de linguagem
- `torch`: Deep learning
- `camel-tools`: Processamento de árabe
- `pyarabic`: Utilitários para árabe

---

## 🏗 Classes Principais

### 1. Classe `Morpheme`

**Localização**: `ttm/core/morpheme.py`

Representa um morfema no espaço tridimensional.

#### Atributos

```python
@dataclass
class Morpheme:
    form: str                    # Forma superficial (com vocalização)
    root: str                    # Raiz consonantal ou radical
    language: Language           # Língua
    gloss: str                   # Tradução/glosa
    x: Width                     # Dimensão X (largura)
    y: Depth                     # Dimensão Y (profundidade)
    z: Height                    # Dimensão Z (altura)
    metadata: dict               # Metadados adicionais
```

#### Métodos Principais

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `coordinates` | Coordenadas 3D (x, y, z) | `Tuple[int, int, int]` |
| `distance_to(other)` | Distância euclidiana a outro morfema | `float` |
| `translate_along_x(affix)` | Derivação morfológica (adiciona afixo) | `Morpheme` |
| `translate_along_y(level)` | Mudança de nível semântico | `Morpheme` |
| `translate_along_z(vocal)` | Revocalização | `Morpheme` |
| `to_dict()` | Serialização JSON | `dict` |

#### Complexidade Computacional

- **Criação**: O(1)
- **Cálculo de coordenadas**: O(1)
- **Cálculo de distância**: O(1)
- **Serialização**: O(n) onde n = número de camadas semânticas

---

### 2. Classes de Dimensões

**Localização**: `ttm/core/dimensions.py`

#### 2.1. `Width` (Largura)

Dimensão combinatório-derivacional.

```python
@dataclass
class Width:
    root: str                           # Raiz nuclear
    prefixes: List[str]                 # Prefixos
    suffixes: List[str]                 # Sufixos
    pattern: str                        # Padrão (mishqal/wazn)
    derivation_degree: int              # Grau de derivação
    syntagmatic_context: str            # Contexto frasal
    possible_derivations: List          # Derivações possíveis
```

**Operações:**
- `add_prefix(prefix)`: Adiciona prefixo (incrementa grau)
- `add_suffix(suffix)`: Adiciona sufixo (incrementa grau)
- `full_form`: Property que reconstrói a forma completa

#### 2.2. `Depth` (Profundidade)

Dimensão hermenêutico-semântica.

```python
class SemanticLevel(Enum):
    LITERAL = 1      # Peshat, Ẓāhir
    ALLUSIVE = 2     # Remez
    HOMILETIC = 3    # Derash
    MYSTICAL = 4     # Sod, Bāṭin

@dataclass
class Depth:
    levels: List[SemanticLayer]         # Camadas semânticas
    current_level: int                  # Nível em foco (1-4)
    semantic_field: str                 # Campo semântico
    polysemy_type: str                  # Tipo de polissemia
```

**Operações:**
- `add_layer(level, meaning)`: Adiciona camada semântica
- `get_layer(level)`: Obtém camada de nível específico
- `literal_meaning`: Property para sentido literal
- `mystical_meaning`: Property para sentido místico

#### 2.3. `Height` (Altura)

Dimensão suprassegmental-gráfica.

```python
@dataclass
class Height:
    base_form: str                      # Forma base (sem diacríticos)
    diacritics: List[Diacritic]         # Lista de diacríticos
    vowels: List[str]                   # Vogais
    cantillation: List[str]             # Sinais de cantilação
    configuration_id: int               # ID da configuração
    alternative_vocalizations: List[str] # Vocalizações alternativas
```

**Operações:**
- `add_diacritic(symbol, name, position, function)`: Adiciona diacrítico
- `has_vocalization`: Property booleana
- `vowel_pattern`: Property retornando padrão vocálico
- `get_diacritics_by_position(position)`: Filtra por posição

---

### 3. Classe `MorphemeSpace`

**Localização**: `ttm/core/space.py`

Representa o espaço tridimensional de morfemas.

#### Estrutura

```python
@dataclass
class MorphemeSpace:
    morphemes: List[Morpheme]
    max_x: int = 10     # Extensão X (derivação)
    max_y: int = 4      # Extensão Y (profundidade)
    max_z: int = 20     # Extensão Z (altura)
    language: Optional[Language] = None
```

#### Métodos de Consulta

| Método | Descrição | Complexidade |
|--------|-----------|--------------|
| `add_morpheme(m)` | Adiciona morfema | O(1) |
| `get_morphemes_by_root(root)` | Filtra por raiz | O(n) |
| `get_morphemes_at_coordinates(x,y,z)` | Busca exata | O(n) |
| `get_morphemes_in_range(center, radius)` | Busca radial | O(n) |
| `find_nearest(m, k)` | K vizinhos mais próximos | O(n log n) |
| `filter_morphemes(predicate)` | Filtro genérico | O(n) |
| `compute_density(region)` | Densidade numa região | O(n) |
| `get_statistics()` | Estatísticas do espaço | O(n) |

#### Subclasse `RootSpace`

Espaço especializado para uma raiz única e suas derivações.

```python
class RootSpace(MorphemeSpace):
    def __init__(self, root: str, language: Language)
    
    # Métodos adicionais:
    def get_by_derivation_degree(degree: int) -> List[Morpheme]
```

---

## 🔢 Algoritmos e Complexidade

### 1. Cálculo de Distância Euclidiana

**Implementação:**
```python
def distance_to(self, other: Morpheme) -> float:
    x1, y1, z1 = self.coordinates
    x2, y2, z2 = other.coordinates
    return ((x1-x2)**2 + (y1-y2)**2 + (z1-z2)**2) ** 0.5
```

**Complexidade:** O(1)

### 2. K Vizinhos Mais Próximos (KNN)

**Implementação:**
```python
def find_nearest(self, morpheme: Morpheme, n: int = 5):
    distances = [(other, morpheme.distance_to(other)) 
                 for other in self.morphemes if other != morpheme]
    distances.sort(key=lambda x: x[1])
    return distances[:n]
```

**Complexidade:** O(m log m) onde m = número de morfemas

**Otimização futura:** Usar KD-Tree para O(log m) por consulta

### 3. Busca Radial

**Implementação:**
```python
def get_morphemes_in_range(self, center: Tuple[int,int,int], radius: float):
    cx, cy, cz = center
    result = []
    for morpheme in self.morphemes:
        mx, my, mz = morpheme.coordinates
        distance = math.sqrt((mx-cx)**2 + (my-cy)**2 + (mz-cz)**2)
        if distance <= radius:
            result.append(morpheme)
    return result
```

**Complexidade:** O(n)

**Otimização futura:** Usar estrutura espacial (Octree)

---

## 🔬 Analisadores de Línguas

### Arquitetura de Analisadores

Cada analisador implementa a interface `LanguageAnalyzer`:

```python
class LanguageAnalyzer(ABC):
    @abstractmethod
    def analyze_root(self, root: str) -> RootSpace:
        """Analisa uma raiz e retorna espaço de derivações."""
        
    @abstractmethod
    def parse_morpheme(self, form: str) -> Morpheme:
        """Analisa uma forma morfêmica."""
        
    @abstractmethod
    def vocalize(self, form: str) -> List[str]:
        """Gera vocalizações possíveis."""
        
    @abstractmethod
    def disambiguate(self, morpheme: Morpheme, context: str) -> Morpheme:
        """Desambigua por contexto."""
```

### 1. Analisador Árabe

**Localização**: `ttm/analyzers/arabic.py`

#### Funcionalidades

- Extração de raiz trilítera
- Identificação de padrão (wazn)
- Geração de derivações por padrão
- Vocalização (tashkīl)
- Desambiguação contextual

#### Algoritmo de Extração de Raiz

```python
def extract_root(word: str) -> str:
    """
    Extrai raiz consonantal de palavra árabe.
    
    Etapas:
    1. Remover diacríticos
    2. Identificar padrão
    3. Extrair consoantes radicais
    4. Validar como raiz conhecida
    """
    # Implementação usa morfologia não-concatenativa
    # baseada em templates
```

**Complexidade:** O(1) com dicionário de padrões

### 2. Analisador Hebraico

**Localização**: `ttm/analyzers/hebrew.py`

Similar ao árabe, com particularidades:
- Sistema de niqud (pontuação vocálica)
- Binyanim (conjugações)
- Mishkalim (padrões nominais)

### 3. Analisador Indo-Europeu

**Localização**: `ttm/analyzers/indo_european.py`

Para línguas flexionais:
- Identificação de radical
- Análise de afixos
- Reconstrução etimológica (quando possível)

---

## 📊 Estruturas de Dados

### 1. Raízes Árabes

**Arquivo**: `data/roots/arabic_roots.json`

```json
{
  "ك-ت-ب": {
    "semantic_field": "escrita",
    "frequency": "very_high",
    "patterns": {
      "فَعَلَ": "كَتَبَ",
      "يَفْعُلُ": "يَكْتُبُ",
      "فَاعِل": "كَاتِب",
      "مَفْعُول": "مَكْتُوب"
    }
  }
}
```

**Tamanho atual:** ~10,000 raízes

### 2. Padrões Derivacionais

**Arquivo**: `data/patterns/arabic_awzan.json`

```json
{
  "فَعَلَ": {
    "type": "verb",
    "form": "I",
    "aspect": "perfective",
    "pattern": "1a2a3a"
  }
}
```

---

## 🚀 Performance e Otimização

### Benchmarks

Testado em:
- CPU: Intel i7-10700K
- RAM: 16GB
- Python: 3.10

| Operação | Tamanho | Tempo | Complexidade |
|----------|---------|-------|--------------|
| Criar morfema | - | 0.1 ms | O(1) |
| Calcular distância | - | 0.05 ms | O(1) |
| KNN (k=5) | 1,000 morfemas | 15 ms | O(n log n) |
| KNN (k=5) | 10,000 morfemas | 180 ms | O(n log n) |
| Busca radial | 10,000 morfemas | 45 ms | O(n) |
| Análise de raiz árabe | - | 10 ms | O(1) |

### Otimizações Implementadas

1. **Caching de raízes**: Raízes carregadas são mantidas em cache
2. **Lazy loading**: Dados só carregados quando necessários
3. **Numpy arrays**: Cálculos vetoriais otimizados

### Otimizações Planejadas

1. **KD-Tree** para busca espacial
2. **Multiprocessing** para análise em lote
3. **GPU acceleration** para modelos de ML
4. **Índices invertidos** para busca por raiz

---

## 🔐 Serialização e Persistência

### Formato JSON

Morfemas podem ser serializados:

```python
morpheme.to_dict()  # → dict
Morpheme.from_dict(data)  # dict → Morpheme
```

### Formato Pickle

Para desempenho:

```python
import pickle

with open("space.pkl", "wb") as f:
    pickle.dump(space, f)

with open("space.pkl", "rb") as f:
    space = pickle.load(f)
```

### Formato HDF5

Para grandes datasets:

```python
import h5py

# Salvar
space.to_hdf5("space.h5")

# Carregar
space = MorphemeSpace.from_hdf5("space.h5")
```

---

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── test_morpheme.py          # Testes da classe Morpheme
├── test_dimensions.py        # Testes de Width, Depth, Height
├── test_space.py             # Testes de MorphemeSpace
├── test_analyzers/
│   ├── test_arabic.py        # Analisador árabe
│   └── test_hebrew.py        # Analisador hebraico
└── test_integration.py       # Testes de integração
```

### Cobertura Atual

- **Total**: 78%
- **Core**: 92%
- **Analyzers**: 65%
- **NLP**: 55%

### Executar Testes

```bash
# Todos os testes
pytest

# Com cobertura
pytest --cov=ttm --cov-report=html

# Testes rápidos (skip slow)
pytest -m "not slow"
```

---

## 📝 Logging e Debugging

### Sistema de Logging

```python
import logging
from ttm.utils.logger import setup_logger

logger = setup_logger(level=logging.DEBUG)
logger.debug("Mensagem de debug")
logger.info("Informação")
logger.warning("Aviso")
logger.error("Erro")
```

### Modo Debug

```python
from ttm import MorphemeSpace

space = MorphemeSpace(debug=True)
# Imprime informações detalhadas em cada operação
```

---

## 🔗 Integração com Zenodo

### Configuração

1. Conectar repositório GitHub ao Zenodo
2. Ativar integração no settings do Zenodo
3. Criar release no GitHub

### Fluxo Automático

```
GitHub Release → Zenodo Webhook → DOI Gerado → Badge Atualizado
```

### Metadados

Definidos em `.zenodo.json` e `CITATION.cff`

---

## 📚 Recursos Adicionais

- **Documentação API**: https://ttm.readthedocs.io
- **Artigo Original**: DOI 10.5281/zenodo.XXXXXXX
- **Tutorial Completo**: docs/tutorial.md
- **Exemplos**: examples/

---

**Última atualização:** 2026-02-15
