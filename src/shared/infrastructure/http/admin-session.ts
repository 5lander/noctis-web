/**
 * La sesión del panel: una cookie firmada, sin dependencias.
 *
 * Es la misma decisión de ADR-0006 —registro, limitador y pre-commit propios—
 * aplicada al acceso: para un panel de una sola persona, una biblioteca de
 * autenticación con proveedores, adaptadores y base de datos de sesiones sería
 * más superficie de ataque que la que resuelve.
 *
 * La cookie no guarda ningún dato: solo un vencimiento y su firma HMAC. Si
 * alguien la manipula, la firma deja de cuadrar; si la copia entera, caduca
 * igual. La comparación es en tiempo constante para no filtrar la firma byte a
 * byte con un cronómetro.
 *
 * **La clave nunca se compara con `===`.** Un `===` sobre cadenas corta en el
 * primer carácter distinto, y eso es un canal lateral medible.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { environment } from '@/shared/infrastructure/config/environment';

export const ADMIN_COOKIE = 'noctis_panel';

const HOURS_OF_SESSION = 8;
const MS_PER_HOUR = 3_600_000;
const SECONDS_PER_HOUR = 3600;
const NONCE_BYTES = 12;
const SESSION_MAX_AGE_SECONDS = HOURS_OF_SESSION * SECONDS_PER_HOUR;

const SEPARATOR = '.';
const RADIX = 10;

/** Sin clave configurada el panel no existe: no hay sesión que emitir ni validar. */
export function isAdminEnabled(): boolean {
  return environment.ADMIN_CLAVE !== undefined && environment.ADMIN_SECRETO !== undefined;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function equals(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyPassword(candidate: string): boolean {
  const expected = environment.ADMIN_CLAVE;
  if (expected === undefined) return false;
  return equals(candidate, expected);
}

export function issueSession(now: number): string {
  const secret = environment.ADMIN_SECRETO;
  if (secret === undefined) throw new Error('No se puede emitir sesión sin ADMIN_SECRETO.');
  const expiresAt = String(now + HOURS_OF_SESSION * MS_PER_HOUR);
  // El azar hace que dos sesiones emitidas en el mismo milisegundo no compartan
  // valor: sin él, la cookie de una es literalmente la de la otra.
  const nonce = randomBytes(NONCE_BYTES).toString('base64url');
  const payload = `${expiresAt}${SEPARATOR}${nonce}`;
  return `${payload}${SEPARATOR}${sign(payload, secret)}`;
}

export function isSessionValid(cookie: string | undefined, now: number): boolean {
  const secret = environment.ADMIN_SECRETO;
  if (secret === undefined || cookie === undefined) return false;

  const parts = cookie.split(SEPARATOR);
  const EXPECTED_PARTS = 3;
  if (parts.length !== EXPECTED_PARTS) return false;

  const [expiresAt, nonce, signature] = parts;
  if (expiresAt === undefined || nonce === undefined || signature === undefined) return false;
  if (!equals(signature, sign(`${expiresAt}${SEPARATOR}${nonce}`, secret))) return false;

  const deadline = Number.parseInt(expiresAt, RADIX);
  return Number.isFinite(deadline) && deadline > now;
}

/**
 * Si la cookie debe llevar `Secure`, decidido por el anfitrión de la petición y
 * no por `NODE_ENV`.
 *
 * La primera versión usaba `NODE_ENV !== 'production'`, y eso rompía un caso
 * real: un `next start` local —que es producción— sobre `http://localhost` emite
 * una cookie `Secure` que el navegador descarta, así que la sesión se pierde en
 * la siguiente petición y el panel parece pedir la clave sin parar. Lo detectó la
 * prueba de extremo a extremo del panel, no una revisión de código.
 *
 * Se mira el anfitrión y no una cabecera `X-Forwarded-Proto` porque esa la
 * escribe quien envía la petición y un proxy mal configurado no la sobrescribe.
 * El anfitrión, en cambio, no lo puede falsear a `localhost` nadie que no esté
 * ya en la máquina. Cualquier despliegue real cae en `Secure`.
 */
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];
const NOT_FOUND = -1;

/**
 * Quitar el puerto no es partir por `:`.
 *
 * Un anfitrión IPv6 viene entre corchetes —`[::1]:3000`— y está lleno de dos
 * puntos: partir por el primero devuelve `[`. Lo encontró la propia prueba de
 * esta función, con el caso que parecía de manual.
 */
function hostnameOf(host: string): string {
  if (host.startsWith('[')) {
    const close = host.indexOf(']');
    return close === NOT_FOUND ? host : host.slice(0, close + 1);
  }
  return host.split(':')[0] ?? '';
}

export function isSecureRequest(host: string | null): boolean {
  if (host === null) return true;
  return !LOCAL_HOSTS.includes(hostnameOf(host));
}

/**
 * `httpOnly` para que ningún script la lea, `sameSite=lax` para que un formulario
 * de otro dominio no la arrastre, y `secure` salvo en localhost, porque en
 * producción el sitio ya obliga HTTPS por HSTS.
 */
export function sessionCookieOptions(secure: boolean): {
  httpOnly: true;
  sameSite: 'lax';
  path: string;
  secure: boolean;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
