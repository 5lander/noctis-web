import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Contraste AA, calculado — no afirmado.
 *
 * El criterio de aceptación de P1 pedía contraste AA verificado en los dos
 * modos. Ya no hay dos modos: el sitio es oscuro y punto. Lo que quedan son dos
 * **contextos** —la página y la franja invertida— y los dos siguen teniendo que
 * cumplir, porque la franja no es una variante opcional: es media página.
 *
 * Una casilla marcada a mano se desactualiza el día que alguien retoca un token;
 * esta prueba lee `tokens.css` y calcula la razón según WCAG 2.1, así que se
 * entera sola.
 *
 * Cubre además dos cosas: que los siete `--color-*` de cada contexto sean los
 * del spec de marca §1 letra por letra, y que el color de acción tenga contraste
 * suficiente donde se usa —el botón sólido y la franja invertida—, que es donde
 * el índigo y la lavanda se equivocan de contexto.
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
const BUTTON_CSS = readFileSync(
  fileURLToPath(new URL('../components/ui/button.module.css', import.meta.url)),
  'utf8',
);
const BRAND_SPEC = readFileSync(
  fileURLToPath(
    new URL('../../docs/identidad-de-marca-noctis/spec-rebrand-noctis.md', import.meta.url),
  ),
  'utf8',
);

const AA_NORMAL_TEXT = 4.5;
/** WCAG 2.1 §1.4.11: el límite visual de un control necesita 3:1, no 4.5:1. */
const AA_NON_TEXT = 3;

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

/**
 * Aplica los bloques **en orden de especificidad**, de menor a mayor, que es lo
 * que hace el navegador sobre un elemento al que le aplican varias reglas.
 *
 * Esto no es un detalle de implementación de la prueba: es lo que antes estaba
 * mal. La versión anterior no modelaba el cascade — sintetizaba a mano el
 * `--fondo` que la franja *debía* tener— así que pasaba en verde mientras
 * Servicios y Contacto se pintaban del color de la página desde P1.
 */
function cascadeOf(...blocks: readonly TokenMap[]): TokenMap {
  const raw: Record<string, string> = {};
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block)) raw[name] = value;
  }

  const resolved: Record<string, string> = {};
  for (const name of Object.keys(raw)) resolved[name] = resolve(raw, name);
  return resolved;
}

function blockFor(selector: string): TokenMap {
  return declarationsIn(blockOf(TOKENS_CSS, selector));
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

/**
 * Los dos contextos, armados como los arma el navegador.
 *
 * Especificidad de los selectores que declaran color sobre una sección con la
 * clase `inv`: `html` vale (0,0,1), `:root` y `.inv` valen (0,1,0). Ese es el
 * orden de la mezcla. `:root` y `.inv` empatan, pero declaran conjuntos
 * disjuntos —la raíz lleva forma y medidas, la franja lleva color— así que el
 * empate no decide nada.
 *
 * La paleta de la página vive en `html` y no en `:root` precisamente por esto:
 * con las dos en (0,1,0) la inversión dependería de qué bloque se escribió
 * después, que es la fragilidad que dejó a Servicios y Contacto sin invertir
 * desde P1.
 *
 * `blockFor('.inv')` encuentra el bloque de la paleta invertida porque el
 * selector agrupado la nombra en su segunda línea y `blockOf` busca la primera
 * aparición de `.inv {`. El bloque suelto que aplica `background` y `color` va
 * después y no declara ningún token.
 */
const ROOT = blockFor(':root');
const PAGE_BLOCK = blockFor('html');
const BAND_BLOCK = blockFor('.inv');

const PAGE = cascadeOf(PAGE_BLOCK, ROOT);
const BAND = cascadeOf(PAGE_BLOCK, ROOT, BAND_BLOCK);

const PALETTES: readonly { readonly name: string; readonly tokens: TokenMap }[] = [
  { name: 'la página', tokens: PAGE },
  { name: 'la franja invertida', tokens: BAND },
];

/**
 * La prueba que faltaba.
 *
 * `Servicios` y `Contacto` están marcados como franja invertida desde P2 y se
 * pintaron del color de la página durante diez paquetes, porque la prueba
 * anterior verificaba la intención en vez del cascade. Una franja que no
 * invierte no es un detalle estético: es media página de estructura que
 * desaparece.
 */
describe('la franja invertida invierte de verdad', () => {
  it('usa el esquema contrario al de la página', () => {
    const pageBackground = PAGE['--fondo'] ?? '';
    const bandBackground = BAND['--fondo'] ?? '';

    expect(bandBackground).not.toBe(pageBackground);
    expect(contrastRatio(bandBackground, pageBackground)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('el bloque de la franja declara su propio fondo y texto', () => {
    expect(Object.keys(BAND_BLOCK)).toContain('--fondo');
    expect(Object.keys(BAND_BLOCK)).toContain('--texto');
    expect(BAND['--texto']).not.toBe('');
  });
});

/**
 * El modo claro se retiró, y esto es lo que impide que vuelva a medias.
 *
 * Un `data-mode` suelto en `tokens.css` significaría que hay una rama de color
 * que nadie conmuta y que ninguna prueba mira: el peor de los dos mundos.
 */
describe('el sitio tiene un solo esquema', () => {
  it('no queda ningún selector de modo en los tokens', () => {
    // El corchete es lo que distingue un selector de la prosa del encabezado,
    // que menciona `data-mode` para explicar qué se retiró y por qué.
    expect(TOKENS_CSS).not.toContain('[data-mode');
  });

  it('la raíz declara color-scheme dark para los widgets del navegador', () => {
    expect(blockOf(TOKENS_CSS, ':root')).toContain('color-scheme: dark');
  });
});

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
    expect(BAND_BLOCK['--fondo-2']).toBeDefined();
  });

  /*
   * El borde del campo es lo único que le dice al visitante dónde escribe. Con
   * `--linea` daba 1.28:1 en claro y 1.31:1 en oscuro: se reportó que los
   * campos "no se ven". Estas dos pruebas son las que no dejan que vuelva a
   * pasar, y por eso miran el CSS de verdad y no solo el token.
   */
  it.each(PALETTES)('$name: el borde de un control se distingue del fondo', ({ tokens }) => {
    expect(ratioIn(tokens, '--linea-control', '--fondo')).toBeGreaterThanOrEqual(AA_NON_TEXT);
    expect(ratioIn(tokens, '--linea-control', '--fondo-2')).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it('los campos y el botón de contorno no usan la línea decorativa como borde', () => {
    const controlRule = /\.field input,[\s\S]*?\}/.exec(FIELD_CSS)?.[0] ?? '';

    expect(controlRule).toContain('var(--linea-control)');
    expect(controlRule).not.toMatch(/border[^;]*var\(--linea\)/);
    expect(BUTTON_CSS).not.toMatch(/border-color:\s*var\(--linea\)/);
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
 * entera.
 *
 * **Los dos bloques del spec siguen vivos, y esa es la razón de mantener esta
 * prueba entera.** Retirar el modo claro no borró la paleta clara: la movió de
 * ser el esquema de la página a ser el de la franja invertida. El spec la
 * declara en `:root` y el sitio la aplica en `.inv`; el oscuro pasa de
 * `[data-theme="dark"]` a `html`. La traducción de nombres es todo lo que
 * cambia.
 */
const SPEC_BLOCKS: readonly {
  readonly context: string;
  readonly tokens: TokenMap;
  readonly specSelector: string;
}[] = [
  { context: 'la franja invertida', tokens: BAND, specSelector: ':root' },
  { context: 'la página', tokens: PAGE, specSelector: '[data-theme="dark"]' },
];

describe('la paleta es la del spec de marca §1', () => {
  it.each(SPEC_BLOCKS)('$context declara los siete colores del spec', ({ tokens, specSelector }) => {
    const fromSpec = declarationsIn(blockOf(BRAND_SPEC, specSelector));

    expect(Object.keys(fromSpec)).toHaveLength(7);

    for (const [name, value] of Object.entries(fromSpec)) {
      expect(tokens[name]?.toLowerCase()).toBe(value.toLowerCase());
    }
  });

  it('la página no usa negro puro en ningún fondo (spec §4)', () => {
    expect(PAGE['--color-fondo']).not.toBe('#000000');
    expect(PAGE['--color-superficie']).not.toBe('#000000');
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
