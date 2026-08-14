/**
 * Contrato del modo claro/oscuro, compartido por el script en línea, el botón y
 * las pruebas. Un solo lugar donde vive el nombre de la clave y el atributo:
 * si el script y el botón usaran claves distintas, la preferencia se perdería
 * sin que nada fallara.
 */

export const THEME_MODES = ['dark', 'light'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_ATTRIBUTE = 'data-mode';
export const THEME_STORAGE_KEY = 'noctis-modo';

/** Lo que se usa si el sistema no expresa preferencia (`SPEC.md` §4.3). */
export const FALLBACK_MODE: ThemeMode = 'dark';

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light';
}

export function oppositeOf(mode: ThemeMode): ThemeMode {
  return mode === 'dark' ? 'light' : 'dark';
}
