/**
 * `audit:forbidden` — lo que CLAUDE.md §8 y SEGURIDAD.md prohíben, verificado.
 *
 * Corre en `audit:fast`, o sea en el pre-commit: son las prohibiciones que no
 * pueden depender de que alguien las recuerde. Este archivo vive en `scripts/`
 * y `scripts/` no se escanea, porque si no el detector se detectaría a sí mismo.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SCANNED_DIRS = ['src'];
const SCANNED_ROOT_FILES = ['next.config.ts', 'eslint.config.mjs', 'eslint.complexity.config.mjs'];
const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.cjs', '.css']);
const SKIPPED_DIRS = new Set(['node_modules', '.next', '.git', 'out', 'coverage', 'report']);

/**
 * Excepciones declaradas de `html-crudo`.
 *
 * `CLAUDE.md` §8 prohíbe `dangerouslySetInnerHTML` **con contenido de usuario**;
 * §10 exige un script en línea que fije el modo antes del primer pintado, y en
 * React eso no se escribe de otra forma. La lista se imprime en cada corrida:
 * una excepción que nadie ve deja de ser una excepción y pasa a ser un agujero.
 *
 * Para agregar una hace falta un ADR. Hoy hay una.
 */
const RAW_HTML_EXCEPTIONS = new Set([`src${sep}components${sep}theme${sep}theme-script.tsx`]);

const RULES = [
  {
    id: 'supresion-de-tipos',
    pattern: /@ts-(?:ignore|nocheck|expect-error)/,
    message: 'Silenciar al compilador está prohibido (CLAUDE.md §8). Arregla el tipo.',
  },
  {
    id: 'supresion-de-lint',
    pattern: /eslint-disable/,
    message: 'Desactivar el linter está prohibido (CLAUDE.md §8). Refactoriza.',
  },
  {
    id: 'tipo-any',
    pattern: /(?::\s*any\b)|(?:\bas\s+any\b)|(?:<any>)|(?:\bany\[\])|(?:Array<any>)/,
    message: '`any` está prohibido (CLAUDE.md §3). Usa `unknown` y estrecha.',
  },
  {
    id: 'html-crudo',
    pattern: /dangerouslySetInnerHTML/,
    message: 'Prohibido con datos que hayan tocado a un usuario (SEGURIDAD.md §4.1).',
    exceptFiles: RAW_HTML_EXCEPTIONS,
  },
  {
    id: 'script-desde-cdn',
    pattern: /(?:cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com)/,
    message: 'GSAP y todo script se sirven desde el propio dominio (CLAUDE.md §1).',
  },
  {
    id: 'sql-interpolado',
    pattern: /`[^`]*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^`]*\$\{/i,
    message: 'SQL interpolado (SEGURIDAD.md §1.1). Consultas parametrizadas siempre.',
  },
];

const DOMAIN_PATH = `${sep}domain${sep}`;
const DOMAIN_RULES = [
  {
    id: 'entorno-en-el-dominio',
    pattern: /process\.env/,
    message: 'El dominio no lee variables de entorno (CLAUDE.md §2).',
  },
];

function collectFiles(directory, found) {
  for (const entry of readdirSync(directory)) {
    if (SKIPPED_DIRS.has(entry)) continue;
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) collectFiles(fullPath, found);
    else if (SCANNED_EXTENSIONS.has(extname(entry))) found.push(fullPath);
  }
  return found;
}

function rulesFor(filePath) {
  const relativePath = relative(ROOT, filePath);
  const applicable = RULES.filter((rule) => rule.exceptFiles?.has(relativePath) !== true);
  return filePath.includes(DOMAIN_PATH) ? [...applicable, ...DOMAIN_RULES] : applicable;
}

function scanFile(filePath) {
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const findings = [];
  for (const [index, line] of lines.entries()) {
    for (const rule of rulesFor(filePath)) {
      if (rule.pattern.test(line)) {
        findings.push({ file: relative(ROOT, filePath), line: index + 1, rule });
      }
    }
  }
  return findings;
}

function versionedEnvFiles() {
  const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n');
  return tracked
    .filter((file) => /(?:^|\/)\.env(?:\.|$)/.test(file) && file !== '.env.example')
    .map((file) => ({
      file,
      line: 0,
      rule: {
        id: 'env-versionado',
        message: 'Un archivo .env jamás se versiona (SEGURIDAD.md §9).',
      },
    }));
}

function scanEverything() {
  const files = SCANNED_ROOT_FILES.map((name) => join(ROOT, name));
  for (const directory of SCANNED_DIRS) files.push(...collectFiles(join(ROOT, directory), []));
  return [...files.flatMap(scanFile), ...versionedEnvFiles()];
}

function describeExceptions() {
  const declared = [...RAW_HTML_EXCEPTIONS];
  return `${declared.length} excepción(es) declarada(s) de html-crudo: ${declared.join(', ')}`;
}

const findings = scanEverything();

console.log(`audit:forbidden — ${describeExceptions()}`);

if (findings.length === 0) {
  console.log('audit:forbidden — sin hallazgos');
  process.exit(0);
}

console.error(`audit:forbidden — ${findings.length} hallazgo(s)`);
for (const { file, line, rule } of findings) {
  console.error(`  ${file}:${line}  [${rule.id}] ${rule.message}`);
}
process.exit(1);
