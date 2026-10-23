"""Testes do construtor hebraico com tokens sem morfologia.

Rodar a partir de web/tests/reference/tools: python3 -m unittest test_he_build
"""
import unittest
from unittest import mock

import he_build


def tok(ref, word, form, root, root_entry, morph="__omit__", lemma="1"):
    t = {"ref": ref, "word": word, "oshb_id": f"id{word}", "form": form, "lemma": lemma,
         "entry": "e", "entry_w": form, "bdb": "b", "root": root, "root_entry": root_entry}
    if morph != "__omit__":
        t["morph"] = morph
    return t


class HelpersSemMorph(unittest.TestCase):
    def test_morph_none(self):
        x = {"morph": None}
        self.assertEqual(he_build.morph_segments(x), [])
        self.assertFalse(he_build.is_proper_noun(x))
        self.assertFalse(he_build.is_verb(x))

    def test_morph_ausente(self):
        x = {}
        self.assertFalse(he_build.is_proper_noun(x))
        self.assertFalse(he_build.is_verb(x))

    def test_morph_presente(self):
        self.assertTrue(he_build.is_verb({"morph": "HC/Vqw3ms"}))
        self.assertTrue(he_build.is_proper_noun({"morph": "HNpm"}))
        self.assertFalse(he_build.is_verb({"morph": "HNcmsa"}))


class ConstrutorComTokenSemMorph(unittest.TestCase):
    def test_build_nao_quebra(self):
        tokens = [
            tok("Gen.1.1", 1, "מֶלֶךְ", "מלך", "haj", morph="HNcmsa"),
            tok("Gen.1.1", 2, "דָּבָר", "דבר", "x", morph=None),          # sem morph: ignorado
            tok("Gen.1.1", 3, "אָמַר", "אמר", "y"),                        # chave morph ausente
            tok("Gen.1.2", 1, "הָלַךְ", "הלך", "z", morph="HVqp3ms"),      # verbo: entra
            tok("Gen.1.3", 1, "בְּרֵאשִׁית", "ראשׁ", "w", morph=None),     # armadilha sem morph
        ]
        with mock.patch.object(he_build, "COVERED", {"מלך": ("haj", "מ-ל-ך")}), \
             mock.patch.object(he_build, "PICK_COVERED", {"מלך": ["מלך"]}), \
             mock.patch.object(he_build, "PICK_TRAPS", [("בראשית", "Gen.1.3")]):
            cases = he_build.build(tokens)
        cats = [c["category"] for c in cases]
        self.assertEqual(cats, ["coberta", "fora_da_cobertura", "armadilha"])
        self.assertEqual(cases[1]["reference_root"], "הלך")
        self.assertIsNone(cases[2]["source"]["morph"])


if __name__ == "__main__":
    unittest.main()
