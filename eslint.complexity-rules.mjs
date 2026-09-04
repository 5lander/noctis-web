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
  // Copias de trabajo que quedaron de P11. Están en `.gitignore`, pero eso no
  // las esconde de las herramientas: hasta que se excluyeron acá y en
  // `tsconfig.json`, `audit:types` y `audit:lint` fallaban por archivos que ya
  // nadie considera parte del proyecto, y un check que falla por ruido es un
  // check que se termina ignorando.
  '_to_delete/**',
];
