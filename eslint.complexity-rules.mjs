/**
 * Umbrales de complejidad de OPTIMIZACION.md §1 y CLAUDE.md §3.
 *
 * Viven acá y no dentro de una configuración para que `eslint.config.mjs` (que
 * bloquea el commit) y `eslint.complexity.config.mjs` (el check nombrado
 * `audit:complexity`) apliquen exactamente los mismos números. Duplicarlos era
 * garantizar que un día se separen.
 */

export const COMPLEXITY_RULES = {
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'max-params': ['error', 3],
  'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
};

export const IGNORED_PATHS = [
  '.next/**',
  'node_modules/**',
  'out/**',
  'coverage/**',
  'report/**',
  'next-env.d.ts',
];
