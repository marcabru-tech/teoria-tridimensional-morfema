# Conjunto de referência do TTM (S2.1)

Casos com fonte para medir o motor morfológico do TTM em **árabe corânico** e **hebraico bíblico**.
É uma linha de base inicial (140 casos). Não prova que o analisador domina essas variedades.

| Arquivo | Casos | Cobertas | Fora da cobertura | Armadilhas |
| --- | --- | --- | --- | --- |
| `ar.json` | 80 | 40 | 20 | 20 |
| `he.json` | 60 | 30 | 15 | 15 |

## Categorias

- **coberta**: forma de uma raiz presente na base do TTM. O motor deve devolver essa raiz.
- **fora_da_cobertura**: forma legítima de uma raiz ausente da base. O motor deve devolver "raiz não identificada".
- **armadilha**: forma que contém letras de uma raiz coberta, em sequência, contida nela ou como anagrama, sem pertencer a ela. Qualquer raiz coberta devolvida é falso positivo.

A categoria e a saída esperada de cada caso foram definidas antes de avaliar o motor.

## Campos de cada caso

- `attested_form`: a forma exatamente como está na fonte, sem alteração.
- `input`: o que é enviado ao motor. Quando difere da forma atestada, `input_derivation` explica a diferença. No hebraico, só são removidos os separadores de morfema `/` do OSHB.
- `expected`: a raiz esperada e a saída esperada.
- `reference_root`: a raiz segundo a fonte lexical, também nos casos fora da cobertura e nas armadilhas.
- `source`: corpus, localização exata, versão e licença.
- `root_evidence`: de onde vem a raiz esperada.
- `review`: quem propôs e quem revisou o caso. Guilherme revisa o conjunto inteiro antes do S2.2.

## Fontes e licenças

| Fonte | Uso | Versão | Licença |
| --- | --- | --- | --- |
| [Tanzil](https://tanzil.net) | formas árabes, copiadas literalmente | Tanzil Quran Text (Simple Clean, Version 1.1), via espelho [OpenITI/0025AH](https://github.com/OpenITI/0025AH) no commit `05bfb1c` | Creative Commons Attribution 3.0; cópia literal permitida, alteração proibida, citar o Tanzil e linkar tanzil.net |
| [Open Scriptures Hebrew Bible](https://github.com/openscriptures/morphhb) | formas hebraicas, lemas e morfologia | `morphhb@3d15126` | CC BY 4.0 |
| [Open Scriptures Hebrew Lexicon](https://github.com/openscriptures/HebrewLexicon) | raiz hebraica, pela cadeia Strong → BDB do `LexicalIndex.xml` | `HebrewLexicon@21c9add` | CC BY 4.0 (texto de BDB e Strong em domínio público) |
| Lane, *An Arabic-English Lexicon* (1863–1893) | raiz árabe, citada pelo verbete da edição impressa | — | domínio público; nenhuma edição digital foi usada |
| [Quranic Arabic Corpus](https://corpus.quran.com) 0.4 | só conferência, pela localização da palavra | — | GNU GPL, uso não comercial e só cópia literal: **nenhum dado foi copiado** |

**Atribuições exigidas:**

- Texto corânico: Tanzil Project (https://tanzil.net), Tanzil Quran Text (Simple Clean, Version 1.1), Copyright (C) 2007-2021 Tanzil Project, Creative Commons Attribution 3.0. As formas foram copiadas literalmente, sem alteração. Atualizações em https://tanzil.net/updates/.
- Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb.
- Open Scriptures Hebrew Lexicon, Open Scriptures Hebrew Bible Project, https://github.com/openscriptures/HebrewLexicon.

## Observações de método

- **Localização no árabe:** `location` é sura:versículo, e `word` é a posição da palavra no texto Simple Clean. A leitura do espelho OpenITI:
  - junta as linhas de continuação (`~~`);
  - ignora os 253 marcadores de página (`ms…`), inclusive os que aparecem no cabeçalho do versículo;
  - descarta a basmala que esta cópia prefixa ao versículo 1 das suras 2 a 114.

  O resultado são 6.236 versículos.
- **Posição no Quranic Arabic Corpus:** fica em `root_evidence.cross_check.location`. É a posição no Simple Clean menos uma para cada «يا» anterior no versículo, porque no texto uthmânico do corpus «يا» vem unido à palavra seguinte. Uma amostra de 28 páginas do corpus foi conferida na revisão.
- **Raiz no hebraico:** a raiz vem do OSHB (lema Strong aumentado) ligado ao `LexicalIndex.xml`, seguindo a etimologia até a entrada de raiz do BDB. Homônimos de mesma raiz, como ברא I e ברא II, ficaram fora das formas cobertas. Os casos fora da cobertura são só verbos, porque partículas e alguns substantivos têm raiz conjectural no BDB.
- **Posição no hebraico:** `word` conta todos os `<w>` do versículo no OSHB, incluindo o qere que fica dentro de `<note>`. O `oshb_id` identifica a palavra sem ambiguidade.
- **Comparação de raízes:** o avaliador (`normalize.mjs`) remove hífens, diacríticos árabes e sinais hebraicos, mas **preserva a distinção entre sin (שׂ) e shin (שׁ)**. ש sem ponto conta como shin, que é a convenção da base.
- **Casos retirados na revisão:**
  - `فعلي` (11:35) também se lê *fiʿlī* ("meu ato"), da própria raiz ف-ع-ل.
  - `בָרָא` (2Sm 12:17) é tratado como homônimo de ברא por parte dos léxicos.
  - `ב/מלכן` (2Sm 12:31) é um ketiv sem vogais e de raiz disputada.
  - `מַשְׂמְרוֹת` (Ecl 12:11, antigo `he-059`), retirado no parecer da Luna. O BDB liga a forma a מַסְמֵר ("prego", com samekh) e marca a conexão etimológica como duvidosa, embora a forma seja grafada com sin. Um caso de sin/shin precisa de raiz de referência segura antes de entrar na avaliação.

  Os três hebraicos estão listados em `excluded` no `he.json`.

## Como rodar

Com o site rodando (`npm run build && npm run start`), dentro de `web/`:

```bash
node tests/reference/evaluate.mjs http://localhost:3000 --report tests/reference/linha-de-base.md
```

Sem `--enforce`, o script sempre termina com sucesso: ele registra a linha de base. A partir do S2.2, `--enforce` falha se alguma meta não for atingida:

- acerto exato nas cobertas: pelo menos 90%;
- falsos positivos nas armadilhas: 0;
- raízes inventadas fora da cobertura: 0.

O relatório do motor atual, antes de qualquer correção, está em `linha-de-base.md`.

## Testes do próprio conjunto

```bash
node --test tests/reference/normalize.test.mjs            # normalização (inclui sin/shin) e argumentos do avaliador
cd tests/reference/tools && python3 -m unittest test_he_build   # construtor hebraico com tokens sem morfologia
```

Os dois rodam no CI, no job `web`.
