"""Gera contexto.md da tarefa revisao-motor a partir dos dois repositórios.

Uso: python3 -I build-context.py <clone do TTM> <clone do algebra-hexarrelacional> <saída contexto.md>
"""
import subprocess
import sys
from pathlib import Path

TTM, ALG, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])

TTM_FILES = [
    "web/src/lib/ttm/types.ts",
    "web/src/lib/ttm/analyzer.ts",
    "web/src/lib/ttm/arabic.ts",
    "web/src/lib/ttm/hebrew.ts",
    "web/src/lib/ttm/generic.ts",
    "web/src/app/api/analyze/route.ts",
    "data/roots/arabic_roots.json",
    "data/roots/hebrew_roots.json",
    "ttm/analyzers/base.py",
    "ttm/analyzers/arabic.py",
    "ttm/analyzers/hebrew.py",
    "web/tests/reference/README.md",
    "web/tests/reference/normalize.mjs",
    "web/tests/reference/linha-de-base.md",
]
ALG_FILES = [
    "README.md",
    "TERMS.md",
    "core/operator.py",
    "core/relations.py",
    "core/modes.py",
    "gurumatrix/tensor.py",
    "ipii/transpiler.py",
    "src/lib/relations.ts",
    "docs/ARCHITECTURE.md",
]
LANG = {".ts": "ts", ".py": "python", ".json": "json", ".md": "markdown", ".mjs": "js"}

RESUMO = """# Pacote de contexto — revisão do motor do TTM

## Resumo do projeto e regras em vigor

- **TTM (Teoria Tridimensional do Morfema):** analisa morfemas em três dimensões: largura (raiz e afixos), profundidade (camadas de sentido) e altura (diacríticos). O escopo do produto é o **árabe clássico/corânico** e o **hebraico bíblico**.
- **Motor em produção:** TypeScript, em `web/src/lib/ttm/`, servido pela API Next.js `POST /api/analyze` `{text, language}`. O motor Python (`ttm/`) só será comparado no S3.
- **Base atual:** 20 raízes árabes e 5 hebraicas, em `data/roots/`; o site usa uma cópia idêntica.
- **Conjunto de referência (S2.1, já aprovado):** 140 casos, sendo 80 árabes (40 cobertos, 20 fora da cobertura, 20 armadilhas) e 60 hebraicos (30, 15 e 15). O README e a linha de base estão no pacote.
- **Metas do S2.2:**
  - acerto exato nas formas de raízes cobertas: pelo menos 90%;
  - falsos positivos nas armadilhas: zero;
  - raízes inventadas fora da cobertura: zero.

  A comparação de raízes usa `normalize.mjs`, que preserva a distinção sin/shin.
- **Regras (pareceres aprovados):**
  - o motor não inventa raiz; sem evidência, a resposta é "raiz não identificada";
  - interpretação hermenêutica não é apresentada como significado lexical;
  - cada mudança vem numa PR pequena, com revisão independente;
  - nada de comparação com CAMeL Tools ou DictaBERT, nem de corpora inteiros, no S2.
- **Álgebra Hexarrelacional:** é do mesmo autor. A posição aprovada é usar a arquitetura (relações como camada de evidência rastreável) só se um experimento mostrar ganho contra o conjunto de referência. O operador Π, iterado, converge para 1 e não serve como métrica.

## Arquivos
"""


def rev(repo):
    return subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()


def block(repo_name, commit, license_, root, rel):
    p = root / rel
    text = p.read_text(encoding="utf-8")
    fence = "````" if "```" in text else "```"
    lang = LANG.get(p.suffix, "")
    return (f"\n### `{rel}`\n\nRepositório: {repo_name} · commit `{commit[:7]}` · licença: {license_}\n\n"
            f"{fence}{lang}\n{text.rstrip()}\n{fence}\n")


parts = [RESUMO, "\n## Parte 1 — TTM (marcabru-tech/teoria-tridimensional-morfema)\n"]
c_ttm = rev(TTM)
for f in TTM_FILES:
    parts.append(block("marcabru-tech/teoria-tridimensional-morfema", c_ttm, "CC BY-NC-SA 4.0 (dados de terceiros conforme README do conjunto)", TTM, f))
parts.append("\n## Parte 2 — Álgebra Hexarrelacional (marcabru-tech/algebra-hexarrelacional)\n")
c_alg = rev(ALG)
for f in ALG_FILES:
    parts.append(block("marcabru-tech/algebra-hexarrelacional", c_alg, "PolyForm Noncommercial 1.0.0 (ver TERMS.md)", ALG, f))
OUT.write_text("".join(parts), encoding="utf-8")
print(f"{OUT}: {OUT.stat().st_size / 1024:.0f} KB; TTM@{c_ttm[:7]}, algebra@{c_alg[:7]}")
