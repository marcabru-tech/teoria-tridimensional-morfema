#!/usr/bin/env node
/**
 * Consulta única a um modelo da Digiti (padrão: glm-5.3) com uma tarefa e um pacote de contexto.
 *
 * Uma tarefa é uma pasta com:
 *   prompt.md   — instruções (vai como mensagem de sistema)
 *   contexto.md — arquivos de código e documentos (vai como mensagem do usuário)
 *
 * Uso (a partir da raiz do repositório):
 *   node tools/glm53-review/ask.mjs --task tools/glm53-review/tasks/revisao-motor [--model glm-5.3] [--out <dir>]
 *
 * Requer MAAS_API_KEY no ambiente. Usa streaming; só o texto final (delta.content) é salvo,
 * nunca o raciocínio. Grava <out>/<tarefa>.<modelo>.md e .meta.json (fora do Git).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { callStreaming } from './run-review.mjs';

const DEFAULT_URL = 'https://ldgllm.digiti.net.br/v1/chat/completions';
const USAGE = 'Uso: node tools/glm53-review/ask.mjs --task <pasta da tarefa> [--model glm-5.3] [--out <dir>]';
const sha256 = (v) => createHash('sha256').update(v, 'utf8').digest('hex');

function parseArgs(argv) {
  const out = { task: null, model: process.env.DIGITI_MAAS_MODEL || 'glm-5.3', outDir: 'tools/glm53-review/output' };
  const flags = { '--task': 'task', '--model': 'model', '--out': 'outDir' };
  for (let i = 0; i < argv.length; i++) {
    const k = flags[argv[i]];
    if (!k || !argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Argumento inválido: ${argv[i]}\n${USAGE}`);
    out[k] = argv[++i];
  }
  if (!out.task) throw new Error(USAGE);
  return out;
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
  const maxTokens = Number.parseInt(process.env.DIGITI_MAX_TOKENS || '32000', 10);
  const taskDir = resolve(args.task);
  const taskName = basename(taskDir);
  const prompt = await readFile(resolve(taskDir, 'prompt.md'), 'utf8');
  const context = await readFile(resolve(taskDir, 'contexto.md'), 'utf8');
  const outDir = resolve(args.outDir);
  await mkdir(outDir, { recursive: true });

  console.log(`Tarefa: ${taskName}`);
  console.log(`Modelo: ${args.model} via ${url}`);
  console.log(`Contexto: ${(Buffer.byteLength(context, 'utf8') / 1024).toFixed(0)} KB`);
  console.log('O modelo raciocina antes de responder: pode levar de 10 a 30 min. Um ponto aparece a cada minuto com dados chegando.\n');

  const t0 = Date.now();
  let lastDot = Date.now();
  const timer = setInterval(() => {
    const min = Math.floor((Date.now() - t0) / 60000);
    process.stdout.write(Date.now() - lastDot < 65_000 ? '.' : `[${min} min, aguardando dados]`);
  }, 60_000);
  let result;
  try {
    result = await callStreaming({
      url,
      key,
      model: args.model,
      maxTokens,
      idleMs: 5 * 60_000,
      totalMs: 60 * 60_000,
      onData: () => {
        lastDot = Date.now();
      },
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: context },
      ],
    });
  } finally {
    clearInterval(timer);
  }
  const minutes = ((Date.now() - t0) / 60000).toFixed(1);
  const stem = `${taskName}.${args.model}`;
  const mdFile = resolve(outDir, `${stem}.md`);
  await writeFile(mdFile, result.text + '\n', 'utf8');
  await writeFile(
    resolve(outDir, `${stem}.meta.json`),
    JSON.stringify(
      {
        saved_at: new Date().toISOString(),
        task: taskName,
        model_requested: args.model,
        model_returned: result.responseModel,
        response_id: result.responseId,
        finish_reason: result.finishReason,
        usage: result.usage,
        minutes: Number(minutes),
        input: { prompt_sha256: sha256(prompt), context_sha256: sha256(context) },
        output: { file: basename(mdFile), sha256: sha256(result.text) },
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  console.log(`\n\nConcluído em ${minutes} min. Resposta: ${mdFile}`);
  if (result.finishReason === 'length') {
    console.warn('AVISO: resposta truncada (finish_reason=length). Rode de novo com $env:DIGITI_MAX_TOKENS = "64000".');
  }
}

main().catch((err) => {
  console.error(`\nERRO: ${err.message}`);
  process.exitCode = 1;
});
