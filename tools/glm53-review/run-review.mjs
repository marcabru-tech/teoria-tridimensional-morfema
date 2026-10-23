#!/usr/bin/env node
/**
 * TTM S2 reference-set review runner for the Digiti OpenAI-compatible gateway.
 *
 * Sends the Claude-authored prompt and the two supplied Markdown lots unchanged.
 * Runs a small GLM-5.3 route probe first; if the gateway does not return the marker,
 * the two large review requests are NOT sent.
 *
 * Required environment variable: MAAS_API_KEY
 * Optional: DIGITI_MAAS_URL, DIGITI_MAAS_MODEL, DIGITI_MAX_TOKENS
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const DEFAULT_URL = 'https://ldgllm.digiti.net.br/v1/chat/completions';
const DEFAULT_MODEL = 'glm-5.3';
const PROBE_MARKER = 'TTM_GLM53_PROBE_OK';
const USAGE =
  'Uso: node tools/glm53-review/run-review.mjs --prompt <prompt.md> --arabic <lote-1-arabe.md> --hebrew <lote-2-hebraico.md> [--out <dir>] [--model glm-5.3] [--skip-probe]';

function parseArgs(argv) {
  const out = {
    prompt: null,
    arabic: null,
    hebrew: null,
    outDir: 'tools/glm53-review/output',
    model: process.env.DIGITI_MAAS_MODEL || DEFAULT_MODEL,
    skipProbe: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--skip-probe') {
      out.skipProbe = true;
      continue;
    }
    const flags = {
      '--prompt': 'prompt',
      '--arabic': 'arabic',
      '--hebrew': 'hebrew',
      '--out': 'outDir',
      '--model': 'model',
    };
    const key = flags[arg];
    if (!key || !argv[i + 1] || argv[i + 1].startsWith('--')) {
      throw new Error('Argumento inválido ou sem valor.\n' + USAGE);
    }
    out[key] = argv[++i];
  }
  if (!out.prompt || !out.arabic || !out.hebrew) {
    throw new Error('Informe o prompt e os dois lotes.\n' + USAGE);
  }
  return out;
}

const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');

async function readInput(path, label) {
  const resolved = resolve(path);
  let content;
  try {
    content = await readFile(resolved, 'utf8');
  } catch (err) {
    throw new Error(`Não consegui ler ${label} em "${resolved}": ${err.message}`);
  }
  if (!content.trim()) throw new Error(`O arquivo ${label} está vazio: ${resolved}`);
  return { path: resolved, content, sha256: sha256(content) };
}

function responseText(json) {
  const choice = json?.choices?.[0];
  const text = choice?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(
      'A API não devolveu texto final em choices[0].message.content. ' +
        'Não usei reasoning_content como resposta final.',
    );
  }
  return {
    text: text.trim(),
    finishReason: choice.finish_reason ?? null,
    responseModel: json.model ?? null,
    responseId: json.id ?? null,
    usage: json.usage ?? null,
  };
}

async function callGateway({ url, key, model, messages, maxTokens }) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: 0,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(300_000),
    });
  } catch (err) {
    throw new Error(`Falha ao conectar à Digiti: ${err.message}`);
  }
  const body = await res.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Error(`A Digiti devolveu HTTP ${res.status} com corpo não JSON: ${body.slice(0, 1600)}`);
  }
  if (!res.ok) {
    const detail = json?.error?.message || json?.message || body.slice(0, 1600);
    throw new Error(`Digiti devolveu HTTP ${res.status}: ${detail}`);
  }
  return responseText(json);
}

async function saveResult(dir, stem, result, inputMeta, modelRequested) {
  const contentFile = resolve(dir, `${stem}.md`);
  const metaFile = resolve(dir, `${stem}.meta.json`);
  await writeFile(contentFile, result.text + '\n', 'utf8');
  // Intentionally do not persist reasoning_content or the full provider response.
  const metadata = {
    saved_at: new Date().toISOString(),
    provider: 'Digiti OpenAI-compatible endpoint',
    model_requested: modelRequested,
    model_returned: result.responseModel,
    response_id: result.responseId,
    finish_reason: result.finishReason,
    usage: result.usage,
    input: inputMeta,
    output: { file: basename(contentFile), sha256: sha256(result.text) },
  };
  await writeFile(metaFile, JSON.stringify(metadata, null, 2) + '\n', 'utf8');
  return { contentFile, metaFile, metadata };
}

function auditIds(inputText, outputText) {
  const ids = [...inputText.matchAll(/^###\s+((?:ar|he)-\d{3})\s*$/gm)].map((m) => m[1]);
  const missing = ids.filter((id) => !new RegExp(`(^|[^\\w-])${id}([^\\w-]|$)`, 'm').test(outputText));
  return { expected_count: ids.length, expected_ids: ids, missing_ids: missing };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = process.env.MAAS_API_KEY;
  if (!key) {
    console.error('Defina MAAS_API_KEY no ambiente. A chave não deve ser salva no repositório.');
    process.exitCode = 2;
    return;
  }
  const url = process.env.DIGITI_MAAS_URL || DEFAULT_URL;
  const maxTokens = Number.parseInt(process.env.DIGITI_MAX_TOKENS || '24000', 10);
  if (!Number.isInteger(maxTokens) || maxTokens < 1000 || maxTokens > 100000) {
    throw new Error('DIGITI_MAX_TOKENS deve ser inteiro entre 1000 e 100000.');
  }

  const prompt = await readInput(args.prompt, 'prompt');
  const arabic = await readInput(args.arabic, 'lote árabe');
  const hebrew = await readInput(args.hebrew, 'lote hebraico');
  const outDir = resolve(args.outDir);
  await mkdir(outDir, { recursive: true });

  console.log(`Gateway: ${url}`);
  console.log(`Modelo solicitado: ${args.model}`);
  console.log(`Saídas locais: ${outDir}`);
  console.log('A chave de API não será exibida nem gravada. reasoning_content não será salvo.');

  if (!args.skipProbe) {
    console.log('\n[1/3] Sonda de rota GLM-5.3 (nenhum lote enviado ainda)…');
    const probe = await callGateway({
      url,
      key,
      model: args.model,
      maxTokens: 2048,
      messages: [
        { role: 'system', content: `Responda exatamente com o marcador ${PROBE_MARKER} e nada mais.` },
        { role: 'user', content: `Teste de conectividade. Escreva exatamente: ${PROBE_MARKER}` },
      ],
    });
    const saved = await saveResult(
      outDir,
      '00-probe',
      probe,
      { sha256: sha256(PROBE_MARKER), bytes: PROBE_MARKER.length },
      args.model,
    );
    if (!probe.text.includes(PROBE_MARKER)) {
      throw new Error(
        `A chamada chegou ao gateway, mas a sonda não confirmou o modelo. Confira ${saved.contentFile}; os lotes grandes NÃO foram enviados.`,
      );
    }
    if (probe.responseModel && probe.responseModel.toLowerCase() !== args.model.toLowerCase()) {
      throw new Error(
        `Foi solicitado ${args.model}, mas o gateway informou ${probe.responseModel}. Os lotes grandes NÃO foram enviados.`,
      );
    }
    if (probe.finishReason === 'length') {
      throw new Error('A resposta da sonda foi truncada; os lotes grandes NÃO foram enviados.');
    }
    console.log(`Sonda OK. Modelo retornado: ${probe.responseModel || '(não informado)'}`);
  } else {
    console.warn('AVISO: --skip-probe usado; o suporte de glm-5.3 na rota Digiti não foi revalidado.');
  }

  const batches = [
    { stem: '01-arabe', label: 'árabe', input: arabic },
    { stem: '02-hebraico', label: 'hebraico', input: hebrew },
  ];
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n[${i + 2}/3] Enviando revisão do lote ${batch.label}…`);
    const result = await callGateway({
      url,
      key,
      model: args.model,
      maxTokens,
      messages: [
        { role: 'system', content: prompt.content },
        { role: 'user', content: batch.input.content },
      ],
    });
    const saved = await saveResult(
      outDir,
      batch.stem,
      result,
      {
        source_file: basename(batch.input.path),
        sha256: batch.input.sha256,
        bytes: Buffer.byteLength(batch.input.content, 'utf8'),
      },
      args.model,
    );
    const audit = auditIds(batch.input.content, result.text);
    const auditFile = resolve(outDir, `${batch.stem}.audit.json`);
    await writeFile(auditFile, JSON.stringify(audit, null, 2) + '\n', 'utf8');
    console.log(`Resultado: ${saved.contentFile}`);
    console.log(`Metadados: ${saved.metaFile}`);
    console.log(`IDs esperados: ${audit.expected_count}; IDs ausentes na resposta: ${audit.missing_ids.length}`);
    if (audit.missing_ids.length) {
      console.warn(`Verifique truncamento/omissões: ${audit.missing_ids.join(', ')}`);
    }
    if (result.finishReason === 'length') {
      throw new Error(
        `Lote ${batch.label} truncado (finish_reason=length). O resultado parcial foi salvo; não o trate como revisão completa.`,
      );
    }
  }

  console.log('\nConcluído. Revise os arquivos .md, .meta.json e .audit.json antes de aceitar a resposta como completa.');
}

main().catch((err) => {
  console.error(`ERRO: ${err.message}`);
  process.exitCode = 1;
});
