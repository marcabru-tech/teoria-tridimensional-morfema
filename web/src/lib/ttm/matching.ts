// Casamento de raízes por forma atestada (S2.2).
//
// Regras em vigor:
//  - proibido casamento por substring;
//  - proibido inventar raiz: sem evidência, o resultado é null
//    ("raiz não identificada");
//  - afixos só são retirados quando o restante bate com uma forma
//    atestada da base (letras da raiz ou exemplo);
//  - toda resposta carrega um grau de certeza: 'alta' (forma exata)
//    ou 'media' (afixo retirado).

export type RootConfidence = 'alta' | 'media';

export type MatchVia =
  | 'raiz'
  | 'exemplo'
  | 'proclitico'
  | 'prefixo_verbal'
  | 'sufixo'
  | 'proclitico+sufixo'
  | 'prefixo_verbal+sufixo';

export interface RootIndexEntry {
  /** Chave de exibição como no JSON ("ك-ت-ب", "שׁ-מ-ר"). */
  rootKey: string;
  /** Letras da raiz normalizadas, sem separadores nem sinais. */
  rootNorm: string;
  /** Forma de exemplo normalizada -> dados de exibição. */
  examples: Map<string, { display: string; gloss: string }>;
  info: any;
}

export interface AffixConfig {
  /** Clíticos anteriores: artigo, conjunções, preposições. */
  proclitics: string[];
  /**
   * Prefixos de verbo (imperfeito/yiqtol). VAI ALÉM da regra aprovada
   * ("proclíticos e artigo"); depende de parecer. Gate de atestação vale.
   */
  verbalPrefixes: string[];
  /**
   * Sufixos que só reduzem até um EXEMPLO atestado DIFERENTE das letras
   * da raiz. Marcadores que também criam lexemas (ת/ה hebraicos, ة árabe)
   * não podem afirmar derivação que a base não atesta.
   */
  suffixesToExample: string[];
  /**
   * Sufixos claramente flexionais, que também aceitam o restante = letras
   * da raiz. Lista restrita, conferida contra as armadilhas do S2.1.
   */
  suffixesToRoot: string[];
}

export interface RootMatch {
  rootKey: string;
  info: any;
  via: MatchVia;
  confidence: RootConfidence;
  prefix: string | null;
  suffix: string | null;
  /** Forma normalizada que bateu na base. */
  matchedNorm: string;
  /** Exemplo que bateu (exibição), ou null se foi a raiz. */
  matchedDisplay: string | null;
  gloss: string | null;
}

/** Raízes triliterais: resto menor que 3 letras não é candidato. */
const MIN_STEM = 3;

export function buildRootIndex(
  data: Record<string, any>,
  normalize: (s: string) => string,
): RootIndexEntry[] {
  const entries: RootIndexEntry[] = [];
  for (const [rootKey, info] of Object.entries(data)) {
    const rootNorm = normalize(rootKey.replace(/-/g, ''));
    const examples = new Map<string, { display: string; gloss: string }>();
    for (const [display, gloss] of Object.entries((info as any)?.examples ?? {})) {
      examples.set(normalize(display as string), {
        display: display as string,
        gloss: gloss as string,
      });
    }
    entries.push({ rootKey, rootNorm, examples, info });
  }
  // Ordem fixa: o resultado não pode depender da ordem do JSON.
  entries.sort((a, b) => (a.rootNorm < b.rootNorm ? -1 : a.rootNorm > b.rootNorm ? 1 : 0));
  return entries;
}

interface FormHit {
  entry: RootIndexEntry;
  kind: 'raiz' | 'exemplo';
  display: string | null;
  gloss: string | null;
}

function findRootForm(norm: string, index: RootIndexEntry[]): FormHit | null {
  for (const entry of index) {
    if (norm === entry.rootNorm) {
      return { entry, kind: 'raiz', display: null, gloss: entry.info?.description ?? null };
    }
  }
  return null;
}

function findExample(norm: string, index: RootIndexEntry[]): FormHit | null {
  for (const entry of index) {
    const ex = entry.examples.get(norm);
    if (ex) return { entry, kind: 'exemplo', display: ex.display, gloss: ex.gloss };
  }
  return null;
}

/** Letras da raiz OU exemplo atestado. */
function findAttested(norm: string, index: RootIndexEntry[]): FormHit | null {
  return findRootForm(norm, index) ?? findExample(norm, index);
}

function toMatch(
  hit: FormHit,
  via: MatchVia,
  confidence: RootConfidence,
  prefix: string | null,
  suffix: string | null,
  matchedNorm: string,
): RootMatch {
  return {
    rootKey: hit.entry.rootKey,
    info: hit.entry.info,
    via,
    confidence,
    prefix,
    suffix,
    matchedNorm,
    matchedDisplay: hit.display,
    gloss: hit.gloss,
  };
}

function byLengthDesc(list: string[]): string[] {
  return [...list].sort((a, b) => b.length - a.length);
}

function viaWithSuffix(prefixVia: MatchVia | null): MatchVia {
  if (prefixVia === 'proclitico') return 'proclitico+sufixo';
  if (prefixVia === 'prefixo_verbal') return 'prefixo_verbal+sufixo';
  return 'sufixo';
}

function trySuffix(
  stem: string,
  prefix: string | null,
  prefixVia: MatchVia | null,
  index: RootIndexEntry[],
  affixes: AffixConfig,
): RootMatch | null {
  for (const suf of byLengthDesc(affixes.suffixesToExample)) {
    if (stem.length <= suf.length || !stem.endsWith(suf)) continue;
    const rest = stem.slice(0, -suf.length);
    if (rest.length < MIN_STEM) continue;
    const hit = findExample(rest, index);
    // rest !== rootNorm: ת/ה/ة não reduzem à raiz nua (מלכת × משמרת).
    if (hit && rest !== hit.entry.rootNorm) {
      return toMatch(hit, viaWithSuffix(prefixVia), 'media', prefix, suf, rest);
    }
  }
  for (const suf of byLengthDesc(affixes.suffixesToRoot)) {
    if (stem.length <= suf.length || !stem.endsWith(suf)) continue;
    const rest = stem.slice(0, -suf.length);
    if (rest.length < MIN_STEM) continue;
    const hit = findAttested(rest, index);
    if (hit) {
      return toMatch(hit, viaWithSuffix(prefixVia), 'media', prefix, suf, rest);
    }
  }
  return null;
}

export function matchRoot(
  norm: string,
  index: RootIndexEntry[],
  affixes: AffixConfig,
): RootMatch | null {
  // Camada 1: forma exata — certeza alta.
  const directRoot = findRootForm(norm, index);
  if (directRoot) return toMatch(directRoot, 'raiz', 'alta', null, null, norm);
  const directExample = findExample(norm, index);
  if (directExample) return toMatch(directExample, 'exemplo', 'alta', null, null, norm);

  const prefixes: Array<[string, MatchVia]> = [
    ...affixes.proclitics.map((p) => [p, 'proclitico'] as [string, MatchVia]),
    ...affixes.verbalPrefixes.map((p) => [p, 'prefixo_verbal'] as [string, MatchVia]),
  ];
  prefixes.sort((a, b) => b[0].length - a[0].length);

  // Camada 2: um afixo anterior.
  for (const [p, via] of prefixes) {
    if (norm.length <= p.length || !norm.startsWith(p)) continue;
    const rest = norm.slice(p.length);
    if (rest.length < MIN_STEM) continue;
    const hit = findAttested(rest, index);
    if (hit) return toMatch(hit, via, 'media', p, null, rest);
  }

  // Camada 3: um sufixo.
  const suffixOnly = trySuffix(norm, null, null, index, affixes);
  if (suffixOnly) return suffixOnly;

  // Camada 4: um afixo anterior + um sufixo.
  for (const [p, via] of prefixes) {
    if (norm.length <= p.length || !norm.startsWith(p)) continue;
    const rest = norm.slice(p.length);
    if (rest.length < MIN_STEM) continue;
    const hit = trySuffix(rest, p, via, index, affixes);
    if (hit) return hit;
  }

  // Sem evidência: raiz não identificada.
  return null;
}
