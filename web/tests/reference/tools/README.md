# Scripts de montagem do conjunto de referência

Reproduzem `ar.json` e `he.json` a partir das fontes. Elas não ficam no repositório; clone-as num diretório `FONTES`:

```bash
git clone https://github.com/openscriptures/morphhb FONTES/morphhb                # commit 3d15126
git clone https://github.com/openscriptures/HebrewLexicon FONTES/HebrewLexicon    # commit 21c9add
git clone https://github.com/OpenITI/0025AH FONTES/0025AH                         # commit 05bfb1c
```

Depois, com `W` como diretório de trabalho:

```bash
python3 -I he_mine.py FONTES W/he_tokens.json
python3 -I he_build.py W ../he.json          # lê W/he_tokens.json
python3 -I ar_tokens.py FONTES/0025AH/data/0001Quran/0001Quran.Mushaf/0001Quran.Mushaf.Tanzil001-ara1.mARkdown W/ar_tokens.json
python3 -I ar_build.py W ../ar.json          # lê W/ar_tokens.json
```

Atenção: as escolhas de casos (formas, armadilhas e exclusões) estão escritas nos próprios scripts. Elas foram feitas à mão e revisadas; os scripts não as tomam automaticamente.
