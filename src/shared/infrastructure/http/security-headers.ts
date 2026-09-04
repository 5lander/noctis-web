/**
 * Cabeceras de seguridad y CSP estricta — SEGURIDAD.md §4.4.
 *
 * La CSP usa **nonce** y no lista blanca de hashes porque el estándar lo pide
 * literalmente ("scripts con nonce") y porque desde P1 hay un script en línea
 * en el `<head>` que fija el modo claro/oscuro antes del primer pintado: con
 * hashes habría que recalcularlos cada vez que ese script cambie una coma.
 *
 * El costo está aceptado y anotado: un nonce por petición obliga a render
 * dinámico, así que el contenido estático se apoya en caché de CDN y no en
 * prerenderizado. Ver ADR-0004.
 *
 * En desarrollo se abren `unsafe-eval` y `unsafe-inline` de estilos porque el
 * recargado en caliente de Next los necesita. **Nunca en producción**: el
 * interruptor es el propio `NODE_ENV`, no una variable que alguien pueda dejar
 * mal puesta.
 */

export const NONCE_HEADER = 'x-nonce';
export const CSP_HEADER = 'content-security-policy';

const NONCE_BYTES = 16;

export interface CspOptions {
  readonly nonce: string;
  readonly development: boolean;
}

const STATIC_DIRECTIVES: readonly string[] = [
  "default-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
];

function scriptDirective(options: CspOptions): string {
  const sources = ["'self'", `'nonce-${options.nonce}'`, "'strict-dynamic'"];
  if (options.development) sources.push("'unsafe-eval'");
  return `script-src ${sources.join(' ')}`;
}

function styleDirective(options: CspOptions): string {
  const sources = ["'self'", `'nonce-${options.nonce}'`];
  if (options.development) sources.push("'unsafe-inline'");
  return `style-src ${sources.join(' ')}`;
}

/**
 * El único atributo `style` que el sitio emite, permitido por su hash exacto.
 *
 * `next/image` pone `style="color:transparent"` en cada `<img>` para que el
 * texto alternativo no se vea mientras la imagen carga. No hay forma de
 * desactivarlo, y no se puede cambiar a `<img>` a secas porque la regla
 * `no-img-element` lo prohíbe y `CLAUDE.md` §8 no admite silenciar el linter.
 *
 * Sin esta directiva, `style-src-attr` cae en `style-src`, que lleva nonce, y
 * los nonces **no aplican a atributos**: las siete imágenes de la portada
 * quedaban bloqueadas. Costaba dos cosas, y ninguna era grave por separado: el
 * texto alternativo asomaba un instante antes de que cargara cada imagen, y
 * cada carga de página dejaba siete errores en consola. Lo segundo es lo que de
 * verdad importa: siete errores fijos son ruido donde después se busca uno real.
 *
 * **`'unsafe-hashes'` acá es más restrictivo que no declarar nada, no menos.**
 * El nombre asusta y hay que leer qué hace: sin la directiva, los atributos
 * heredan `style-src` completo; con ella, lo único admitido en un atributo
 * `style` de todo el sitio es la cadena exacta `color:transparent`. Cualquier
 * otra, incluida una inyectada, sigue bloqueada.
 *
 * El hash es de la cadena literal. No se exporta: la prueba lo **recalcula** a
 * partir de `color:transparent` y comprueba que la política lo contenga, que es
 * más fuerte que comparar dos constantes escritas a mano. Si Next cambia ese
 * estilo, las imágenes vuelven a fallar y la corrida lo detecta antes que el
 * navegador.
 */
const IMAGE_STYLE_HASH = "'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk='";

function styleAttributeDirective(): string {
  return `style-src-attr 'unsafe-hashes' ${IMAGE_STYLE_HASH}`;
}

export function buildContentSecurityPolicy(options: CspOptions): string {
  return [
    scriptDirective(options),
    styleDirective(options),
    styleAttributeDirective(),
    ...STATIC_DIRECTIVES,
  ].join('; ');
}

/**
 * Registro de claves literales y no una interfaz: así `Object.entries` conserva
 * el tipo de los valores y recorrer las cabeceras no obliga a una conversión.
 */
export type SecurityHeaders = Readonly<
  Record<
    | typeof CSP_HEADER
    | 'strict-transport-security'
    | 'x-frame-options'
    | 'x-content-type-options'
    | 'referrer-policy'
    | 'permissions-policy',
    string
  >
>;

export function buildSecurityHeaders(options: CspOptions): SecurityHeaders {
  return {
    'content-security-policy': buildContentSecurityPolicy(options),
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  };
}

export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  return btoa(String.fromCodePoint(...bytes));
}
