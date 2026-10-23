"""Lê o texto Tanzil (Simple Clean 1.1) do espelho OpenITI e grava ar_tokens.json.

Junta as linhas de continuação (~~), ignora os marcadores de página ms… (inclusive no
cabeçalho do versículo) e descarta a basmala prefixada ao versículo 1 das suras 2 a 114.
Cada token: (sura, versículo, palavra, forma, palavra_no_Quranic_Arabic_Corpus).
Uso: python3 ar_tokens.py <arquivo .mARkdown> <saída ar_tokens.json>
"""
import json, re, sys

Q, OUT = sys.argv[1], sys.argv[2]
BAS = ["بسم", "الله", "الرحمن", "الرحيم"]
H = re.compile(r"^# (\d+)(?: ms\d+)?\|(\d+)(?: ms\d+)?\| ?(.*)$")
ayas, cur = [], None
for line in open(Q, encoding="utf-8"):
    line = line.rstrip("\n")
    m = H.match(line)
    if m:
        cur = [int(m.group(1)), int(m.group(2)), m.group(3)]
        ayas.append(cur)
    elif line.startswith("~~") and cur is not None:
        cur[2] += " " + line[2:]
assert len(ayas) == 6236, len(ayas)
toks = []
for s, a, txt in ayas:
    words = [w for w in txt.split() if not re.fullmatch(r"ms\d+", w)]
    if s > 1 and a == 1 and words[:4] == BAS:
        words = words[4:]
    for i, w in enumerate(words, 1):
        # no corpus, «يا» vem unido à palavra seguinte
        toks.append((s, a, i, w, i - sum(1 for x in words[: i - 1] if x == "يا")))
json.dump(toks, open(OUT, "w"), ensure_ascii=False)
print("versículos", len(ayas), "tokens", len(toks))
