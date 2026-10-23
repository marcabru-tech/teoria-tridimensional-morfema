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
  'Uso: node tools/glm53-review/run-review.mjs --prompt <prompt.md> --arabic <lote-1-arabe.md> --hebrew <lote-2-hebraico.md> [--out <dir>] [--model glm-5.3] [--chunk-size 10] [--retries 2] [--no-stream] [--reasoning-effort low|high|max] [--skip-probe]\n       node tools/glm53-review/run-review.mjs --diagnose --arabic <lote-1-arabe.md> --prompt <prompt.md>';

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
    if (arg === '--no-stream') {
      out.noStream = true;
      continue;
    }
    if (arg === '--diagnose') {
      out.diagnose = true;
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
      '--reasoning-effort': 'reasoningEffort',
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
  if (out.diagnose) {
    if (!out.prompt || !out.arabic) throw new Error('--diagnose precisa de --prompt e --arabic.\n' + USAGE);
    return out;
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

async function httpError(res) {
  const body = await res.text();
  let json = null;
  try {
    json = JSON.parse(body);
  } catch {
    /* corpo HTML, por exemplo da Cloudflare */
  }
  const title = (body.match(/<title>([^<]*)<\/title>/i) || [])[1];
  const detail = json?.error?.message || json?.message || (title ? title.trim() : body.slice(0, 400));
  return Object.assign(new Error(`Digiti devolveu HTTP ${res.status}: ${detail}`), { status: res.status });
}

/**
 * Chamada sem streaming: a resposta inteira chega de uma vez. Atrás da Cloudflare,
 * respostas que demoram mais de ~100 s resultam em HTTP 504.
 */
async function callBuffered({ url, key, model, messages, maxTokens, reasoningEffort }) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false, temperature: 0, max_tokens: maxTokens, ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}) }),
      signal: AbortSignal.timeout(300_000),
    });
  } catch (err) {
    throw new Error(`Falha ao conectar à Digiti: ${err.message}${err.cause ? ` (${err.cause.code || err.cause.message})` : ''}`);
  }
  if (!res.ok) throw await httpError(res);
  const body = await res.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    throw Object.assign(new Error(`A Digiti devolveu HTTP ${res.status} com corpo não JSON: ${body.slice(0, 400)}`), { status: res.status });
  }
  return responseText(json);
}

/**
 * Chamada com streaming (SSE): os tokens chegam aos poucos, então a conexão não fica
 * ociosa e a Cloudflare não a corta por tempo. Junta só `delta.content`; o raciocínio
 * (`delta.reasoning_content`) é descartado, nunca salvo.
 */
async function callStreaming({ url, key, model, messages, maxTokens, reasoningEffort, onFirstByte }) {
  const IDLE_MS = 180_000; // sem nenhum dado por 3 min => aborta
  const TOTAL_MS = 30 * 60_000; // teto de 30 min por chamada
  const ctrl = new AbortController();
  const total = setTimeout(() => ctrl.abort(new Error('tempo total de 30 min esgotado')), TOTAL_MS);
  let idle;
  const touch = () => {
    clearTimeout(idle);
    idle = setTimeout(() => ctrl.abort(new Error('3 min sem receber dados')), IDLE_MS);
  };
  try {
    let res;
    try {
      touch();
      res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ model, messages, stream: true, temperature: 0, max_tokens: maxTokens, ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}) }),
        signal: ctrl.signal,
      });
    } catch (err) {
      throw new Error(`Falha ao conectar à Digiti: ${err.message}${err.cause ? ` (${err.cause.code || err.cause.message})` : ''}`);
    }
    if (!res.ok) throw await httpError(res);
    const ctype = res.headers.get('content-type') || '';
    if (!ctype.includes('text/event-stream')) {
      // Gateway ignorou stream=true e respondeu tudo de uma vez.
      const body = await res.text();
      return responseText(JSON.parse(body));
    }
    let content = '';
    let finishReason = null;
    let responseModel = null;
    let responseId = null;
    let usage = null;
    let buffer = '';
    const decoder = new TextDecoder();
    try {
      let first = true;
      for await (const chunk of res.body) {
        touch();
        if (first && onFirstByte) onFirstByte();
        first = false;
        buffer += decoder.decode(chunk, { stream: true });
        let nl;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          let evt;
          try {
            evt = JSON.parse(data);
          } catch {
            continue;
          }
          if (evt.error) throw new Error(`Digiti devolveu erro no stream: ${evt.error.message || JSON.stringify(evt.error)}`);
          responseModel = evt.model ?? responseModel;
          responseId = evt.id ?? responseId;
          if (evt.usage) usage = evt.usage;
          const choice = evt.choices?.[0];
          if (choice?.delta?.content) content += choice.delta.content;
          if (choice?.finish_reason) finishReason = choice.finish_reason;
        }
      }
    } catch (err) {
      throw new Error(`Stream interrompido: ${err.message}${err.cause ? ` (${err.cause.code || err.cause.message})` : ''}`);
    }
    if (!content.trim()) {
      throw new Error('O stream terminou sem texto final em delta.content. Não usei reasoning_content como resposta final.');
    }
    return { text: content.trim(), finishReason, responseModel, responseId, usage, streamed: true };
  } finally {
    clearTimeout(total);
    clearTimeout(idle);
  }
}

let STREAM = true;
function callGateway(opts) {
  return STREAM ? callStreaming(opts) : callBuffered(opts);
}

// Erros transitórios do gateway/Cloudflare: tenta de novo com espera crescente.
const RETRYABLE = new Set([429, 500, 502, 503, 504, 520, 522, 524]);
async function callWithRetry(opts, retries, label) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callGateway(opts);
    } catch (err) {
      const transient = RETRYABLE.has(err.status) || /Falha ao conectar|Stream interrompido/.test(err.message);
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

/**
 * Diagnóstico: 3 chamadas de 1 caso cada, em sequência, medindo o tempo até o primeiro
 * byte e o tempo total. Não grava respostas, só imprime uma tabela.
 */
async function diagnose({ url, key, prompt, arabic, maxTokens }) {
  const oneCase = splitBatch(arabic.content, 1)[0];
  const scenarios = [
    { label: 'glm-5.3, streaming, raciocínio padrão', model: 'glm-5.3' },
    { label: 'glm-5.3, streaming, reasoning_effort=low', model: 'glm-5.3', reasoningEffort: 'low' },
    { label: 'glm-5.2, streaming, raciocínio padrão', model: 'glm-5.2' },
  ];
  console.log(`Gateway: ${url}`);
  console.log(`Diagnóstico: ${scenarios.length} chamadas de 1 caso (ar-001), uma de cada vez.\n`);
  const rows = [];
  for (const sc of scenarios) {
    const t0 = Date.now();
    let ttfb = null;
    process.stdout.write(`- ${sc.label}… `);
    try {
      const r = await callStreaming({
        url, key, model: sc.model, maxTokens, reasoningEffort: sc.reasoningEffort,
        onFirstByte: () => { ttfb = Date.now() - t0; },
        messages: [{ role: 'system', content: prompt.content }, { role: 'user', content: oneCase }],
      });
      const total = Date.now() - t0;
      const ok = /"id"\s*:\s*"ar-001"/.test(r.text);
      rows.push({ cenário: sc.label, resultado: ok ? 'ok' : 'respondeu sem ar-001', 'streaming repassado': r.streamed ? 'sim' : 'não', '1º byte (s)': ttfb === null ? '—' : (ttfb / 1000).toFixed(1), 'total (s)': (total / 1000).toFixed(1), 'modelo devolvido': r.responseModel || '—', tokens: r.usage?.completion_tokens ?? r.usage?.total_tokens ?? '—' });
      console.log('ok');
    } catch (err) {
      rows.push({ cenário: sc.label, resultado: err.message.split('\n')[0].slice(0, 90), 'streaming repassado': '—', '1º byte (s)': ttfb === null ? '—' : (ttfb / 1000).toFixed(1), 'total (s)': ((Date.now() - t0) / 1000).toFixed(1), 'modelo devolvido': '—', tokens: '—' });
      console.log('falhou');
    }
  }
  console.log('');
  console.table(rows);
  console.log('Copie esta tabela e mande para o Claude e a Luna. Nenhuma resposta foi gravada.');
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
  if (args.diagnose) {
    await diagnose({ url, key, prompt, arabic, maxTokens });
    return;
  }
  const hebrew = await readInput(args.hebrew, 'lote hebraico');
  const outDir = resolve(args.outDir);
  await mkdir(outDir, { recursive: true });

  console.log(`Gateway: ${url}`);
  STREAM = !args.noStream;
  if (args.reasoningEffort) console.log(`reasoning_effort: ${args.reasoningEffort}`);
  console.log(`Modelo solicitado: ${args.model}`);
  console.log(`Modo: ${STREAM ? 'streaming (evita o corte de ~100 s da Cloudflare)' : 'resposta inteira (--no-stream)'}`);
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
          reasoningEffort: args.reasoningEffort,
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
