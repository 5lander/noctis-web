/**
 * El portafolio en SQLite, sobre el módulo `node:sqlite` que trae Node.
 *
 * **Por qué sin Prisma ni ningún ORM.** La pregunta que originó esta pieza fue
 * «¿me lo soporta el hosting?», y la respuesta depende de una sola cosa: qué
 * binarios hay que compilar en el servidor. Prisma arrastra un motor de consulta
 * nativo y un paso de generación; `better-sqlite3` arrastra `node-gyp`. Los dos
 * son justo lo que se rompe en un hosting compartido. `node:sqlite` viene dentro
 * del propio Node ≥ 24 que este proyecto ya exige en `package.json`: cero
 * dependencias nuevas, cero compilación, cero paso de build. Es la misma
 * decisión que ADR-0006 tomó para el registro y el limitador.
 *
 * **Lo único que exige del hosting es disco escribible y persistente.** Eso lo
 * cumple un VPS, un plan Node de cPanel, Railway, Render o Fly. Lo que **no** lo
 * cumple es un despliegue sin servidor (Vercel, Netlify Functions): ahí el disco
 * se borra en cada invocación. Para ese caso no hay que reescribir nada: se
 * escribe un `PostgresPortfolioRepository` detrás del mismo puerto.
 *
 * La base se abre en la primera consulta y no al construir el objeto: el
 * registro de servicios se compone al cargar el módulo, y crear un archivo en
 * disco durante `next build` sería un efecto secundario en el momento equivocado.
 */

import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

import type {
  ListFilter,
  PortfolioRepositoryPort,
} from '@/modules/portfolio/application/ports/portfolio-repository-port';
import type { Client, PublicationStatus, Work } from '@/modules/portfolio/domain/portfolio';

/**
 * Columnas que se añadieron después de la primera versión del esquema.
 *
 * `CREATE TABLE IF NOT EXISTS` no toca una tabla que ya existe, así que una base
 * creada antes de que hubiera recorridos no tendría `tour_url` y toda consulta
 * fallaría. Cada entrada se aplica una vez y se ignora si ya está: SQLite no
 * tiene `ADD COLUMN IF NOT EXISTS`, y comprobarlo con `PRAGMA table_info` es más
 * honesto que tragarse cualquier error del `ALTER`.
 */
const COLUMNAS_AGREGADAS: readonly {
  readonly columns: string;
  readonly column: string;
  readonly ddl: string;
}[] = [
  {
    columns: 'PRAGMA table_info(works)',
    column: 'tour_url',
    ddl: 'ALTER TABLE works ADD COLUMN tour_url TEXT',
  },
];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  href TEXT,
  summary TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  cover_alt TEXT NOT NULL DEFAULT '',
  tour_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS works_status ON works(status, sort_order);
CREATE INDEX IF NOT EXISTS clients_status ON clients(status, sort_order);
`;

type Row = Record<string, unknown>;

function text(row: Row, column: string): string {
  const value = row[column];
  return typeof value === 'string' ? value : '';
}

function nullableText(row: Row, column: string): string | null {
  const value = row[column];
  return typeof value === 'string' && value !== '' ? value : null;
}

function count(row: Row, column: string): number {
  const value = row[column];
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function status(row: Row): PublicationStatus {
  return text(row, 'status') === 'published' ? 'published' : 'draft';
}

function toWork(row: Row): Work {
  return {
    id: text(row, 'id'),
    slug: text(row, 'slug'),
    clientId: nullableText(row, 'client_id'),
    clientName: text(row, 'client_name'),
    kind: text(row, 'kind'),
    year: text(row, 'year'),
    href: nullableText(row, 'href'),
    summary: text(row, 'summary'),
    coverUrl: nullableText(row, 'cover_url'),
    coverAlt: text(row, 'cover_alt'),
    tourUrl: nullableText(row, 'tour_url'),
    status: status(row),
    sortOrder: count(row, 'sort_order'),
    updatedAt: text(row, 'updated_at'),
  };
}

function toClient(row: Row): Client {
  return {
    id: text(row, 'id'),
    name: text(row, 'name'),
    city: text(row, 'city'),
    sector: text(row, 'sector'),
    logoUrl: nullableText(row, 'logo_url'),
    status: status(row),
    sortOrder: count(row, 'sort_order'),
    updatedAt: text(row, 'updated_at'),
  };
}

/*
 * Las consultas se escriben enteras y literales, sin una sola interpolación.
 *
 * `audit:forbidden` marca cualquier plantilla dentro de un SQL, y tiene razón
 * aunque acá lo interpolado fueran nombres de tabla y no datos: la regla vale
 * porque es la que no admite excusas. En el momento en que se acepta «esta
 * interpolación es de confianza», la siguiente también lo parece. Los valores
 * viajan siempre por `?`.
 */

const SQL = {
  worksAll:
    'SELECT id, slug, client_id, client_name, kind, year, href, summary, cover_url, cover_alt, tour_url, status, sort_order, updated_at FROM works ORDER BY sort_order ASC, updated_at DESC',
  worksByStatus:
    'SELECT id, slug, client_id, client_name, kind, year, href, summary, cover_url, cover_alt, tour_url, status, sort_order, updated_at FROM works WHERE status = ? ORDER BY sort_order ASC, updated_at DESC',
  workById:
    'SELECT id, slug, client_id, client_name, kind, year, href, summary, cover_url, cover_alt, tour_url, status, sort_order, updated_at FROM works WHERE id = ?',
  workUpsert:
    'INSERT INTO works (id, slug, client_id, client_name, kind, year, href, summary, cover_url, cover_alt, tour_url, status, sort_order, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, client_id=excluded.client_id, client_name=excluded.client_name, kind=excluded.kind, year=excluded.year, href=excluded.href, summary=excluded.summary, cover_url=excluded.cover_url, cover_alt=excluded.cover_alt, tour_url=excluded.tour_url, status=excluded.status, sort_order=excluded.sort_order, updated_at=excluded.updated_at',
  workDelete: 'DELETE FROM works WHERE id = ?',
  clientsAll:
    'SELECT id, name, city, sector, logo_url, status, sort_order, updated_at FROM clients ORDER BY sort_order ASC, updated_at DESC',
  clientsByStatus:
    'SELECT id, name, city, sector, logo_url, status, sort_order, updated_at FROM clients WHERE status = ? ORDER BY sort_order ASC, updated_at DESC',
  clientById:
    'SELECT id, name, city, sector, logo_url, status, sort_order, updated_at FROM clients WHERE id = ?',
  clientUpsert:
    'INSERT INTO clients (id, name, city, sector, logo_url, status, sort_order, updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, city=excluded.city, sector=excluded.sector, logo_url=excluded.logo_url, status=excluded.status, sort_order=excluded.sort_order, updated_at=excluded.updated_at',
  clientDelete: 'DELETE FROM clients WHERE id = ?',
} as const;

export class SqlitePortfolioRepository implements PortfolioRepositoryPort {
  private database: DatabaseSync | null = null;

  constructor(private readonly file: string) {}

  private open(): DatabaseSync {
    if (this.database !== null) return this.database;
    mkdirSync(dirname(this.file), { recursive: true });
    const database = new DatabaseSync(this.file);
    database.exec('PRAGMA journal_mode = WAL');
    database.exec('PRAGMA foreign_keys = ON');
    database.exec(SCHEMA);
    for (const { columns, column, ddl } of COLUMNAS_AGREGADAS) {
      const existentes = database.prepare(columns).all();
      const hay = existentes.some((fila) => text(fila, 'name') === column);
      if (!hay) database.exec(ddl);
    }
    this.database = database;
    return database;
  }

  private rows(all: string, byStatus: string, filter: ListFilter): readonly Row[] {
    if (filter.status === undefined) return this.open().prepare(all).all();
    return this.open().prepare(byStatus).all(filter.status);
  }

  private row(query: string, id: string): Row | null {
    return this.open().prepare(query).get(id) ?? null;
  }

  private write(query: string, values: readonly SQLInputValue[]): void {
    this.open()
      .prepare(query)
      .run(...values);
  }

  listWorks(filter: ListFilter): Promise<readonly Work[]> {
    return Promise.resolve(this.rows(SQL.worksAll, SQL.worksByStatus, filter).map(toWork));
  }

  findWork(id: string): Promise<Work | null> {
    const row = this.row(SQL.workById, id);
    return Promise.resolve(row === null ? null : toWork(row));
  }

  saveWork(work: Work): Promise<void> {
    this.write(SQL.workUpsert, [
      work.id,
      work.slug,
      work.clientId,
      work.clientName,
      work.kind,
      work.year,
      work.href,
      work.summary,
      work.coverUrl,
      work.coverAlt,
      work.tourUrl,
      work.status,
      work.sortOrder,
      work.updatedAt,
    ]);
    return Promise.resolve();
  }

  removeWork(id: string): Promise<void> {
    this.write(SQL.workDelete, [id]);
    return Promise.resolve();
  }

  listClients(filter: ListFilter): Promise<readonly Client[]> {
    return Promise.resolve(this.rows(SQL.clientsAll, SQL.clientsByStatus, filter).map(toClient));
  }

  findClient(id: string): Promise<Client | null> {
    const row = this.row(SQL.clientById, id);
    return Promise.resolve(row === null ? null : toClient(row));
  }

  saveClient(client: Client): Promise<void> {
    this.write(SQL.clientUpsert, [
      client.id,
      client.name,
      client.city,
      client.sector,
      client.logoUrl,
      client.status,
      client.sortOrder,
      client.updatedAt,
    ]);
    return Promise.resolve();
  }

  removeClient(id: string): Promise<void> {
    this.write(SQL.clientDelete, [id]);
    return Promise.resolve();
  }
}
