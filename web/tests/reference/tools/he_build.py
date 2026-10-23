"""Monta web/tests/reference/he.json a partir dos tokens minerados do OSHB."""
import json, re, sys

S, OUT = sys.argv[1], sys.argv[2]
t = json.load(open(S + "/he_tokens.json"))
MARK = re.compile("[֑-ׇ/⁠־]")
FIN = str.maketrans("ךםןףץ", "כמנפצ")
cons = lambda f: MARK.sub("", f)
norm = lambda s: MARK.sub("", s).translate(FIN)

OSHB = {"corpus": "Open Scriptures Hebrew Bible (OSHB), base: Westminster Leningrad Codex",
        "url": "https://github.com/openscriptures/morphhb",
        "version": "morphhb@3d15126fb1ef74867fc1434be1942e837932691f",
        "license": "CC BY 4.0"}
LEX = {"lexicon": "Open Scriptures Hebrew Lexicon, LexicalIndex.xml (Strong ↔ BDB, cadeia etimológica)",
       "url": "https://github.com/openscriptures/HebrewLexicon",
       "version": "HebrewLexicon@21c9add13bc727d3a951361778e97e3ff7afd1ce",
       "license": "CC BY 4.0 (texto de BDB e Strong em domínio público)"}

COVERED = {"מלך": ("haj", "מ-ל-ך"), "שׁמר": ("nbf", "שׁ-מ-ר"), "כתב": ("gaa", "כ-ת-ב"),
           "אהב": ("agk", "א-ה-ב"), "ברא": ("bxy", "ב-ר-א")}
# formas escolhidas (consoantes, sem marcas) por raiz coberta; primeira ocorrência no OSHB
PICK_COVERED = {
    "מלך": ["מלך", "המלך", "וימלך", "מלכות", "ממלכה", "במלכותו"],
    "שׁמר": ["שמר", "לשמר", "שמרים", "משמרת", "ושמרו", "ישמר"],
    "כתב": ["כתב", "ויכתב", "הכתוב", "כתובים", "מכתב", "בכתב"],
    "אהב": ["אהב", "ויאהב", "אהבה", "ואהבת", "אהבתך", "לאהבה"],
    "ברא": ["ברא", "ויברא", "בראם", "בורא", "נברא", "בריאה"],
}
PICK_TRAPS = [("בראשית", "Gen.1.1"), ("בראש", "1Chr.16.7"), ("בראות", "1Chr.21.28"),
              ("בראתו", "2Sam.24.17"), ("בראה", "Isa.28.7"), ("בראשון", "Ezek.29.17"),
              ("גמלך", "1Sam.1.23"), ("מלכת", "1Sam.30.21"), ("ומלכדתו", "Job.18.10"),
              ("מלכד", "Prov.3.26"), ("גמלכם", "Joel.4.4"), ("כתבונם", "Hos.13.2"),
              ("כתבנית", "Isa.44.13"), ("וכמשמרות", "Eccl.12.11"), ("כתבואת", "Num.18.30")]
BOOK_ORDER = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs",
              "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam",
              "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal"]
order = {b: i for i, b in enumerate(BOOK_ORDER)}
def key(x):
    b, c, v = x["ref"].split(".")
    return (order.get(b, 99), int(c), int(v), x["word"])
t.sort(key=key)

def case(x, cat, expected_root, i):
    form = x["form"]
    return {
        "id": f"he-{i:03d}",
        "category": cat,
        "variety": "hebraico bíblico",
        "attested_form": form,
        "input": form.replace("/", ""),
        "input_derivation": "derivado da forma atestada: removidos apenas os separadores de morfema '/' do OSHB",
        "expected": {"root": expected_root,
                     "output": expected_root if expected_root else "raiz não identificada"},
        "reference_root": x["root"],
        "source": dict(OSHB, location=x["ref"], word=x["word"], oshb_id=x["oshb_id"],
                       morph=x["morph"], lemma=x["lemma"]),
        "root_evidence": dict(LEX, entry=x["entry"], entry_word=x["entry_w"], bdb=x["bdb"],
                              root_entry=x["root_entry"]),
        "review": {"proposed_by": "Claude", "reviewed_by": None},
    }

cases, i = [], 1
for r, forms in PICK_COVERED.items():
    rent, root_key = COVERED[r]
    for f in forms:
        hit = next((x for x in t if x["root"] == r and x["root_entry"] == rent and "Np" not in x["morph"]
                    and cons(x["form"]) == f), None)
        assert hit, (r, f)
        cases.append(case(hit, "coberta", root_key, i)); i += 1

covn = {norm(k) for k in COVERED}
seen_roots = set()
for x in t:
    if len([c for c in cases if c["category"] == "fora_da_cobertura"]) >= 15:
        break
    if not x["ref"].startswith("Gen.") or not x["root"] or "Np" in x["morph"]:
        continue
    # só verbos: raízes inequívocas (partículas e alguns substantivos têm raiz conjectural no BDB)
    if not any(seg.startswith("V") for seg in x["morph"][1:].split("/")):
        continue
    rn = norm(x["root"])
    if rn in covn or rn in seen_roots or any(k in norm(cons(x["form"])) for k in covn):
        continue
    seen_roots.add(rn)
    cases.append(case(x, "fora_da_cobertura", None, i)); i += 1

for f, ref in PICK_TRAPS:
    hit = next((x for x in t if x["ref"] == ref and cons(x["form"]) == f), None)
    assert hit, (f, ref)
    assert norm(hit["root"]) not in covn
    c = case(hit, "armadilha", None, i)
    if f == "וכמשמרות":
        c["note"] = ("Armadilha de sin/shin: מַשְׂמְרוֹת (raiz סמר, com sin) só se distingue de מִשְׁמֶרֶת (raiz שמר, com shin) "
                     "se o motor preservar o ponto diacrítico de ש. Um motor que remove todos os pontos não tem como distinguir.")
    cases.append(c); i += 1

doc = {
    "description": "Conjunto de referência do TTM — hebraico bíblico (S2.1). Linha de base inicial, não prova de domínio da variedade.",
    "attribution": "Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb ; Open Scriptures Hebrew Lexicon available at https://github.com/openscriptures/HebrewLexicon",
    "categories": {
        "coberta": "forma de raiz presente na base do TTM; o motor deve devolver essa raiz",
        "fora_da_cobertura": "forma legítima de raiz ausente da base; o motor deve devolver 'raiz não identificada'",
        "armadilha": "forma que contém as letras de uma raiz coberta sem pertencer a ela; qualquer raiz coberta devolvida é falso positivo",
    },
    "excluded": [
        {"form": "בָרָ֥א", "location": "2Sam.12.17",
         "reason": "homônimo: o LexicalIndex classifica sob ברה ('comer'), mas outros léxicos (HALOT) tratam como homônimo de ברא; testa sentido, não extração de raiz. Candidato a uma futura categoria 'homônimo'."},
        {"form": "ב/מלכן", "location": "2Sam.12.31",
         "reason": "ketiv sem vogais (qere בַּמַּלְבֵּן) e de raiz disputada (uma linha o liga a Moloque/Malcam, raiz מלך)."},
    ],
    "cases": cases,
}
json.dump(doc, open(OUT, "w"), ensure_ascii=False, indent=2)
from collections import Counter
print(Counter(c["category"] for c in cases), len(cases))
for c in cases:
    print(c["id"], c["category"], c["input"], c["source"]["location"], "->", c["expected"]["output"], "| ref:", c["reference_root"])
