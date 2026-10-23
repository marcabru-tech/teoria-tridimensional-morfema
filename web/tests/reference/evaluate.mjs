#!/usr/bin/env node
/**
 * Avaliador do motor morfológico do TTM contra o conjunto de referência (S2.1).
 *
 * Envia cada caso de ar.json e he.json para POST /api/analyze e mede, separadamente:
 *   1. Acerto exato nas formas de raízes cobertas (meta do S2.2: >= 90%).
 *   2. Falsos positivos nas armadilhas: o motor devolve uma raiz coberta (meta: 0).
 *   3. Raízes inventadas fora da cobertura: o motor devolve qualquer raiz em vez de
 *      "raiz não identificada" (meta: 0).
 *
 * Uso (a partir de web/):
 *   node tests/reference/evaluate.mjs <BASE_URL> [--report arquivo.md] [--enforce]
 *
 * Sem --enforce, o script sempre sai com código 0: serve para registrar a linha de base.
 * Com --enforce, sai com código 1 se alguma meta do S2.2 não for atingida.
 *
 * Contrato esperado da API: `morpheme.root` vazio ou null quando a raiz não é identificada.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normRoot } from './normalize.mjs';

const USAGE = 'Uso: node tests/reference/evaluate.mjs <BASE_URL> [--report arquivo.md] [--enforce]';
const args = process.argv.slice(2);
let baseUrl = '';
let reportPath = null;
let enforce = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--enforce') enforce = true;
  else if (args[i] === '--report') {
    reportPath = args[i + 1];
    if (!reportPath || reportPath.startsWith('--')) {
      console.error('--report exige o caminho do arquivo.\n' + USAGE);
      process.exit(1);
    }
    i++;
  } else if (!args[i].startsWith('--') && !baseUrl) baseUrl = args[i].replace(/\/$/, '');
  else {
    console.error(`Argumento não reconhecido: ${args[i]}\n${USAGE}`);
    process.exit(1);
  }
}
if (!baseUrl) {
  console.error(USAGE);
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const sets = [
  { lang: 'ar', name: 'Árabe corânico', file: 'ar.json' },
  { lang: 'he', name: 'Hebraico bíblico', file: 'he.json' },
];

async function analyze(text, language) {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} para "${text}"`);
  const json = await res.json();
  return json.morpheme?.root ?? null;
}

const pct = (n, d) => (d === 0 ? '—' : `${((100 * n) / d).toFixed(1)}%`);
const results = [];
let failedGoal = false;
const lines = [];
lines.push('# Relatório do conjunto de referência do TTM');
lines.push('');
lines.push(`Motor avaliado: ${baseUrl}/api/analyze`);
lines.push('');
lines.push('| Língua | Acerto exato nas cobertas (meta ≥ 90%) | Falsos positivos nas armadilhas (meta 0) | Raízes inventadas fora da cobertura (meta 0) |');
lines.push('| --- | --- | --- | --- |');
const detail = [];

for (const set of sets) {
  const data = JSON.parse(readFileSync(join(here, set.file), 'utf-8'));
  const coveredRoots = new Set(
    data.cases.filter((c) => c.category === 'coberta').map((c) => normRoot(c.expected.root)),
  );
  const m = { covered: 0, coveredOk: 0, traps: 0, falsePos: 0, uncovered: 0, invented: 0, uncoveredCovered: 0 };
  const errors = [];
  for (const c of data.cases) {
    const got = await analyze(c.input, set.lang);
    const g = normRoot(got);
    let ok = true;
    let why = '';
    if (c.category === 'coberta') {
      m.covered++;
      ok = g === normRoot(c.expected.root);
      if (ok) m.coveredOk++;
      else why = got ? `devolveu ${got}` : 'não identificou';
    } else if (c.category === 'armadilha') {
      m.traps++;
      if (g && coveredRoots.has(g)) {
        m.falsePos++;
        ok = false;
        why = `falso positivo: ${got}`;
      } else if (g) {
        ok = false;
        why = `raiz inventada: ${got}`;
      }
    } else {
      m.uncovered++;
      if (g) {
        ok = false;
        m.invented++;
        if (coveredRoots.has(g)) m.uncoveredCovered++;
        why = coveredRoots.has(g) ? `raiz coberta indevida: ${got}` : `raiz inventada: ${got}`;
      }
    }
    results.push({ id: c.id, category: c.category, input: c.input, expected: c.expected.output, got, ok });
    if (!ok) errors.push(`| ${c.id} | ${c.category} | ${c.input} | ${c.source.location} | ${c.expected.output} | ${why} |`);
  }
  const coveredRate = m.covered ? m.coveredOk / m.covered : 1;
  if (coveredRate < 0.9 || m.falsePos > 0 || m.invented > 0) failedGoal = true;
  lines.push(
    `| ${set.name} | ${m.coveredOk}/${m.covered} (${pct(m.coveredOk, m.covered)}) | ${m.falsePos}/${m.traps} | ${m.invented}/${m.uncovered}${m.uncoveredCovered ? ` (${m.uncoveredCovered} com raiz coberta indevida)` : ''} |`,
  );
  detail.push(`## ${set.name}: casos que falharam (${errors.length} de ${data.cases.length})`);
  detail.push('');
  if (errors.length) {
    detail.push('| Caso | Categoria | Entrada | Localização | Esperado | Obtido |');
    detail.push('| --- | --- | --- | --- | --- | --- |');
    detail.push(...errors);
  } else {
    detail.push('Nenhum.');
  }
  detail.push('');
}

lines.push('');
lines.push('Nas armadilhas, uma raiz devolvida que não pertence à base também aparece na lista de falhas como raiz inventada, mas só a raiz coberta conta como falso positivo.');
lines.push('');
lines.push(...detail);
const report = lines.join('\n');
console.log(report);
if (reportPath) writeFileSync(reportPath, report + '\n');
if (enforce && failedGoal) {
  console.error('\nMetas do S2.2 não atingidas.');
  process.exit(1);
}
