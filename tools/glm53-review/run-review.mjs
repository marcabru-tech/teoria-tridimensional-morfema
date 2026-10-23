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
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_URL = 'https://ldgllm.digiti.net.br/v1/chat/completions';
const DEFAULT_MODEL = 'glm-5.3';
const PROBE_MARKER = 'TTM_GLM53_PROBE_OK';
const USAGE =
  'Uso: node tools/glm53-review/run-review.mjs --prompt <prompt.md> --arabic <lote-1-arabe.md> --hebrew <lote-2-hebraico.md> [--out <dir>] [--model glm-5.3] [--chunk-size 10] [--retries 2] [--skip-probe]';

function parseArgs(argv) {
  const out = {
    prompt: null,
    arabic: null,
    hebrew: null,
    outDir: 'tools/glm53-review/output',
    model: process.env.DIGITI_MAAS_MODEL || DEFAULT_MODEL,
    chunkSize: 10,
    retries: 2,
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
      '--chunk-size': 'chunkSize',
      '--retries': 'retries',
    };
    const key = flags[arg];
    if (!key || !argv[i + 1] || argv[i + 1].startsWith('--')) {
      throw new Error('Argumento inválido ou sem valor.\n' + USAGE);
    }
    out[key] = argv[++i];
  }
  out.chunkSize = Number(out.chunkSize);
  out.retries = Number(out.retries);
  if (!Number.isInteger(out.chunkSize) || out.chunkSize < 0) throw new Error('--chunk-size deve ser inteiro >= 0 (0 = lote inteiro).');
  if (!Number.isInteger(out.retries) || out.retries < 0 || out.retries > 5) throw new Error('--retries deve ser inteiro entre 0 e 5.');
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
    const title = (body.match(/<title>([^<]*)<\/title>/i) || [])[1];
    throw Object.assign(
      new Error(`A Digiti devolveu HTTP ${res.status} com corpo não JSON${title ? ` (${title.trim()})` : ''}: ${title ? '' : body.slice(0, 400)}`),
      { status: res.status },
    );
  }
  if (!res.ok) {
    const detail = json?.error?.message || json?.message || body.slice(0, 1600);
    throw Object.assign(new Error(`Digiti devolveu HTTP ${res.status}: ${detail}`), { status: res.status });
  }
  return responseText(json);
}

// Erros transitórios do gateway/Cloudflare: tenta de novo com espera crescente.
const RETRYABLE = new Set([429, 500, 502, 503, 504, 520, 522, 524]);
async function callWithRetry(opts, retries, label) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callGateway(opts);
    } catch (err) {
      const transient = RETRYABLE.has(err.status) || /Falha ao conectar/.test(err.message);
      if (!transient || attempt >= retries) throw err;
      const wait = 20_000 * (attempt + 1);
      console.warn(`  ${label}: ${err.message.split('\n')[0].slice(0, 120)} — nova tentativa em ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
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

/**
 * Divide um lote Markdown em pedaços de `size` casos. Cada pedaço leva o cabeçalho do
 * lote (atribuições e raízes cobertas) + as seções '### id' correspondentes, sem
 * alterar nenhum caractere. Cabeçalho + todas as seções reconstroem o lote original.
 */
export function splitBatch(content, size) {
  const re = /^###\s+(?:ar|he)-\d{3}\s*$/gm;
  const starts = [...content.matchAll(re)].map((m) => m.index);
  if (!starts.length) throw new Error('Nenhuma seção "### id" encontrada no lote.');
  const header = content.slice(0, starts[0]);
  const sections = starts.map((st, k) => content.slice(st, starts[k + 1] ?? content.length));
  if (header + sections.join('') !== content) throw new Error('A divisão do lote não reconstrói o original.');
  if (!size || size >= sections.length) return [content];
  const chunks = [];
  for (let k = 0; k < sections.length; k += size) chunks.push(header + sections.slice(k, k + size).join(''));
  return chunks;
}

const exists = (p) => access(p).then(() => true, () => false);

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
    const chunks = splitBatch(batch.input.content, args.chunkSize);
    console.log(`\n[${i + 2}/3] Lote ${batch.label}: ${chunks.length} chamada(s)…`);
    const texts = [];
    const parts = [];
    for (let k = 0; k < chunks.length; k++) {
      const chunk = chunks[k];
      const stem = chunks.length > 1 ? `${batch.stem}.p${String(k + 1).padStart(2, '0')}` : batch.stem;
      const mdFile = resolve(outDir, `${stem}.md`);
      const metaFile = resolve(outDir, `${stem}.meta.json`);
      const chunkHash = sha256(chunk);
      // Retomada: reaproveita um pedaço já salvo se for do mesmo insumo, completo e sem truncamento.
      if (chunks.length > 1 && (await exists(mdFile)) && (await exists(metaFile))) {
        const prev = JSON.parse(await readFile(metaFile, 'utf8'));
        const prevText = (await readFile(mdFile, 'utf8')).trim();
        if (prev.input?.sha256 === chunkHash && prev.finish_reason !== 'length' && !auditIds(chunk, prevText).missing_ids.length) {
          console.log(`  pedaço ${k + 1}/${chunks.length}: já concluído, reaproveitado`);
          texts.push(prevText);
          parts.push({ file: basename(mdFile), sha256_input: chunkHash, reused: true });
          continue;
        }
      }
      console.log(`  pedaço ${k + 1}/${chunks.length}: enviando…`);
      const result = await callWithRetry(
        {
          url,
          key,
          model: args.model,
          maxTokens,
          messages: [
            { role: 'system', content: prompt.content },
            { role: 'user', content: chunk },
          ],
        },
        args.retries,
        `pedaço ${k + 1}`,
      );
      await saveResult(
        outDir,
        stem,
        result,
        { source_file: basename(batch.input.path), part: k + 1, parts: chunks.length, sha256: chunkHash, bytes: Buffer.byteLength(chunk, 'utf8') },
        args.model,
      );
      const audit = auditIds(chunk, result.text);
      if (result.finishReason === 'length') {
        throw new Error(`Lote ${batch.label}, pedaço ${k + 1}: truncado (finish_reason=length). Rode de novo com DIGITI_MAX_TOKENS maior ou --chunk-size menor.`);
      }
      if (audit.missing_ids.length) console.warn(`  IDs ausentes neste pedaço: ${audit.missing_ids.join(', ')}`);
      texts.push(result.text);
      parts.push({ file: basename(mdFile), sha256_input: chunkHash, finish_reason: result.finishReason, usage: result.usage });
    }
    // Resultado consolidado do lote inteiro
    const combined = texts.join('\n');
    const outFile = resolve(outDir, `${batch.stem}.md`);
    if (chunks.length > 1) {
      await writeFile(outFile, combined + '\n', 'utf8');
      await writeFile(
        resolve(outDir, `${batch.stem}.meta.json`),
        JSON.stringify(
          {
            saved_at: new Date().toISOString(),
            model_requested: args.model,
            input: { source_file: basename(batch.input.path), sha256: batch.input.sha256, chunk_size: args.chunkSize },
            parts,
            output: { file: basename(outFile), sha256: sha256(combined) },
          },
          null,
          2,
        ) + '\n',
        'utf8',
      );
    }
    const audit = auditIds(batch.input.content, combined);
    await writeFile(resolve(outDir, `${batch.stem}.audit.json`), JSON.stringify(audit, null, 2) + '\n', 'utf8');
    console.log(`Resultado: ${outFile}`);
    console.log(`IDs esperados: ${audit.expected_count}; IDs ausentes na resposta: ${audit.missing_ids.length}`);
    if (audit.missing_ids.length) console.warn(`Verifique omissões: ${audit.missing_ids.join(', ')}`);
  }

  console.log('\nConcluído. Revise os arquivos .md, .meta.json e .audit.json antes de aceitar a resposta como completa.');
}

const isMain = Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch((err) => {
  console.error(`ERRO: ${err.message}`);
  process.exitCode = 1;
});
