#!/usr/bin/env node
/**
 * Garante que a cópia da base usada pelo site (web/src/data/roots/) é idêntica
 * à base canônica do pacote Python (data/roots/).
 *
 * O site importa a base estaticamente para que ela entre no bundle do deploy;
 * por isso ela precisa morar dentro de web/. Este script impede que as duas
 * cópias divirjam: roda no CI e sai com código 1 se houver diferença.
 *
 * Uso (a partir de web/): node scripts/check-data-sync.mjs [--fix]
 *   --fix  copia data/roots/ por cima de web/src/data/roots/
 */
import { readFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalDir = join(webDir, '..', 'data', 'roots');
const bundledDir = join(webDir, 'src', 'data', 'roots');
const files = ['arabic_roots.json', 'hebrew_roots.json'];
const fix = process.argv.includes('--fix');

let failed = false;
for (const file of files) {
  const canonical = join(canonicalDir, file);
  const bundled = join(bundledDir, file);
  if (!existsSync(canonical)) {
    console.error(`❌  Base canônica ausente: ${canonical}`);
    failed = true;
    continue;
  }
  const same = existsSync(bundled) && readFileSync(canonical).equals(readFileSync(bundled));
  if (same) {
    console.log(`✅  ${file} sincronizado`);
  } else if (fix) {
    copyFileSync(canonical, bundled);
    console.log(`🔧  ${file} copiado de data/roots/`);
  } else {
    console.error(`❌  ${file} difere de data/roots/ — rode: node scripts/check-data-sync.mjs --fix`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
