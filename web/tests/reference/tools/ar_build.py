"""Monta web/tests/reference/ar.json a partir do texto Tanzil (Simple Clean 1.1, via OpenITI)."""
import json, sys
from collections import Counter

S, OUT = sys.argv[1], sys.argv[2]
toks = json.load(open(S + "/ar_tokens.json"))  # (sura, aya, palavra, forma, palavra_no_QAC); sem marcadores ms e sem basmala prefixada

TANZIL = {"corpus": "Tanzil Quran Text (Simple Clean, Version 1.1)",
          "url": "https://tanzil.net/download/",
          "mirror": "https://github.com/OpenITI/0025AH (data/0001Quran/0001Quran.Mushaf/0001Quran.Mushaf.Tanzil001-ara1.mARkdown)",
          "version": "Tanzil Simple Clean 1.1; OpenITI/0025AH@05bfb1cad632ff98d62c925c6a28c0e3b4e67a64",
          "license": "Creative Commons Attribution 3.0; termos do Tanzil: cópia literal permitida, alteração proibida, citar o Tanzil e linkar tanzil.net"}

# (forma exata no Tanzil, raiz esperada na base, verbete de Lane)
COVERED = [
    ("كتب", "ك-ت-ب"), ("يكتبون", "ك-ت-ب"),
    ("اقرأ", "ق-ر-أ"), ("القرآن", "ق-ر-أ"),
    ("يعلم", "ع-ل-م"), ("فعلموا", "ع-ل-م"),
    ("يفعل", "ف-ع-ل"), ("فعلوا", "ف-ع-ل"),
    ("درست", "د-ر-س"), ("تدرسون", "د-ر-س"),
    ("الحمد", "ح-م-د"), ("بحمد", "ح-م-د"),
    ("أسلم", "س-ل-م"), ("المسلمين", "س-ل-م"),
    ("فتحنا", "ف-ت-ح"), ("الفتح", "ف-ت-ح"),
    ("يجمع", "ج-م-ع"), ("أجمعين", "ج-م-ع"),
    ("أنزل", "ن-ز-ل"), ("ينزل", "ن-ز-ل"),
    ("خلق", "خ-ل-ق"), ("خلقكم", "خ-ل-ق"),
    ("نعبد", "ع-ب-د"), ("اعبدوا", "ع-ب-د"),
    ("الرحمن", "ر-ح-م"), ("رحمة", "ر-ح-م"),
    ("شهداء", "ش-ه-د"), ("يشهد", "ش-ه-د"),
    ("وحده", "و-ح-د"), ("واحد", "و-ح-د"),
    ("ينصرون", "ن-ص-ر"), ("النصر", "ن-ص-ر"),
    ("يحكم", "ح-ك-م"), ("الحكمة", "ح-ك-م"),
    ("وأصلحوا", "ص-ل-ح"), ("مصلحون", "ص-ل-ح"),
    ("الذكر", "ذ-ك-ر"), ("فاذكروني", "ذ-ك-ر"),
    ("جهد", "ج-ه-د"), ("جاهدوا", "ج-ه-د"),
]
# (forma, raiz de referência no padrão de Lane)
UNCOVERED = [
    ("يؤمنون", "أ-م-ن"), ("ويقيمون", "ق-و-م"), ("رزقناهم", "ر-ز-ق"), ("ينفقون", "ن-ف-ق"),
    ("يوقنون", "ي-ق-ن"), ("المفلحون", "ف-ل-ح"), ("كفروا", "ك-ف-ر"), ("قلوبهم", "ق-ل-ب"),
    ("عذاب", "ع-ذ-ب"), ("يقول", "ق-و-ل"), ("يخادعون", "خ-د-ع"), ("مرض", "م-ر-ض"),
    ("يكذبون", "ك-ذ-ب"), ("تفسدوا", "ف-س-د"), ("الأرض", "أ-ر-ض"), ("السفهاء", "س-ف-ه"),
    ("اشتروا", "ش-ر-ي"), ("الضلالة", "ض-ل-ل"), ("نورهم", "ن-و-ر"), ("ظلمات", "ظ-ل-م"),
]
# (forma, raiz/natureza de referência, raiz coberta que o casamento por letras confunde, motivo)
TRAPS = [
    ("فعليها", "sem raiz de referência: partícula على", "ف-ع-ل", "fa + ʿalā + hā: contém ف-ع-ل em sequência"),
    ("فعليه", "sem raiz de referência: partícula على", "ف-ع-ل", "fa + ʿalā + hi: contém ف-ع-ل em sequência"),
    ("فعليكم", "sem raiz de referência: partícula على", "ف-ع-ل", "fa + ʿalaykum: contém ف-ع-ل em sequência"),
    ("فتحرير", "ح-ر-ر", "ف-ت-ح", "fa + taḥrīr: contém ف-ت-ح em sequência"),
    ("فتحسسوا", "ح-س-س", "ف-ت-ح", "fa + taḥassasū: contém ف-ت-ح em sequência"),
    ("نصرف", "ص-ر-ف", "ن-ص-ر", "nuṣarrif: contém ن-ص-ر em sequência"),
    ("انصرفوا", "ص-ر-ف", "ن-ص-ر", "inṣarafū: contém ن-ص-ر em sequência"),
    ("ريحكم", "ر-و-ح", "ح-ك-م", "rīḥu + kum: contém ح-ك-م em sequência"),
    ("لم", "partícula لم", "ع-ل-م", "palavra curta contida em ع-ل-م e س-ل-م"),
    ("مع", "partícula مع", "ج-م-ع", "palavra curta contida em ج-م-ع"),
    ("كم", "partícula كم", "ح-ك-م", "palavra curta contida em ح-ك-م"),
    ("سل", "س-أ-ل", "س-ل-م", "imperativo de سأل; contido em س-ل-م"),
    ("صر", "ص-ر-ر", "ن-ص-ر", "ṣirr (frio intenso); contido em ن-ص-ر"),
    ("مد", "م-د-د", "ح-م-د", "madda; contido em ح-م-د"),
    ("عمل", "ع-م-ل", "ع-ل-م", "anagrama de علم"),
    ("بعد", "ب-ع-د", "ع-ب-د", "anagrama de عبد"),
    ("سدر", "س-د-ر", "د-ر-س", "anagrama de درس"),
    ("حرم", "ح-ر-م", "ر-ح-م", "anagrama de رحم"),
    ("لمسنا", "ل-م-س", "س-ل-م", "lamasnā: anagrama parcial de سلم"),
    ("فتهجد", "ه-ج-د", "ج-ه-د", "fa + tahajjad: anagrama de جهد"),
]

first = {}
for s, a, i, w, q in toks:
    first.setdefault(w, (s, a, i, q))
cnt = Counter(t[3] for t in toks)

def case(form, cat, expected_root, ref_root, i, extra=None):
    assert form in first, form
    s, a, w, qw = first[form]
    c = {
        "id": f"ar-{i:03d}",
        "category": cat,
        "variety": "árabe corânico",
        "attested_form": form,
        "input": form,
        "input_derivation": "idêntico à forma atestada (texto Simple Clean, sem diacríticos)",
        "expected": {"root": expected_root,
                     "output": expected_root if expected_root else "raiz não identificada"},
        "reference_root": ref_root,
        "source": dict(TANZIL, location=f"{s}:{a}", word=w, occurrences_in_text=cnt[form],
                       note="primeira ocorrência no texto; posição e contagem ignoram os marcadores de página ms do OpenITI e a basmala prefixada ao versículo 1 das suras 2 a 114"),
        "root_evidence": {
            "lexicon": "Lane, An Arabic-English Lexicon (1863–1893), edição impressa, citada pelo verbete da raiz",
            "entry": ref_root,
            "cross_check": {
                "corpus": "Quranic Arabic Corpus 0.4 (citado só pela localização; nenhum dado copiado)",
                "location": f"{s}:{a}:{qw}",
                "url": f"https://corpus.quran.com/wordmorphology.jsp?location=({s}:{a}:{qw})",
                "status": "posição calculada: a do texto Simple Clean menos uma para cada «يا» anterior no versículo, porque no corpus «يا» vem unido à palavra seguinte; amostra conferida na revisão do S2.1",
            },
        },
        "review": {"proposed_by": "Claude", "reviewed_by": None},
    }
    if extra:
        c.update(extra)
    if form == "القرآن":
        c["note"] = "Posição minoritária (al-Shāfiʿī; leitura de Ibn Kathīr «القران») não deriva القرآن de ق-ر-أ; aqui segue-se Lane e a maioria dos lexicógrafos."
    return c

cases, i = [], 1
for f, r in COVERED:
    cases.append(case(f, "coberta", r, r, i)); i += 1
for f, r in UNCOVERED:
    cases.append(case(f, "fora_da_cobertura", None, r, i)); i += 1
for f, ref, confusable, why in TRAPS:
    cases.append(case(f, "armadilha", None, ref, i,
                      {"trap": {"confusable_with": confusable, "why": why}})); i += 1

doc = {
    "description": "Conjunto de referência do TTM — árabe corânico (S2.1). Linha de base inicial, não prova de domínio da variedade.",
    "attribution": "Texto corânico: Tanzil Project (https://tanzil.net), Tanzil Quran Text (Simple Clean, Version 1.1), Copyright (C) 2007-2021 Tanzil Project, Creative Commons Attribution 3.0. Formas copiadas literalmente, sem alteração. Ver https://tanzil.net/updates/ para atualizações.",
    "categories": {
        "coberta": "forma de raiz presente na base do TTM; o motor deve devolver essa raiz",
        "fora_da_cobertura": "forma legítima de raiz ausente da base; o motor deve devolver 'raiz não identificada'",
        "armadilha": "forma que contém letras de uma raiz coberta (em sequência, contida nela ou como anagrama) sem pertencer a ela; qualquer raiz coberta devolvida é falso positivo",
    },
    "cases": cases,
}
json.dump(doc, open(OUT, "w"), ensure_ascii=False, indent=2)
print(Counter(c["category"] for c in cases), len(cases))
for c in cases:
    print(c["id"], c["category"], c["input"], c["source"]["location"], c["source"]["word"], "x" + str(c["source"]["occurrences_in_text"]), "->", c["expected"]["output"], "| ref:", c["reference_root"])
