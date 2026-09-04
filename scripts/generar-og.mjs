/**
 * Genera la tarjeta social del sitio: `src/app/opengraph-image.jpg`.
 *
 * **Por qué existe esto y no un `opengraph-image.tsx`.** La forma idiomática en
 * Next es generar la imagen en el build con `ImageResponse`, y se descartó por
 * las fuentes: ese renderizador no lee WOFF2, que es el único formato en el que
 * el proyecto tiene Source Serif e Inter. La tarjeta habría salido con una
 * tipografía que no es la de la marca, y una tarjeta social fuera de marca es
 * peor que ninguna. Acá se pinta con el mismo navegador que pinta el sitio, con
 * las fuentes reales y los mismos valores de `tokens.css`.
 *
 * **El texto no se escribe acá.** Se lee de `src/content/`, que es la fuente
 * única (`CLAUDE.md` §2), y si no lo encuentra el guion se cae en vez de
 * inventarlo: una tarjeta que dice algo distinto a la portada es exactamente el
 * error que este archivo tiene que hacer imposible.
 *
 * Se corre a mano cuando cambia el titular de la portada:
 *
 *     npm run og:generar
 *
 * Necesita Chromium por Playwright. Si no está: `npx playwright install chromium`.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SALIDA = join(ROOT, 'src', 'app', 'opengraph-image.jpg');
const ALT = join(ROOT, 'src', 'app', 'opengraph-image.alt.txt');

/** Las medidas que piden Facebook y X para la tarjeta grande. */
const ANCHO = 1200;
const ALTO = 630;

/**
 * Saca el valor de una clave de un objeto `as const` de TypeScript.
 *
 * Es un extractor deliberadamente tonto y estricto: busca `clave:` seguido de
 * una cadena entre comillas simples, admitiendo el salto de línea que mete el
 * formateador. Si la clave cambia de nombre o de forma, no adivina — lanza.
 */
function leerCadena(fuente, clave) {
  const patron = new RegExp(`\\b${clave}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`);
  const encontrado = patron.exec(fuente);
  if (encontrado === null) throw new Error(`No se encontró "${clave}" en el contenido.`);
  return encontrado[1].replaceAll("\\'", "'");
}

/**
 * Recorta un bloque `export const NOMBRE = { ... } as const;`.
 *
 * Hace falta porque `eyebrow`, `headline` y `support` no son claves únicas en el
 * archivo: la portada, el 404 y el contacto usan varias de las mismas. Sin
 * recortar primero, el extractor tomaría la que apareciera antes, que es la
 * clase de error que un día pone el texto del 404 en la tarjeta social.
 */
function bloque(fuente, nombre) {
  const inicio = fuente.indexOf(`export const ${nombre} = {`);
  if (inicio === -1) throw new Error(`No se encontró el bloque "${nombre}".`);
  const fin = fuente.indexOf('} as const;', inicio);
  if (fin === -1) throw new Error(`El bloque "${nombre}" no cierra.`);
  return fuente.slice(inicio, fin);
}

function leerContenido() {
  const copy = readFileSync(join(ROOT, 'src', 'content', 'site-copy.ts'), 'utf8');
  const site = readFileSync(join(ROOT, 'src', 'content', 'site.ts'), 'utf8');
  const hero = bloque(copy, 'HERO');
  const sitio = bloque(site, 'SITE');

  return {
    eyebrow: leerCadena(hero, 'eyebrow'),
    headline: leerCadena(hero, 'headline'),
    support: leerCadena(hero, 'support'),
    /*
     * La ciudad no se pinta en la tarjeta: la bajada ya dice «Construidos en
     * Loja», y repetirla debajo apretaba el bloque contra el borde para no
     * aportar nada. Se lee igual para comprobar que el sitio sigue siendo de
     * Loja — si eso cambiara, esta línea es la que avisa.
     */
    ciudad: `${leerCadena(sitio, 'city')}, ${leerCadena(sitio, 'country')}`,
  };
}

const FUENTES = {
  serif: 'src/app/fonts/source-serif-4-latin-600-normal.woff2',
  inter400: 'src/app/fonts/inter-latin-400-normal.woff2',
  inter600: 'src/app/fonts/inter-latin-600-normal.woff2',
};

const url = (ruta) => pathToFileURL(resolve(ROOT, ruta)).href;

/**
 * El logotipo entra incrustado y no por `file://`.
 *
 * Chromium no carga una imagen local desde una página servida con `setContent`,
 * así que por referencia la tarjeta salía sin marca — y sin avisar, que es lo
 * peor: un fallo silencioso en el único archivo que nadie vuelve a mirar después
 * de generarlo.
 */
function logoIncrustado() {
  const svg = readFileSync(join(ROOT, 'public', 'marca', 'logo-oscuro.svg'));
  return `data:image/svg+xml;base64,${svg.toString('base64')}`;
}

function escapar(texto) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * La tarjeta.
 *
 * Los colores son los de `tokens.css` y no una copia libre: el fondo `#0a0a12`
 * es el que exige el archivo del logotipo, cuyo recorte de la luna es un círculo
 * opaco de ese tono exacto. Sobre cualquier otro fondo se vería el disco.
 */
/**
 * La hoja de estilo de la tarjeta, en una constante y no dentro de una función.
 *
 * No es manía: son ochenta líneas de CSS, y metidas en una función disparan el
 * tope de largo que `CLAUDE.md` §3 fija para el proyecto entero. Partir el CSS
 * en trozos para cumplirlo habría sido peor — una hoja de estilo se lee de
 * arriba abajo o no se lee.
 *
 * Los colores son los de `tokens.css` y no una copia libre: el fondo `#0a0a12`
 * es el que exige el archivo del logotipo, cuyo recorte de la luna es un círculo
 * opaco de ese tono exacto. Sobre cualquier otro fondo se vería el disco.
 */
const ESTILOS = `
  @font-face { font-family: 'Serif'; src: url('${url(FUENTES.serif)}') format('woff2'); font-weight: 600; }
  @font-face { font-family: 'Texto'; src: url('${url(FUENTES.inter400)}') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'Texto'; src: url('${url(FUENTES.inter600)}') format('woff2'); font-weight: 600; }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: ${ANCHO}px;
    height: ${ALTO}px;
    background: #0a0a12;
    color: #f4f4f5;
    font-family: 'Texto', system-ui, sans-serif;
    overflow: hidden;
  }

  /* El halo y la rejilla del sitio, a la escala de la tarjeta. */
  .halo {
    position: absolute;
    right: -180px;
    top: -220px;
    width: 760px;
    height: 760px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(67, 56, 202, 0.38), transparent 62%);
  }
  .rejilla {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(244, 244, 245, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(244, 244, 245, 0.035) 1px, transparent 1px);
    background-size: 72px 72px;
  }

  .marco {
    position: relative;
    height: 100%;
    padding: 66px 78px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .logo {
    width: 160px;
    height: 92px;
    background: url('${logoIncrustado()}') no-repeat left center / contain;
  }

  .eyebrow {
    font-size: 19px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #c4b5fd;
    margin-bottom: 22px;
  }

  h1 {
    font-family: 'Serif', Georgia, serif;
    font-weight: 600;
    font-size: 60px;
    line-height: 1.06;
    letter-spacing: -0.02em;
    max-width: 16ch;
    text-wrap: balance;
  }

  .apoyo {
    margin-top: 22px;
    font-size: 23px;
    line-height: 1.45;
    color: #a1a1aa;
    max-width: 46ch;
  }

`;

function plantilla(texto) {
  return `<!doctype html>
<meta charset="utf-8">
<style>${ESTILOS}</style>
<div class="halo"></div>
<div class="rejilla"></div>
<div class="marco">
  <div class="logo"></div>
  <div>
    <div class="eyebrow">${escapar(texto.eyebrow)}</div>
    <h1>${escapar(texto.headline)}</h1>
    <p class="apoyo">${escapar(texto.support)}</p>
  </div>
</div>`;
}

async function abrirChromium() {
  const externo = process.env['PLAYWRIGHT_RUTA'];
  try {
    const modulo = externo === undefined ? 'playwright' : pathToFileURL(externo).href;
    return (await import(modulo)).chromium;
  } catch (causa) {
    throw new Error(
      'Falta Playwright. Instálelo con `npm i -D playwright`, o apunte ' +
        'PLAYWRIGHT_RUTA a un index.mjs de Playwright ya instalado.',
      { cause: causa },
    );
  }
}

const texto = leerContenido();
const chromium = await abrirChromium();
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: ALTO } });

await pagina.setContent(plantilla(texto), { waitUntil: 'load' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: SALIDA, type: 'jpeg', quality: 92 });
await navegador.close();

writeFileSync(ALT, `${texto.headline} ${texto.support}\n`, 'utf8');

console.log(`Tarjeta social generada: ${SALIDA}`);
console.log(`Titular usado: ${texto.headline}`);
console.log(`Ciudad declarada en el contenido: ${texto.ciudad}`);
