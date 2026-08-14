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

export function buildContentSecurityPolicy(options: CspOptions): string {
  return [scriptDirective(options), styleDirective(options), ...STATIC_DIRECTIVES].join('; ');
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
