/**
 * Los colores que el cielo de la portada necesita, leídos de los tokens.
 *
 * El shader necesita números, no cadenas, y `CLAUDE.md` §10 prohíbe escribir un
 * color fuera de `tokens.css`. La salida es leerlos en tiempo de ejecución del
 * `<html>`: así el cielo cambia con el modo claro/oscuro sin duplicar la paleta,
 * y un cambio en `tokens.css` llega al WebGL sin tocar este archivo.
 */

/** Componentes en el rango 0–1, que es lo que espera un shader. */
export interface RgbColor {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const SHORT_HEX_LENGTH = 4;
/** Un canal ocupa dos dígitos hexadecimales. */
const DIGITS_PER_CHANNEL = 2;
const BLACK: RgbColor = { red: 0, green: 0, blue: 0 };
const RED = 0;
const GREEN = 1;
const BLUE = 2;

function channelAt(hex: string, position: number): number {
  const start = 1 + position * DIGITS_PER_CHANNEL;
  const digits = hex.slice(start, start + DIGITS_PER_CHANNEL);
  return Number.parseInt(digits, HEX_RADIX) / CHANNEL_MAX;
}

function expandShortHex(hex: string): string {
  const digits = [...hex.slice(1)].map((digit) => digit + digit).join('');
  return `#${digits}`;
}

/** Solo entiende hexadecimal: es lo único que `tokens.css` escribe. */
export function parseHexColor(value: string): RgbColor {
  const hex = value.trim();
  if (!hex.startsWith('#')) return BLACK;

  const full = hex.length === SHORT_HEX_LENGTH ? expandShortHex(hex) : hex;
  const color: RgbColor = {
    red: channelAt(full, RED),
    green: channelAt(full, GREEN),
    blue: channelAt(full, BLUE),
  };

  const broken = Number.isNaN(color.red) || Number.isNaN(color.green) || Number.isNaN(color.blue);
  return broken ? BLACK : color;
}

export function readBrandColor(token: string): RgbColor {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token);
  return parseHexColor(value);
}
