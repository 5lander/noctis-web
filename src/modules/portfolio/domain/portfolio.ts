/**
 * El portafolio: clientes y trabajos entregados.
 *
 * Es la respuesta al hallazgo H2 de la auditoría: la sección de trabajos dejó de
 * ser una lista escrita a mano en `content/` y pasó a ser dato administrable.
 * La diferencia que importa no es técnica: **un trabajo solo se pinta si alguien
 * lo publicó a propósito**, así que la página no puede volver a mostrar clientes
 * que no existen.
 *
 * Este archivo no importa nada —ni zod, ni Node, ni React— porque
 * `dominio-solo-dominio` de dependency-cruiser lo prohíbe (CLAUDE.md §2). La
 * validación de acá es a mano y devuelve errores por campo; el esquema de zod
 * que traduce un formulario HTTP a estas formas vive en la capa de aplicación.
 */

/** Un registro publicado se ve en el sitio; uno en borrador solo en el panel. */
export type PublicationStatus = 'draft' | 'published';

export interface Client {
  readonly id: string;
  readonly name: string;
  /** Ciudad del cliente. Es señal de confianza local, no un dato decorativo. */
  readonly city: string;
  readonly sector: string;
  /** Ruta servida por `/media/…`, o `null` mientras no haya logotipo. */
  readonly logoUrl: string | null;
  readonly status: PublicationStatus;
  readonly sortOrder: number;
  readonly updatedAt: string;
}

export interface Work {
  readonly id: string;
  readonly slug: string;
  readonly clientId: string | null;
  /** Se guarda desnormalizado: el trabajo sobrevive a que se borre el cliente. */
  readonly clientName: string;
  readonly kind: string;
  readonly year: string;
  /** Enlace al sitio vivo. `null` significa que la tarjeta **no** es un enlace. */
  readonly href: string | null;
  readonly summary: string;
  readonly coverUrl: string | null;
  readonly coverAlt: string;
  /**
   * El recorrido: un vídeo corto que baja por la página entregada de arriba
   * abajo. `null` mientras no haya ninguno.
   *
   * Una portada dice cómo empieza una página; el recorrido enseña lo que es. En
   * un sitio cuyo producto declarado es la credibilidad demostrada, la diferencia
   * entre las dos cosas es justo la que se está vendiendo.
   *
   * Su texto alternativo no es un campo aparte: se compone con el nombre del
   * cliente, que ya está validado y nunca viene vacío.
   */
  readonly tourUrl: string | null;
  readonly status: PublicationStatus;
  readonly sortOrder: number;
  readonly updatedAt: string;
}

export interface FieldError {
  readonly field: string;
  readonly message: string;
}

const MAX_SHORT = 80;
const MAX_LONG = 220;
const YEAR_PATTERN = /^\d{4}$/;
const SLUG_PATTERN = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const ACCENTS = /[̀-ͯ]/g;

/**
 * Un identificador legible a partir del nombre. Se calcula una sola vez, al
 * crear: si cambiara al renombrar un cliente, el enlace que ya se compartió
 * dejaría de resolver.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(ACCENTS, '')
    .toLowerCase()
    .replace(SLUG_PATTERN, '-')
    .replace(EDGE_DASHES, '');
}

function required(field: string, value: string, max: number): FieldError | null {
  const trimmed = value.trim();
  if (trimmed === '') return { field, message: 'Este campo es obligatorio.' };
  if (trimmed.length > max) return { field, message: `Máximo ${max} caracteres.` };
  return null;
}

function optionalLength(field: string, value: string, max: number): FieldError | null {
  if (value.trim().length > max) return { field, message: `Máximo ${max} caracteres.` };
  return null;
}

/**
 * Un enlace externo tiene que ser `https`. No es purismo: la CSP del sitio
 * declara `upgrade-insecure-requests`, y un `http://` en una tarjeta manda al
 * visitante a una advertencia del navegador con el nombre del cliente encima.
 */
function httpsLink(field: string, value: string): FieldError | null {
  if (value.trim() === '') return null;
  if (!value.startsWith('https://')) {
    return { field, message: 'El enlace debe empezar por https://' };
  }
  return null;
}

function compact(errors: readonly (FieldError | null)[]): readonly FieldError[] {
  return errors.filter((error): error is FieldError => error !== null);
}

export function validateWork(work: Work): readonly FieldError[] {
  return compact([
    required('clientName', work.clientName, MAX_SHORT),
    required('kind', work.kind, MAX_SHORT),
    YEAR_PATTERN.test(work.year) ? null : { field: 'year', message: 'Debe ser un año de cuatro cifras.' },
    optionalLength('summary', work.summary, MAX_LONG),
    optionalLength('coverAlt', work.coverAlt, MAX_LONG),
    httpsLink('href', work.href ?? ''),
    coverNeedsAlt(work),
  ]);
}

/**
 * Una portada sin texto alternativo es un fallo de accesibilidad esperando a
 * ocurrir (WCAG 1.1.1). Se bloquea en el panel, que es donde todavía hay alguien
 * mirando, y no en una auditoría seis meses después.
 */
function coverNeedsAlt(work: Work): FieldError | null {
  if (work.coverUrl === null) return null;
  if (work.coverAlt.trim() !== '') return null;
  return { field: 'coverAlt', message: 'Una portada con imagen necesita texto alternativo.' };
}

export function validateClient(client: Client): readonly FieldError[] {
  return compact([
    required('name', client.name, MAX_SHORT),
    required('city', client.city, MAX_SHORT),
    optionalLength('sector', client.sector, MAX_SHORT),
  ]);
}

/** Publicados primero por orden manual, y a igualdad de orden, el más reciente. */
export function byDisplayOrder<T extends { sortOrder: number; updatedAt: string }>(
  first: T,
  second: T,
): number {
  if (first.sortOrder !== second.sortOrder) return first.sortOrder - second.sortOrder;
  return second.updatedAt.localeCompare(first.updatedAt);
}
