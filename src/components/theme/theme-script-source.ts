import { FALLBACK_MODE, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from './theme';

/**
 * El script que fija el modo **antes del primer pintado** (`CLAUDE.md` §10,
 * `SPEC.md` §4.3). Sin él, el navegador pinta con un modo y lo cambia un
 * instante después: eso es el parpadeo.
 *
 * Vive en un módulo sin JSX para poder ejecutarse en una prueba con un
 * documento falso. Es código que corre en el navegador de cada visitante, no lo
 * ve el compilador y no lo cubre ningún tipo: si no se prueba, no se prueba
 * nunca.
 *
 * El orden importa: primero lo que el visitante eligió, y solo si no eligió
 * nada, lo que pida el sistema.
 */
export const THEME_SCRIPT = [
  '(function(){try{',
  `var g=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});`,
  "var m=(g==='dark'||g==='light')?g:",
  "(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');",
  `document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},m);`,
  '}catch(e){',
  `document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},${JSON.stringify(FALLBACK_MODE)});`,
  '}})()',
].join('');
