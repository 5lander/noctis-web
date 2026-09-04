/**
 * De un formulario HTTP a las formas del dominio.
 *
 * Vive en aplicación y no en dominio porque zod es una dependencia externa y
 * `dominio-solo-dominio` lo prohíbe allí; y no en la ruta porque una regla que
 * se escribe dentro de un handler no se puede probar sin levantar un servidor.
 *
 * Todo lo que llega de un formulario es texto o nada. Lo que sale de acá ya es
 * un `Work` o un `Client` completo, con sus valores por defecto puestos.
 */

import { z } from 'zod';

import {
  slugify,
  type Client,
  type PublicationStatus,
  type Work,
} from '@/modules/portfolio/domain/portfolio';

/** Tope del orden manual: tres cifras alcanzan y evitan un entero cualquiera. */
const MAX_ORDER = 999;

const text = z.string().trim().default('');
const publication = z.enum(['draft', 'published']).default('draft');

const workForm = z.object({
  id: text,
  clientId: text,
  clientName: text,
  kind: text,
  year: text,
  href: text,
  summary: text,
  coverUrl: text,
  coverAlt: text,
  tourUrl: text,
  status: publication,
  sortOrder: z.coerce.number().int().min(0).max(MAX_ORDER).default(0),
});

const clientForm = z.object({
  id: text,
  name: text,
  city: text,
  sector: text,
  logoUrl: text,
  status: publication,
  sortOrder: z.coerce.number().int().min(0).max(MAX_ORDER).default(0),
});

function fields(form: FormData): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') entries[key] = value;
  }
  return entries;
}

function orNull(value: string): string | null {
  return value === '' ? null : value;
}

export interface WorkDraftInput {
  readonly form: FormData;
  readonly id: string;
  readonly now: string;
}

export function readWorkForm(input: WorkDraftInput): Work {
  const parsed = workForm.parse(fields(input.form));
  const slugSource = parsed.clientName === '' ? input.id : `${parsed.clientName}-${parsed.year}`;
  return {
    id: input.id,
    slug: slugify(slugSource) || input.id,
    clientId: orNull(parsed.clientId),
    clientName: parsed.clientName,
    kind: parsed.kind,
    year: parsed.year,
    href: orNull(parsed.href),
    summary: parsed.summary,
    coverUrl: orNull(parsed.coverUrl),
    coverAlt: parsed.coverAlt,
    tourUrl: orNull(parsed.tourUrl),
    status: parsed.status satisfies PublicationStatus,
    sortOrder: parsed.sortOrder,
    updatedAt: input.now,
  };
}

export interface ClientDraftInput {
  readonly form: FormData;
  readonly id: string;
  readonly now: string;
}

export function readClientForm(input: ClientDraftInput): Client {
  const parsed = clientForm.parse(fields(input.form));
  return {
    id: input.id,
    name: parsed.name,
    city: parsed.city,
    sector: parsed.sector,
    logoUrl: orNull(parsed.logoUrl),
    status: parsed.status satisfies PublicationStatus,
    sortOrder: parsed.sortOrder,
    updatedAt: input.now,
  };
}

/**
 * El trabajo vacío que abre el formulario de alta. Nace en borrador: publicar
 * tiene que ser un acto, no el estado por omisión.
 */
export function emptyWork(id: string, now: string): Work {
  return {
    id,
    slug: id,
    clientId: null,
    clientName: '',
    kind: '',
    year: String(new Date(now).getFullYear()),
    href: null,
    summary: '',
    coverUrl: null,
    coverAlt: '',
    tourUrl: null,
    status: 'draft',
    sortOrder: 0,
    updatedAt: now,
  };
}

export function emptyClient(id: string, now: string): Client {
  return {
    id,
    name: '',
    city: 'Loja',
    sector: '',
    logoUrl: null,
    status: 'draft',
    sortOrder: 0,
    updatedAt: now,
  };
}
