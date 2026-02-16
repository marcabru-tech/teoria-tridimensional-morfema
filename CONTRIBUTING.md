# Guia de Contribuição | Contributing Guide

Agradecemos seu interesse em contribuir para a **Teoria Tridimensional do Morfema**! 🎉

Este documento fornece diretrizes para contribuições ao projeto.

---

## 📋 Sumário

1. [Como Contribuir](#como-contribuir)
2. [Código de Conduta](#código-de-conduta)
3. [Relatando Bugs](#relatando-bugs)
4. [Sugerindo Melhorias](#sugerindo-melhorias)
5. [Desenvolvimento](#desenvolvimento)
6. [Estilo de Código](#estilo-de-código)
7. [Testes](#testes)
8. [Documentação](#documentação)
9. [Processo de Pull Request](#processo-de-pull-request)
10. [Áreas Prioritárias](#áreas-prioritárias)

---

## 🤝 Como Contribuir

Existem muitas formas de contribuir:

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 📝 Melhorar a documentação
- 🌍 Adicionar suporte a novas línguas
- 🧪 Escrever testes
- 🔧 Corrigir issues existentes
- 📊 Contribuir com dados linguísticos (raízes, padrões, corpus)
- 📚 Traduzir documentação

---

## 📜 Código de Conduta

Este projeto adota o [Contributor Covenant](https://www.contributor-covenant.org/) como código de conduta.

### Resumo

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Demonstre empatia com outros membros

Comportamentos inaceitáveis:
- Linguagem ou imagens sexualizadas
- Trolling, insultos ou ataques pessoais/políticos
- Assédio público ou privado
- Publicar informações privadas de outros

Violações podem resultar em banimento do projeto.

---

## 🐛 Relatando Bugs

Antes de reportar um bug:

1. **Verifique se já foi reportado**: Busque nas [Issues](https://github.com/[seu-usuario]/teoria-tridimensional-morfema/issues)
2. **Use a versão mais recente**: Atualize para a última versão
3. **Reproduza o bug**: Confirme que o problema persiste

### Como Reportar

Use o template de issue "Bug Report" e forneça:

```markdown
**Descrição do Bug**
Uma descrição clara do que aconteceu.

**Reprodução**
Passos para reproduzir o comportamento:
1. Vá para '...'
2. Execute '...'
3. Observe o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione capturas de tela.

**Ambiente:**
- SO: [e.g. Ubuntu 22.04, macOS 13, Windows 11]
- Python: [e.g. 3.10.5]
- Versão TTM: [e.g. 0.1.0]

**Contexto Adicional**
Qualquer outra informação relevante.
```

---

## 💡 Sugerindo Melhorias

Sugestões de melhorias são bem-vindas! Use o template "Feature Request":

```markdown
**Descrição da Funcionalidade**
Descrição clara da funcionalidade desejada.

**Motivação**
Por que esta funcionalidade seria útil?

**Solução Proposta**
Como você imagina que isso funcionaria?

**Alternativas Consideradas**
Outras abordagens que você considerou?

**Contexto Adicional**
Screenshots, exemplos, referências.
```

---

## 🛠 Desenvolvimento

### Configurando o Ambiente

1. **Fork o repositório**
   ```bash
   # No GitHub, clique em "Fork"
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/SEU-USUARIO/teoria-tridimensional-morfema.git
   cd teoria-tridimensional-morfema
   ```

3. **Crie um ambiente virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # ou
   venv\Scripts\activate  # Windows
   ```

4. **Instale dependências de desenvolvimento**
   ```bash
   pip install -e ".[dev]"
   ```

5. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/meu-bugfix
   ```

### Estrutura do Projeto

```
teoria-tridimensional-morfema/
├── ttm/                      # Código-fonte principal
│   ├── core/                 # Classes nucleares (Morpheme, Dimensions, Space)
│   ├── analyzers/            # Analisadores por língua
│   ├── nlp/                  # Processamento de linguagem natural
│   └── utils/                # Utilitários
├── tests/                    # Testes unitários
├── examples/                 # Exemplos de uso
├── docs/                     # Documentação
├── data/                     # Dados linguísticos
└── scripts/                  # Scripts auxiliares
```

---

## 🎨 Estilo de Código

### Python

Seguimos [PEP 8](https://pep8.org/) com algumas adaptações:

- **Formatação**: Use [Black](https://black.readthedocs.io/)
  ```bash
  black ttm/
  ```

- **Linting**: Use [Flake8](https://flake8.pycqa.org/)
  ```bash
  flake8 ttm/ --max-line-length=100
  ```

- **Type Hints**: Use anotações de tipo
  ```python
  def analyze_morpheme(form: str, root: str) -> Morpheme:
      """Analisa um morfema."""
      ...
  ```

- **Docstrings**: Use formato Google
  ```python
  def function(arg1: str, arg2: int) -> bool:
      """Descrição breve.
      
      Descrição detalhada, se necessário.
      
      Args:
          arg1 (str): Descrição do argumento 1
          arg2 (int): Descrição do argumento 2
          
      Returns:
          bool: Descrição do retorno
          
      Examples:
          >>> function("test", 42)
          True
      """
  ```

### Convenções de Nomenclatura

- **Classes**: `PascalCase` (ex: `MorphemeSpace`)
- **Funções/métodos**: `snake_case` (ex: `analyze_root`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `MAX_DEPTH`)
- **Variáveis privadas**: prefixo `_` (ex: `_internal_cache`)

---

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
pytest

# Com cobertura
pytest --cov=ttm --cov-report=html

# Testes específicos
pytest tests/test_morpheme.py

# Testes de uma função
pytest tests/test_morpheme.py::test_coordinates
```

### Escrevendo Testes

Use `pytest` e siga a estrutura Arrange-Act-Assert:

```python
def test_morpheme_coordinates():
    """Testa coordenadas de um morfema."""
    # Arrange
    morpheme = Morpheme(
        form="كَتَبَ",
        root="ك-ت-ب",
        language=Language.ARABIC
    )
    
    # Act
    coords = morpheme.coordinates
    
    # Assert
    assert isinstance(coords, tuple)
    assert len(coords) == 3
    assert coords[0] >= 0  # X
    assert coords[1] >= 1  # Y
    assert coords[2] >= 0  # Z
```

### Cobertura de Testes

- Alvo: **>80% de cobertura**
- Priorize testes para:
  - Classes nucleares (`Morpheme`, `Width`, `Depth`, `Height`)
  - Analisadores de línguas
  - Funções de processamento

---

## 📖 Documentação

### Documentação de Código

- Todas as classes e funções públicas devem ter docstrings
- Use exemplos em docstrings quando possível
- Mantenha docstrings atualizadas

### Documentação Sphinx

A documentação principal usa [Sphinx](https://www.sphinx-doc.org/):

```bash
cd docs/
make html
# Abrir docs/_build/html/index.html
```

### README

- Mantenha o README.md atualizado
- Adicione novos exemplos à seção "Quick Start"
- Atualize badges se aplicável

---

## 🔀 Processo de Pull Request

### Antes de Submeter

1. ✅ Seu código segue o estilo do projeto
2. ✅ Você adicionou testes
3. ✅ Todos os testes passam
4. ✅ Você atualizou a documentação
5. ✅ Commits seguem mensagens convencionais

### Mensagens de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição breve

[corpo opcional]

[rodapé opcional]
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Apenas documentação
- `style`: Formatação, sem mudança de código
- `refactor`: Refatoração de código
- `test`: Adicionar/modificar testes
- `chore`: Tarefas de manutenção

**Exemplos:**
```
feat(arabic): adiciona suporte a raiz quadrilítera

fix(morpheme): corrige cálculo de distância euclidiana

docs(readme): atualiza exemplo de instalação

test(hebrew): adiciona testes para niqud
```

### Submetendo o PR

1. **Push sua branch**
   ```bash
   git push origin feature/minha-feature
   ```

2. **Abra um Pull Request** no GitHub

3. **Preencha o template** do PR

4. **Aguarde revisão**
   - Responda a comentários
   - Faça ajustes se solicitado
   - Mantenha o PR atualizado com `main`

### Revisão de Código

- Seja receptivo a feedback
- Discuta educadamente se discordar
- Foco na qualidade do código, não na pessoa

---

## 🎯 Áreas Prioritárias

### 1. Analisadores de Línguas

**Alto impacto, boa para iniciantes**

Implementar analisadores para novas línguas:

- [ ] Russo (pares aspectuais)
- [ ] Mandarim (composição)
- [ ] Sânscrito (sistema pāṇiniano)
- [ ] Grego antigo
- [ ] Latim clássico

Template em: `ttm/analyzers/template_analyzer.py`

### 2. Datasets

**Alto impacto, não requer programação**

- Expandir raízes semíticas
- Adicionar corpus anotado
- Coletar exemplos de uso
- Validar dados existentes

### 3. NLP Avançado

**Alto impacto, requer experiência**

- Vocalização automática (árabe/hebraico)
- Desambiguação semântica (WSD)
- OCR para manuscritos
- Modelos de linguagem

### 4. Visualização

**Médio impacto, boa para iniciantes**

- Melhorar gráficos 3D interativos
- Adicionar visualizações 2D
- Criar dashboards analíticos
- Exportar para diferentes formatos

### 5. Performance

**Médio impacto, requer experiência**

- Otimizar algoritmos de distância
- Paralelizar processamento em lote
- Cachear resultados frequentes
- Reduzir uso de memória

### 6. Integração

**Médio impacto, boa para iniciantes**

- API REST
- Plugin Jupyter
- Integração com spaCy
- Integração com NLTK

---

## 📬 Contato

- **Issues**: [GitHub Issues](https://github.com/[seu-usuario]/teoria-tridimensional-morfema/issues)
- **Discussões**: [GitHub Discussions](https://github.com/[seu-usuario]/teoria-tridimensional-morfema/discussions)
- **Email**: [seu-email]

---

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto: **CC BY-NC-SA 4.0**.

---

**Obrigado por contribuir! 🙏**

*Beit Or Ein Sof / Dār Nūr al-Azal*  
*Casa da Luz Infinita*
