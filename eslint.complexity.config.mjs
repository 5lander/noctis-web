/**
 * `audit:complexity` — solo los umbrales de OPTIMIZACION.md §8 (I2).
 *
 * Existe aparte para que el check se pueda correr y leer solo, sin el ruido del
 * resto del linting. Los números son los mismos: salen del mismo módulo.
 */

import tseslint from 'typescript-eslint';

import { COMPLEXITY_RULES, IGNORED_PATHS } from './eslint.complexity-rules.mjs';

export default tseslint.config(
  { ignores: [...IGNORED_PATHS, '**/*.spec.ts', '**/*.spec.tsx'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser: tseslint.parser },
    rules: COMPLEXITY_RULES,
  },
);
