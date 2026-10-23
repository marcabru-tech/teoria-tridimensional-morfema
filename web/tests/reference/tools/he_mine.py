"""Minera candidatos hebraicos no OSHB e deriva a raiz pelo LexicalIndex (Open Scriptures).

Saída: he_tokens.json com todos os tokens (ref, id, forma literal, lema, raiz derivada).
"""
import json, re, sys, glob, os
import xml.etree.ElementTree as ET

FONTES = sys.argv[1]
OUT = sys.argv[2]
NS = {"o": "http://www.bibletechnologies.net/2003/OSIS/namespace"}
LI_NS = "{http://openscriptures.github.com/morphhb/namespace}"

# --- LexicalIndex: (strong, aug) -> entry; entry -> raiz
li = ET.parse(os.path.join(FONTES, "HebrewLexicon/LexicalIndex.xml")).getroot()
entries = {}
by_strong = {}
for part in li.iter(LI_NS + "part"):
    if part.get("{http://www.w3.org/XML/1998/namespace}lang") != "heb":
        continue
    for e in part.iter(LI_NS + "entry"):
        eid = e.get("id")
        w = e.find(LI_NS + "w")
        x = e.find(LI_NS + "xref")
        et = e.find(LI_NS + "etym")
        info = {
            "w": w.text if w is not None else None,
            "strong": x.get("strong") if x is not None else None,
            "aug": x.get("aug") if x is not None else None,
            "bdb": x.get("bdb") if x is not None else None,
            "etym_type": et.get("type") if et is not None else None,
            "etym_root": et.get("root") if et is not None else None,
            "etym_text": (et.text or "").strip() if et is not None else "",
        }
        entries[eid] = info
        if info["strong"]:
            by_strong.setdefault(info["strong"], []).append(eid)


def root_of(eid, depth=0):
    """Segue a cadeia etym: 'main' com root -> raiz; 'sub' -> entrada-pai."""
    e = entries.get(eid)
    if not e or depth > 5:
        return None, None
    if e["etym_type"] == "main" and e["etym_root"]:
        return e["etym_root"], eid
    if e["etym_type"] == "sub" and e["etym_text"]:
        parent = e["etym_text"].split(",")[0].strip()
        return root_of(parent, depth + 1)
    return None, None


def lemma_entry(lemma):
    """lemma OSHB ex.: 'b/7225', '1254 a', 'c/4428' -> entrada principal."""
    main = lemma.split("/")[-1].strip()
    m = re.match(r"^(\d+)\s*([a-z])?\+?$", main)
    if not m:
        return None
    strong, aug = m.group(1), m.group(2)
    cands = by_strong.get(strong, [])
    if aug:
        cands = [c for c in cands if entries[c]["aug"] == aug] or cands
    return cands[0] if cands else None


tokens = []
for path in sorted(glob.glob(os.path.join(FONTES, "morphhb/wlc/*.xml"))):
    book = os.path.basename(path)[:-4]
    if book in ("VerseMap",):
        continue
    try:
        root_el = ET.parse(path).getroot()
    except ET.ParseError:
        continue
    for verse in root_el.iter("{%s}verse" % NS["o"]):
        ref = verse.get("osisID")
        idx = 0
        for w in verse.iter("{%s}w" % NS["o"]):
            idx += 1
            form = "".join(w.itertext())
            lemma = w.get("lemma", "")
            eid = lemma_entry(lemma)
            r, root_eid = root_of(eid) if eid else (None, None)
            tokens.append({
                "ref": ref, "word": idx, "oshb_id": w.get("id"), "form": form,
                "lemma": lemma, "morph": w.get("morph"),
                "entry": eid, "entry_w": entries[eid]["w"] if eid else None,
                "bdb": entries[eid]["bdb"] if eid else None,
                "root": r, "root_entry": root_eid,
            })
json.dump(tokens, open(OUT, "w"), ensure_ascii=False)
print("tokens:", len(tokens), "com raiz:", sum(1 for t in tokens if t["root"]))
