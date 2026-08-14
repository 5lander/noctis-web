import js from '@eslint/js';
import next from 'eslint-config-next';
import tseslint from 'typescript-eslint';

import { COMPLEXITY_RULES, IGNORED_PATHS } from './eslint.complexity-rules.mjs';

export default tseslint.config(
  { ignores: IGNORED_PATHS },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...next,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...COMPLEXITY_RULES,

      // CLAUDE.md §3: `any` prohibido, y sin `as` para callar al compilador.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // CLAUDE.md §3: nunca capturar y silenciar; nada de promesas sueltas.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],

      // SEGURIDAD.md §1.2: sin ejecución dinámica de texto.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // El registro estructurado es el único canal (SEGURIDAD.md §8).
      'no-console': 'error',

      'no-magic-numbers': [
        'error',
        { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true, detectObjects: false },
      ],
    },
  },
  {
    // `config/` es una tabla de valores, no lógica: un horario de atención se
    // lee mejor como `minutesOf(9)` que como una constante con nombre por hora.
    files: ['src/config/**/*.ts'],
    rules: { 'no-magic-numbers': 'off' },
  },
  {
    // Las pruebas describen casos con números concretos: exigirles constantes
    // con nombre esconde el dato que hace legible la prueba.
    files: ['**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
    },
  },
  {
    // Los archivos de configuración declaran números: ahí un número con nombre
    // no aclara nada. La regla apunta a la lógica, no a las tablas de valores.
    files: ['**/*.mjs', '**/*.cjs', '*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      parserOptions: { projectService: false, project: false },
      globals: { module: 'writable', require: 'readonly', process: 'readonly' },
    },
    rules: { ...tseslint.configs.disableTypeChecked.rules, 'no-magic-numbers': 'off' },
  },
  {
    // Los scripts de auditoría corren en Node y su salida ES la interfaz.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
);
