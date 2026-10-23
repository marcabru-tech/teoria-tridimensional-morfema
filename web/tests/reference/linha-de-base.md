# Relatório do conjunto de referência do TTM

Motor avaliado: `main` no commit `f8ac7fa` (antes de qualquer correção do S2), servidor local, `POST /api/analyze`. Gerado em 23/10/2026.

| Língua | Acerto exato nas cobertas (meta ≥ 90%) | Falsos positivos nas armadilhas (meta 0) | Raízes inventadas fora da cobertura (meta 0) |
| --- | --- | --- | --- |
| Árabe corânico | 38/40 (95.0%) | 14/20 | 20/20 |
| Hebraico bíblico | 11/30 (36.7%) | 0/15 | 15/15 |

Nas armadilhas, uma raiz devolvida que não pertence à base também aparece na lista de falhas como raiz inventada, mas só a raiz coberta conta como falso positivo.

## Árabe corânico: casos que falharam (42 de 80)

| Caso | Categoria | Entrada | Localização | Esperado | Obtido |
| --- | --- | --- | --- | --- | --- |
| ar-004 | coberta | القرآن | 2:185 | ق-ر-أ | devolveu ا-ل-ق-ر-آ-ن |
| ar-040 | coberta | جاهدوا | 3:142 | ج-ه-د | devolveu ج-ا-ه-د-و-ا |
| ar-041 | fora_da_cobertura | يؤمنون | 2:3 | raiz não identificada | raiz inventada: ي-ؤ-م-ن-و-ن |
| ar-042 | fora_da_cobertura | ويقيمون | 2:3 | raiz não identificada | raiz inventada: و-ي-ق-ي-م-و-ن |
| ar-043 | fora_da_cobertura | رزقناهم | 2:3 | raiz não identificada | raiz inventada: ر-ز-ق-ن-ا-ه-م |
| ar-044 | fora_da_cobertura | ينفقون | 2:3 | raiz não identificada | raiz inventada: ي-ن-ف-ق-و-ن |
| ar-045 | fora_da_cobertura | يوقنون | 2:4 | raiz não identificada | raiz inventada: ي-و-ق-ن-و-ن |
| ar-046 | fora_da_cobertura | المفلحون | 2:5 | raiz não identificada | raiz inventada: ا-ل-م-ف-ل-ح-و-ن |
| ar-047 | fora_da_cobertura | كفروا | 2:6 | raiz não identificada | raiz inventada: ك-ف-ر-و-ا |
| ar-048 | fora_da_cobertura | قلوبهم | 2:7 | raiz não identificada | raiz inventada: ق-ل-و-ب-ه-م |
| ar-049 | fora_da_cobertura | عذاب | 2:7 | raiz não identificada | raiz inventada: ع-ذ-ا-ب |
| ar-050 | fora_da_cobertura | يقول | 2:8 | raiz não identificada | raiz inventada: ي-ق-و-ل |
| ar-051 | fora_da_cobertura | يخادعون | 2:9 | raiz não identificada | raiz inventada: ي-خ-ا-د-ع-و-ن |
| ar-052 | fora_da_cobertura | مرض | 2:10 | raiz não identificada | raiz inventada: م-ر-ض |
| ar-053 | fora_da_cobertura | يكذبون | 2:10 | raiz não identificada | raiz inventada: ي-ك-ذ-ب-و-ن |
| ar-054 | fora_da_cobertura | تفسدوا | 2:11 | raiz não identificada | raiz inventada: ت-ف-س-د-و-ا |
| ar-055 | fora_da_cobertura | الأرض | 2:11 | raiz não identificada | raiz inventada: ا-ل-أ-ر-ض |
| ar-056 | fora_da_cobertura | السفهاء | 2:13 | raiz não identificada | raiz inventada: ا-ل-س-ف-ه-ا-ء |
| ar-057 | fora_da_cobertura | اشتروا | 2:16 | raiz não identificada | raiz inventada: ا-ش-ت-ر-و-ا |
| ar-058 | fora_da_cobertura | الضلالة | 2:16 | raiz não identificada | raiz inventada: ا-ل-ض-ل-ا-ل-ة |
| ar-059 | fora_da_cobertura | نورهم | 57:12 | raiz não identificada | raiz inventada: ن-و-ر-ه-م |
| ar-060 | fora_da_cobertura | ظلمات | 2:17 | raiz não identificada | raiz inventada: ظ-ل-م-ا-ت |
| ar-061 | armadilha | فعليها | 6:104 | raiz não identificada | falso positivo: ف-ع-ل |
| ar-062 | armadilha | فعليه | 10:84 | raiz não identificada | falso positivo: ف-ع-ل |
| ar-063 | armadilha | فعليكم | 8:72 | raiz não identificada | falso positivo: ف-ع-ل |
| ar-064 | armadilha | فتحرير | 4:92 | raiz não identificada | falso positivo: ف-ت-ح |
| ar-065 | armadilha | فتحسسوا | 12:87 | raiz não identificada | falso positivo: ف-ت-ح |
| ar-066 | armadilha | نصرف | 6:46 | raiz não identificada | falso positivo: ن-ص-ر |
| ar-067 | armadilha | انصرفوا | 9:127 | raiz não identificada | falso positivo: ن-ص-ر |
| ar-068 | armadilha | ريحكم | 8:46 | raiz não identificada | falso positivo: ح-ك-م |
| ar-069 | armadilha | لم | 2:6 | raiz não identificada | falso positivo: ع-ل-م |
| ar-070 | armadilha | مع | 2:43 | raiz não identificada | falso positivo: ج-م-ع |
| ar-071 | armadilha | كم | 2:211 | raiz não identificada | falso positivo: ح-ك-م |
| ar-072 | armadilha | سل | 2:211 | raiz não identificada | falso positivo: س-ل-م |
| ar-073 | armadilha | صر | 3:117 | raiz não identificada | falso positivo: ن-ص-ر |
| ar-074 | armadilha | مد | 13:3 | raiz não identificada | falso positivo: ح-م-د |
| ar-075 | armadilha | عمل | 3:195 | raiz não identificada | raiz inventada: ع-م-ل |
| ar-076 | armadilha | بعد | 2:27 | raiz não identificada | raiz inventada: ب-ع-د |
| ar-077 | armadilha | سدر | 34:16 | raiz não identificada | raiz inventada: س-د-ر |
| ar-078 | armadilha | حرم | 2:173 | raiz não identificada | raiz inventada: ح-ر-م |
| ar-079 | armadilha | لمسنا | 72:8 | raiz não identificada | raiz inventada: ل-م-س-ن-ا |
| ar-080 | armadilha | فتهجد | 17:79 | raiz não identificada | raiz inventada: ف-ت-ه-ج-د |

## Hebraico bíblico: casos que falharam (49 de 60)

| Caso | Categoria | Entrada | Localização | Esperado | Obtido |
| --- | --- | --- | --- | --- | --- |
| he-002 | coberta | הַמֶּֽלֶךְ | Gen.14.17 | מ-ל-ך | devolveu ה-מ-ל-ך |
| he-003 | coberta | וַיִּמְלֹ֣ךְ | Gen.36.32 | מ-ל-ך | devolveu ו-י-מ-ל-ך |
| he-006 | coberta | בְמַלְכוּת֛וֹ | 1Chr.11.10 | מ-ל-ך | devolveu ב-מ-ל-כ-ו-ת-ו |
| he-008 | coberta | לִשְׁמֹ֕ר | Gen.3.24 | שׁ-מ-ר | devolveu ל-ש-מ-ר |
| he-009 | coberta | שִׁמֻּרִ֥ים | Exod.12.42 | שׁ-מ-ר | devolveu ש-מ-ר-י-ם |
| he-010 | coberta | מִשְׁמֶ֥רֶת | Lev.8.35 | שׁ-מ-ר | devolveu מ-ש-מ-ר-ת |
| he-011 | coberta | וְשָֽׁמְרוּ֙ | Gen.18.19 | שׁ-מ-ר | devolveu ו-ש-מ-ר-ו |
| he-012 | coberta | יִשְׁמֹ֔ר | 1Sam.2.9 | שׁ-מ-ר | devolveu י-ש-מ-ר |
| he-014 | coberta | וַיִּכְתֹּ֣ב | Exod.24.4 | כ-ת-ב | devolveu ו-י-כ-ת-ב |
| he-015 | coberta | הַכָּת֖וּב | Josh.1.8 | כ-ת-ב | devolveu ה-כ-ת-ו-ב |
| he-016 | coberta | כְּתוּבִ֗ים | 1Kgs.14.19 | כ-ת-ב | devolveu כ-ת-ו-ב-י-ם |
| he-018 | coberta | בִּכְתָ֛ב | 1Chr.28.19 | כ-ת-ב | devolveu ב-כ-ת-ב |
| he-020 | coberta | וַיֶּאֱהַ֥ב | Gen.25.28 | א-ה-ב | devolveu ו-י-א-ה-ב |
| he-022 | coberta | וְאָֽהַבְתָּ֥ | Lev.19.18 | א-ה-ב | devolveu ו-א-ה-ב-ת |
| he-023 | coberta | אֲהֵבַ֨תֶךְ֙ | Ruth.4.15 | א-ה-ב | devolveu א-ה-ב-ת-ך |
| he-024 | coberta | לְאַהֲבָ֣ה | Deut.10.15 | א-ה-ב | devolveu ל-א-ה-ב-ה |
| he-026 | coberta | וַיִּבְרָ֣א | Gen.1.21 | ב-ר-א | devolveu ו-י-ב-ר-א |
| he-027 | coberta | בְּרָאָ֑ם | Gen.5.2 | ב-ר-א | devolveu ב-ר-א-ם |
| he-029 | coberta | נִ֝בְרָ֗א | Ps.102.19 | ב-ר-א | devolveu נ-ב-ר-א |
| he-031 | fora_da_cobertura | הָיְתָ֥ה | Gen.1.2 | raiz não identificada | raiz inventada: ה-י-ת-ה |
| he-032 | fora_da_cobertura | מְרַחֶ֖פֶת | Gen.1.2 | raiz não identificada | raiz inventada: מ-ר-ח-פ-ת |
| he-033 | fora_da_cobertura | וַיֹּ֥אמֶר | Gen.1.3 | raiz não identificada | raiz inventada: ו-י-א-מ-ר |
| he-034 | fora_da_cobertura | וַיַּ֧רְא | Gen.1.4 | raiz não identificada | raiz inventada: ו-י-ר-א |
| he-035 | fora_da_cobertura | וַיַּבְדֵּ֣ל | Gen.1.4 | raiz não identificada | raiz inventada: ו-י-ב-ד-ל |
| he-036 | fora_da_cobertura | וַיִּקְרָ֨א | Gen.1.5 | raiz não identificada | raiz inventada: ו-י-ק-ר-א |
| he-037 | fora_da_cobertura | וַיַּ֣עַשׂ | Gen.1.7 | raiz não identificada | raiz inventada: ו-י-ע-ש |
| he-038 | fora_da_cobertura | יִקָּו֨וּ | Gen.1.9 | raiz não identificada | raiz inventada: י-ק-ו-ו |
| he-039 | fora_da_cobertura | תַּֽדְשֵׁ֤א | Gen.1.11 | raiz não identificada | raiz inventada: ת-ד-ש-א |
| he-040 | fora_da_cobertura | מַזְרִ֣יעַ | Gen.1.11 | raiz não identificada | raiz inventada: מ-ז-ר-י-ע |
| he-041 | fora_da_cobertura | וַתּוֹצֵ֨א | Gen.1.12 | raiz não identificada | raiz inventada: ו-ת-ו-צ-א |
| he-042 | fora_da_cobertura | לְהָאִ֖יר | Gen.1.15 | raiz não identificada | raiz inventada: ל-ה-א-י-ר |
| he-043 | fora_da_cobertura | וַיִּתֵּ֥ן | Gen.1.17 | raiz não identificada | raiz inventada: ו-י-ת-ן |
| he-044 | fora_da_cobertura | וְלִמְשֹׁל֙ | Gen.1.18 | raiz não identificada | raiz inventada: ו-ל-מ-ש-ל |
| he-045 | fora_da_cobertura | יִשְׁרְצ֣וּ | Gen.1.20 | raiz não identificada | raiz inventada: י-ש-ר-צ-ו |
| he-046 | armadilha | בְּרֵאשִׁ֖ית | Gen.1.1 | raiz não identificada | raiz inventada: ב-ר-א-ש-י-ת |
| he-047 | armadilha | בָּרֹ֔אשׁ | 1Chr.16.7 | raiz não identificada | raiz inventada: ב-ר-א-ש |
| he-048 | armadilha | בִּרְא֤וֹת | 1Chr.21.28 | raiz não identificada | raiz inventada: ב-ר-א-ו-ת |
| he-049 | armadilha | בִּרְאֹת֣וֹ | 2Sam.24.17 | raiz não identificada | raiz inventada: ב-ר-א-ת-ו |
| he-050 | armadilha | בָּֽרֹאֶ֔ה | Isa.28.7 | raiz não identificada | raiz inventada: ב-ר-א-ה |
| he-051 | armadilha | בָּֽרִאשׁ֖וֹן | Ezek.29.17 | raiz não identificada | raiz inventada: ב-ר-א-ש-ו-ן |
| he-052 | armadilha | גָּמְלֵ֣ךְ | 1Sam.1.23 | raiz não identificada | raiz inventada: ג-מ-ל-ך |
| he-053 | armadilha | מִלֶּ֣כֶת | 1Sam.30.21 | raiz não identificada | raiz inventada: מ-ל-כ-ת |
| he-054 | armadilha | וּ֝מַלְכֻּדְתּ֗וֹ | Job.18.10 | raiz não identificada | raiz inventada: ו-מ-ל-כ-ד-ת-ו |
| he-055 | armadilha | מִלָּֽכֶד | Prov.3.26 | raiz não identificada | raiz inventada: מ-ל-כ-ד |
| he-056 | armadilha | גְּמֻלְכֶ֖ם | Joel.4.4 | raiz não identificada | raiz inventada: ג-מ-ל-כ-ם |
| he-057 | armadilha | כִּתְבוּנָם֙ | Hos.13.2 | raiz não identificada | raiz inventada: כ-ת-ב-ו-נ-ם |
| he-058 | armadilha | כְּתַבְנִ֣ית | Isa.44.13 | raiz não identificada | raiz inventada: כ-ת-ב-נ-י-ת |
| he-059 | armadilha | וּֽכְמַשְׂמְר֥וֹת | Eccl.12.11 | raiz não identificada | raiz inventada: ו-כ-מ-ש-מ-ר-ו-ת |
| he-060 | armadilha | כִּתְבוּאַ֥ת | Num.18.30 | raiz não identificada | raiz inventada: כ-ת-ב-ו-א-ת |

