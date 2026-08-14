import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Contraste AA, calculado — no afirmado.
 *
 * El criterio de aceptación de P1 dice "contraste AA verificado en ambos modos,
 * con atención a `--texto-2` sobre `--fondo-2`". Una casilla marcada a mano se
 * desactualiza el día que alguien retoca un token; esta prueba lee `tokens.css`
 * y calcula la razón según WCAG 2.1, así que se entera sola.
 *
 * `--texto-3` no aparece: es un token decorativo (puntos, separadores y las
 * filas del registro nocturno, que va con `aria-hidden`). El único sitio donde
 * tocaba texto de verdad era el marcador de posición de los campos, y esa línea
 * tiene su propia prueba más abajo.
 */

const TOKENS_CSS = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8');
const FIELD_CSS = readFileSync(
  fileURLToPath(new URL('../components/ui/field.module.css', import.meta.url)),
  'utf8',
);

const AA_NORMAL_TEXT = 4.5;

type TokenMap = Readonly<Record<string, string>>;

function blockOf(selector: string): string {
  const start = TOKENS_CSS.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No existe el bloque ${selector} en tokens.css`);
  const end = TOKENS_CSS.indexOf('}', start);
  return TOKENS_CSS.slice(start, end);
}

function tokensOf(selector: string): TokenMap {
  const found: Record<string, string> = {};
  for (const line of blockOf(selector).split('\n')) {
    const match = /^\s*(--[a-z0-9-]+):\s*(#[0-9a-f]{6});/i.exec(line);
    if (match !== null && match[1] !== undefined && match[2] !== undefined) {
      found[match[1]] = match[2];
    }
  }
  return found;
}

function channelLuminance(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const red = channelLuminance(Number.parseInt(hex.slice(1, 3), 16));
  const green = channelLuminance(Number.parseInt(hex.slice(3, 5), 16));
  const blue = channelLuminance(Number.parseInt(hex.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function ratioIn(tokens: TokenMap, foreground: string, background: string): number {
  const from = tokens[foreground];
  const over = tokens[background];
  if (from === undefined || over === undefined) {
    throw new Error(`Falta ${foreground} o ${background} en el bloque`);
  }
  return contrastRatio(from, over);
}

/** Los dos modos, y los dos con la franja invertida encima. */
const PALETTES: readonly { readonly name: string; readonly tokens: TokenMap }[] = [
  { name: 'modo oscuro', tokens: tokensOf("html[data-mode='dark']") },
  { name: 'modo claro', tokens: tokensOf("html[data-mode='light']") },
  {
    name: 'franja invertida sobre modo oscuro',
    tokens: {
      ...tokensOf("html[data-mode='dark'] .inv"),
      // `.inv` toma --fondo de --inv-fondo y --texto de --inv-texto.
      '--fondo': tokensOf("html[data-mode='dark']")['--inv-fondo'] ?? '',
      '--texto': tokensOf("html[data-mode='dark']")['--inv-texto'] ?? '',
    },
  },
  {
    name: 'franja invertida sobre modo claro',
    tokens: {
      ...tokensOf("html[data-mode='light'] .inv"),
      '--fondo': tokensOf("html[data-mode='light']")['--inv-fondo'] ?? '',
      '--texto': tokensOf("html[data-mode='light']")['--inv-texto'] ?? '',
    },
  },
];

describe('contraste AA de los tokens', () => {
  it.each(PALETTES)('$name: el texto principal cumple AA sobre los dos fondos', ({ tokens }) => {
    expect(ratioIn(tokens, '--texto', '--fondo')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(ratioIn(tokens, '--texto', '--fondo-2')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it.each(PALETTES)('$name: el texto secundario cumple AA sobre los dos fondos', ({ tokens }) => {
    expect(ratioIn(tokens, '--texto-2', '--fondo')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(ratioIn(tokens, '--texto-2', '--fondo-2')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('la franja invertida redefine también el fondo secundario', () => {
    expect(tokensOf("html[data-mode='dark'] .inv")['--fondo-2']).toBeDefined();
    expect(tokensOf("html[data-mode='light'] .inv")['--fondo-2']).toBeDefined();
  });

  it('el marcador de posición no usa el token decorativo', () => {
    const placeholderRule = /::placeholder[^}]*\{[^}]*\}/.exec(FIELD_CSS)?.[0] ?? '';

    expect(placeholderRule).toContain('--texto-2');
    expect(placeholderRule).not.toContain('--texto-3');
  });
});

describe('la calculadora de contraste', () => {
  it('da 21 entre blanco y negro', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('da 1 entre un color y sí mismo', () => {
    expect(contrastRatio('#96969e', '#96969e')).toBeCloseTo(1, 5);
  });
});
