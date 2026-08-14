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
 * Desde el rebrand cubre además dos cosas nuevas: que los siete `--color-*` de
 * cada modo sean los del spec de marca §1 letra por letra, y que el color de
 * acción tenga contraste suficiente donde se usa —el botón sólido y la franja
 * invertida—, que es donde el índigo y la lavanda se equivocan de modo.
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
const BRAND_SPEC = readFileSync(
  fileURLToPath(
    new URL('../../docs/identidad-de-marca-noctis/spec-rebrand-noctis.md', import.meta.url),
  ),
  'utf8',
);

const AA_NORMAL_TEXT = 4.5;

type TokenMap = Readonly<Record<string, string>>;

/** `#rrggbb` o una referencia a otro token del mismo bloque. */
const DECLARATION = /^\s*(--[a-z0-9-]+):\s*(#[0-9a-f]{6}|var\(--[a-z0-9-]+\));/i;
const REFERENCE = /^var\((--[a-z0-9-]+)\)$/;

function blockOf(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No existe el bloque ${selector}`);
  const end = source.indexOf('}', start);
  return source.slice(start, end);
}

function declarationsIn(block: string): TokenMap {
  const found: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const match = DECLARATION.exec(line);
    if (match?.[1] !== undefined && match[2] !== undefined) found[match[1]] = match[2];
  }
  return found;
}

/**
 * `--fondo: var(--color-fondo)` es la forma normal de un alias en este sistema,
 * así que la prueba tiene que seguir la referencia hasta el hex o no vería nada.
 * El tope de saltos evita que un ciclo cuelgue la corrida en vez de fallar.
 */
const MAX_HOPS = 8;

function resolve(raw: TokenMap, name: string): string {
  let value = raw[name];
  for (let hop = 0; hop < MAX_HOPS && value !== undefined; hop += 1) {
    const reference = REFERENCE.exec(value)?.[1];
    if (reference === undefined) return value;
    value = raw[reference];
  }
  throw new Error(`No se pudo resolver ${name} a un color`);
}

function tokensOf(selector: string, extra: TokenMap = {}): TokenMap {
  const raw = { ...declarationsIn(blockOf(TOKENS_CSS, selector)), ...extra };
  const resolved: Record<string, string> = {};
  for (const name of Object.keys(raw)) resolved[name] = resolve(raw, name);
  return resolved;
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

const DARK = tokensOf("html[data-mode='dark']");
const LIGHT = tokensOf("html[data-mode='light']");

/**
 * Los dos modos, y los dos con la franja invertida encima. La franja hereda
 * `--fondo` y `--texto` de `--inv-fondo` y `--inv-texto` del modo de afuera, así
 * que hay que inyectarlos: el bloque anidado no los declara.
 */
const PALETTES: readonly { readonly name: string; readonly tokens: TokenMap }[] = [
  { name: 'modo oscuro', tokens: DARK },
  { name: 'modo claro', tokens: LIGHT },
  {
    name: 'franja invertida sobre modo oscuro',
    tokens: tokensOf("html[data-mode='dark'] .inv", {
      '--fondo': DARK['--inv-fondo'] ?? '',
      '--texto': DARK['--inv-texto'] ?? '',
    }),
  },
  {
    name: 'franja invertida sobre modo claro',
    tokens: tokensOf("html[data-mode='light'] .inv", {
      '--fondo': LIGHT['--inv-fondo'] ?? '',
      '--texto': LIGHT['--inv-texto'] ?? '',
    }),
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

/**
 * El color de acción es el que más fácil se equivoca de modo: índigo sobre el
 * fondo oscuro da 2.49:1 y lavanda sobre el claro da 1.77:1. Se usa de dos
 * formas —relleno del botón sólido, y texto del botón en reposo invertido— y las
 * dos se verifican en los cuatro contextos, franja invertida incluida.
 */
describe('el color de acción de la marca', () => {
  it.each(PALETTES)('$name: el botón sólido cumple AA', ({ tokens }) => {
    expect(ratioIn(tokens, '--fondo', '--color-accion')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it.each(PALETTES)('$name: el botón en hover cumple AA sobre el fondo', ({ tokens }) => {
    expect(ratioIn(tokens, '--color-accion', '--fondo')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it.each(PALETTES)('$name: el color de acción cumple AA sobre la superficie', ({ tokens }) => {
    expect(ratioIn(tokens, '--color-accion', '--fondo-2')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

/**
 * La paleta es transcripción del spec de marca, no una interpretación. Si
 * alguien retoca un tono en `tokens.css` sin tocar el spec —o al revés— esto se
 * entera. El spec conmuta con `[data-theme]` y el sitio con `data-mode`: la
 * diferencia es deliberada (spec §4 pide mantener el toggle existente) y es lo
 * único que esta prueba traduce.
 */
const SPEC_BLOCKS: readonly { readonly mode: string; readonly specSelector: string }[] = [
  { mode: "html[data-mode='light']", specSelector: ':root' },
  { mode: "html[data-mode='dark']", specSelector: '[data-theme="dark"]' },
];

describe('la paleta es la del spec de marca §1', () => {
  it.each(SPEC_BLOCKS)('$mode declara los siete colores del spec', ({ mode, specSelector }) => {
    const fromSpec = declarationsIn(blockOf(BRAND_SPEC, specSelector));
    const fromTokens = tokensOf(mode);

    expect(Object.keys(fromSpec)).toHaveLength(7);

    for (const [name, value] of Object.entries(fromSpec)) {
      expect(fromTokens[name]?.toLowerCase()).toBe(value.toLowerCase());
    }
  });

  it('el modo oscuro no usa negro puro en ningún fondo (spec §4)', () => {
    expect(DARK['--color-fondo']).not.toBe('#000000');
    expect(DARK['--color-superficie']).not.toBe('#000000');
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
