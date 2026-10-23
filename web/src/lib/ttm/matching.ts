// Casamento de raízes por forma atestada (S2.2).
//
// Regras em vigor:
//  - proibido casamento por substring;
//  - proibido inventar raiz: sem evidência, o resultado é null
//    ("raiz não identificada");
//  - afixos só são retirados quando o restante bate com uma forma
//    atestada da base (letras da raiz ou exemplo);
//  - toda resposta carrega um grau de certeza: 'alta' (forma exata)
//    ou 'media' (afixo retirado);
//  - a glosa específica de uma forma só é atribuída quando a vocalização
//    da entrada a identifica; sem vogais (ou com vogais que não batem),
//    a glosa fica "não determinada" e os candidatos são listados;
//  - afixos retirados são devolvidos na grafia de superfície da entrada.
//
// Este módulo não importa nada em tempo de execução (ver rules.ts).

export type RootConfidence = 'alta' | 'media';

export type MatchVia =
  | 'raiz'
  | 'exemplo'
  | 'proclitico'
  | 'prefixo_verbal'
  | 'sufixo'
  | 'proclitico+sufixo'
  | 'prefixo_verbal+sufixo';

/**
 * 'especifica': a vocalização da entrada identifica uma única forma atestada.
 * 'nao_determinada': a raiz foi identificada, mas a forma não (entrada sem
 * vogais, vogais que não batem, ou forma flexionada por sufixo/prefixo
 * verbal); a glosa devolvida é a descrição geral da raiz, e os candidatos
 * ficam listados.
 */
export type GlossStatus = 'especifica' | 'nao_determinada';

/** Ortografia de uma língua: como comparar e como ler a vocalização. */
export interface Orthography {
  /** Forma de comparação: sem vogais, finais -> mediais etc. */
  normalize: (s: string) => string;
  /** Forma vocalizada comparável: sem cantilação e marcas de leitura, com vogais. */
  vocalKey: (s: string) => string;
  /** Forma consonantal de superfície (sem sinais; letras finais preservadas). */
  consonantal: (s: string) => string;
}

export interface FormCandidate {
  display: string;
  gloss: string;
}

interface ExampleEntry extends FormCandidate {
  vocal: string;
}

export interface RootIndexEntry {
  /** Chave de exibição como no JSON ("ك-ت-ب", "שׁ-מ-ר"). */
  rootKey: string;
  /** Letras da raiz normalizadas, sem separadores nem sinais. */
  rootNorm: string;
  /**
   * Forma de exemplo normalizada -> TODAS as formas atestadas com essa
   * grafia normalizada (ex.: كَتَبَ e كُتُب -> كتب). Nada é sobrescrito.
   */
  examples: Map<string, ExampleEntry[]>;
  info: any;
}

export interface AffixConfig {
  /** Clíticos anteriores: artigo, conjunções, preposições. */
  proclitics: string[];
  /** Prefixos de verbo (imperfeito/yiqtol, futuro). Convenção do TTM; ver rules.ts. */
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
  /** Afixos em forma NORMALIZADA (uso interno). */
  prefix: string | null;
  suffix: string | null;
  /** Forma normalizada que bateu na base. */
  matchedNorm: string;
}

export interface ResolvedMatch extends RootMatch {
  /** Afixos como aparecem na entrada (consonantais, letras finais preservadas). */
  surfacePrefix: string | null;
  surfaceSuffix: string | null;
  glossStatus: GlossStatus;
  /** Glosa específica da forma, ou a descrição geral da raiz. */
  gloss: string;
  /** Forma atestada identificada pela vocalização, ou null. */
  matchedDisplay: string | null;
  /** Formas atestadas compatíveis com a grafia sem vogais do radical. */
  candidates: FormCandidate[];
}

/** Raízes triliterais: resto menor que 3 letras não é candidato. */
const MIN_STEM = 3;
const COMBINING = /\p{M}/u;

export function buildRootIndex(
  data: Record<string, any>,
  normalize: (s: string) => string,
  vocalKey: (s: string) => string = (s) => s,
): RootIndexEntry[] {
  const entries: RootIndexEntry[] = [];
  for (const [rootKey, info] of Object.entries(data)) {
    const rootNorm = normalize(rootKey.replace(/-/g, ''));
    const examples = new Map<string, ExampleEntry[]>();
    for (const [display, gloss] of Object.entries((info as any)?.examples ?? {})) {
      const key = normalize(display as string);
      const list = examples.get(key) ?? [];
      list.push({ display: display as string, gloss: gloss as string, vocal: vocalKey(display as string) });
      examples.set(key, list);
    }
    entries.push({ rootKey, rootNorm, examples, info });
  }
  // Ordem fixa: o resultado não pode depender da ordem do JSON.
  entries.sort((a, b) => (a.rootNorm < b.rootNorm ? -1 : a.rootNorm > b.rootNorm ? 1 : 0));
  return entries;
}

/**
 * Formas normalizadas que aparecem em MAIS DE UMA raiz da base. Nesse caso a
 * raiz seria ambígua; a base atual não tem nenhuma, e um teste garante isso.
 */
export function crossRootCollisions(index: RootIndexEntry[]): string[] {
  const owners = new Map<string, Set<string>>();
  for (const e of index) {
    for (const key of [e.rootNorm, ...e.examples.keys()]) {
      const s = owners.get(key) ?? new Set<string>();
      s.add(e.rootKey);
      owners.set(key, s);
    }
  }
  return [...owners.entries()].filter(([, s]) => s.size > 1).map(([k]) => k);
}

type HitKind = 'raiz' | 'exemplo';
interface FormHit {
  entry: RootIndexEntry;
  kind: HitKind;
}

function findRootForm(norm: string, index: RootIndexEntry[]): FormHit | null {
  for (const entry of index) {
    if (norm === entry.rootNorm) return { entry, kind: 'raiz' };
  }
  return null;
}

function findExample(norm: string, index: RootIndexEntry[]): FormHit | null {
  for (const entry of index) {
    if (entry.examples.has(norm)) return { entry, kind: 'exemplo' };
  }
  return null;
}

/** Letras da raiz OU exemplo atestado. */
function findAttested(norm: string, index: RootIndexEntry[]): FormHit | null {
  return findRootForm(norm, index) ?? findExample(norm, index);
}

/** Um resto que começa com sinal combinante (ex.: ponto de sin) não é forma válida. */
function validStem(rest: string): boolean {
  return rest.length >= MIN_STEM && !COMBINING.test(rest[0]);
}

function toMatch(
  hit: FormHit,
  via: MatchVia,
  confidence: RootConfidence,
  prefix: string | null,
  suffix: string | null,
  matchedNorm: string,
): RootMatch {
  return { rootKey: hit.entry.rootKey, info: hit.entry.info, via, confidence, prefix, suffix, matchedNorm };
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
    if (!validStem(rest)) continue;
    const hit = findExample(rest, index);
    // rest !== rootNorm: ת/ה/ة não reduzem à raiz nua (מלכת × משמרת).
    if (hit && rest !== hit.entry.rootNorm) {
      return toMatch(hit, viaWithSuffix(prefixVia), 'media', prefix, suf, rest);
    }
  }
  for (const suf of byLengthDesc(affixes.suffixesToRoot)) {
    if (stem.length <= suf.length || !stem.endsWith(suf)) continue;
    const rest = stem.slice(0, -suf.length);
    if (!validStem(rest)) continue;
    const hit = findAttested(rest, index);
    if (hit) return toMatch(hit, viaWithSuffix(prefixVia), 'media', prefix, suf, rest);
  }
  return null;
}

/** Casamento sobre a forma normalizada (sem vogais). */
export function matchRoot(norm: string, index: RootIndexEntry[], affixes: AffixConfig): RootMatch | null {
  // Camada 1: forma exata — certeza alta.
  const direct = findAttested(norm, index);
  if (direct) return toMatch(direct, direct.kind, 'alta', null, null, norm);

  const prefixes: Array<[string, MatchVia]> = [
    ...affixes.proclitics.map((p) => [p, 'proclitico'] as [string, MatchVia]),
    ...affixes.verbalPrefixes.map((p) => [p, 'prefixo_verbal'] as [string, MatchVia]),
  ];
  prefixes.sort((a, b) => b[0].length - a[0].length);

  // Camada 2: um afixo anterior.
  for (const [p, via] of prefixes) {
    if (norm.length <= p.length || !norm.startsWith(p)) continue;
    const rest = norm.slice(p.length);
    if (!validStem(rest)) continue;
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
    if (!validStem(rest)) continue;
    const hit = trySuffix(rest, p, via, index, affixes);
    if (hit) return hit;
  }

  // Sem evidência: raiz não identificada.
  return null;
}

/**
 * Divide a entrada em grupos "letra base + sinais que a seguem". Cada grupo
 * ocupa 1 ou mais unidades na forma normalizada (o sin ocupa 2: ש + U+05C2;
 * cantilação e vogais, 0). Serve para recortar a entrada original nas mesmas
 * posições em que o casamento recortou a forma normalizada.
 */
function clusters(form: string): string[] {
  const out: string[] = [];
  for (const ch of form) {
    if (COMBINING.test(ch) && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

/** Recorta a entrada original em [antes | radical | depois] pelas larguras normalizadas. */
function sliceSurface(
  form: string,
  normalize: (s: string) => string,
  prefixLen: number,
  suffixLen: number,
): { before: string; stem: string; after: string } | null {
  const cs = clusters(form).filter((c) => normalize(c).length > 0);
  const widths = cs.map((c) => normalize(c).length);
  let i = 0;
  let acc = 0;
  while (acc < prefixLen && i < cs.length) acc += widths[i++];
  if (acc !== prefixLen) return null;
  let j = cs.length;
  acc = 0;
  while (acc < suffixLen && j > i) acc += widths[--j];
  if (acc !== suffixLen) return null;
  return { before: cs.slice(0, i).join(''), stem: cs.slice(i, j).join(''), after: cs.slice(j).join('') };
}

/**
 * Casa a raiz e resolve o que depende da forma original: afixos de superfície
 * e glosa (específica só quando a vocalização identifica a forma atestada).
 */
export function resolveMatch(
  form: string,
  ortho: Orthography,
  index: RootIndexEntry[],
  affixes: AffixConfig,
): ResolvedMatch | null {
  const norm = ortho.normalize(form);
  const m = matchRoot(norm, index, affixes);
  if (!m) return null;

  const entry = index.find((e) => e.rootKey === m.rootKey)!;
  const description: string = m.info?.description ?? '';
  const parts = sliceSurface(form, ortho.normalize, m.prefix?.length ?? 0, m.suffix?.length ?? 0);
  const examples = entry.examples.get(m.matchedNorm) ?? [];
  const candidates = examples.map(({ display, gloss }) => ({ display, gloss }));

  // Sufixo ou prefixo verbal retirado = forma flexionada (كَتَبُوا "eles
  // escreveram" não é كَتَبَ "ele escreveu"). A glosa dessa forma não está na
  // base, então não é atribuída. Proclíticos (artigo, conjunção, preposição)
  // não mudam o lexema: الكِتَاب continua sendo "livro".
  const inflected = m.suffix !== null || m.via === 'prefixo_verbal';
  let specific: ExampleEntry | null = null;
  if (parts && !inflected) {
    const stemVocal = ortho.vocalKey(parts.stem);
    // Só há identificação se a entrada tem vogais e bate com UMA forma atestada.
    if (stemVocal !== ortho.consonantal(parts.stem)) {
      const same = examples.filter((e) => e.vocal === stemVocal);
      if (same.length === 1) specific = same[0];
    }
  }

  return {
    ...m,
    surfacePrefix: m.prefix && parts ? ortho.consonantal(parts.before) : m.prefix,
    surfaceSuffix: m.suffix && parts ? ortho.consonantal(parts.after) : m.suffix,
    glossStatus: specific ? 'especifica' : 'nao_determinada',
    gloss: specific ? specific.gloss : description,
    matchedDisplay: specific ? specific.display : null,
    candidates,
  };
}
