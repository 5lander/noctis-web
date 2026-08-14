/**
 * `audit:secrets` — ningún secreto entra al repositorio (SEGURIDAD.md §9).
 *
 * En el pre-commit mira **solo lo que se está por commitear**: es lo barato y lo
 * que corta el error en el momento. En CI, donde no hay diff preparado, mira
 * todos los archivos versionados.
 *
 * Se excluye a sí mismo: contiene los patrones que busca.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SELF = 'scripts/audit-secrets.mjs';
const EXCLUDED_FILES = new Set([SELF, '.env.example', 'package-lock.json']);
const EXCLUDED_EXTENSIONS = /\.(?:png|jpg|jpeg|webp|avif|gif|ico|woff2?|ttf|otf|pdf|zip)$/i;
const ADDED_LINE = /^\+(?!\+\+)/;

const PATTERNS = [
  { id: 'clave-privada', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { id: 'cuenta-de-servicio-google', pattern: /"private_key"\s*:/ },
  { id: 'clave-api-google', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'clave-aws', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'clave-brevo', pattern: /\bxkeysib-[0-9a-f]{16}/ },
  { id: 'clave-de-modelo', pattern: /\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}/ },
  { id: 'token-github', pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}/ },
  {
    id: 'asignacion-de-secreto',
    pattern:
      /\b(?:password|passwd|secret|api[_-]?key|apikey|token|authorization)\b\s*[:=]\s*['"][^'"\s]{16,}['"]/i,
  },
];

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function matchesIn(text, location) {
  const findings = [];
  for (const { id, pattern } of PATTERNS) {
    if (pattern.test(text)) findings.push({ location, id });
  }
  return findings;
}

function scanStagedDiff(stagedFiles) {
  const diff = git(['diff', '--cached', '--unified=0', '--no-color', '--', ...stagedFiles]);
  let currentFile = 'diff';
  const findings = [];
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) currentFile = line.slice('+++ b/'.length);
    else if (ADDED_LINE.test(line)) findings.push(...matchesIn(line, currentFile));
  }
  return findings;
}

function scannableFiles() {
  return git(['ls-files'])
    .split('\n')
    .filter((file) => file !== '' && !EXCLUDED_FILES.has(file) && !EXCLUDED_EXTENSIONS.test(file));
}

function scanTrackedFiles() {
  return scannableFiles().flatMap((file) => matchesIn(readFileSync(file, 'utf8'), file));
}

function stagedScannableFiles() {
  return git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
    .split('\n')
    .filter((file) => file !== '' && !EXCLUDED_FILES.has(file) && !EXCLUDED_EXTENSIONS.test(file));
}

const staged = stagedScannableFiles();
const findings = staged.length > 0 ? scanStagedDiff(staged) : scanTrackedFiles();
const scope = staged.length > 0 ? 'diff preparado' : 'archivos versionados';

if (findings.length === 0) {
  console.log(`audit:secrets — sin hallazgos (${scope})`);
  process.exit(0);
}

console.error(`audit:secrets — ${findings.length} hallazgo(s) en el ${scope}`);
for (const { location, id } of findings) {
  console.error(`  ${location}  [${id}] posible secreto. Sácalo del repositorio y rótalo.`);
}
process.exit(1);
