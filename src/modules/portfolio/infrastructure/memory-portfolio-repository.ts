/**
 * El portafolio en memoria.
 *
 * No es un juguete: es el modo demostración y el entorno de pruebas, igual que
 * el resto de adaptadores simulados (`ESTADO.md`, lo que dejó P4). Arranca
 * **vacío a propósito** — con la sección de trabajos sin nada publicado, el
 * sitio no pinta la sección, que es exactamente el comportamiento que la
 * auditoría pedía.
 */

import type {
  ListFilter,
  PortfolioRepositoryPort,
} from '@/modules/portfolio/application/ports/portfolio-repository-port';
import { byDisplayOrder, type Client, type Work } from '@/modules/portfolio/domain/portfolio';

function matches(record: { status: string }, filter: ListFilter): boolean {
  return filter.status === undefined || record.status === filter.status;
}

export class MemoryPortfolioRepository implements PortfolioRepositoryPort {
  private readonly works = new Map<string, Work>();
  private readonly clients = new Map<string, Client>();

  listWorks(filter: ListFilter): Promise<readonly Work[]> {
    const rows = [...this.works.values()].filter((work) => matches(work, filter));
    return Promise.resolve(rows.sort(byDisplayOrder));
  }

  findWork(id: string): Promise<Work | null> {
    return Promise.resolve(this.works.get(id) ?? null);
  }

  saveWork(work: Work): Promise<void> {
    this.works.set(work.id, work);
    return Promise.resolve();
  }

  removeWork(id: string): Promise<void> {
    this.works.delete(id);
    return Promise.resolve();
  }

  listClients(filter: ListFilter): Promise<readonly Client[]> {
    const rows = [...this.clients.values()].filter((client) => matches(client, filter));
    return Promise.resolve(rows.sort(byDisplayOrder));
  }

  findClient(id: string): Promise<Client | null> {
    return Promise.resolve(this.clients.get(id) ?? null);
  }

  saveClient(client: Client): Promise<void> {
    this.clients.set(client.id, client);
    return Promise.resolve();
  }

  removeClient(id: string): Promise<void> {
    this.clients.delete(id);
    return Promise.resolve();
  }
}
