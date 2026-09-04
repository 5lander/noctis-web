/**
 * El puerto del portafolio.
 *
 * Existe para que la pregunta «¿el hosting me soporta esto?» tenga una sola
 * respuesta posible: **sí, y si el que tienes no, se cambia un adaptador**.
 * Detrás de esta interfaz hay hoy SQLite en disco y memoria para pruebas; el día
 * que el sitio viva en un hosting sin disco persistente, entra un adaptador de
 * PostgreSQL y no se toca ni el dominio ni la página.
 *
 * Deliberadamente estrecho, como `StorePort`: listar, buscar, guardar y borrar.
 * Un puerto con consultas ricas obligaría al adaptador en memoria a reimplementar
 * medio motor de base de datos para nada.
 */

import type { Client, PublicationStatus, Work } from '@/modules/portfolio/domain/portfolio';

export interface ListFilter {
  /** Sin `status`, devuelve todo: es lo que necesita el panel. */
  readonly status?: PublicationStatus;
}

export interface PortfolioRepositoryPort {
  listWorks(filter: ListFilter): Promise<readonly Work[]>;
  findWork(id: string): Promise<Work | null>;
  saveWork(work: Work): Promise<void>;
  removeWork(id: string): Promise<void>;

  listClients(filter: ListFilter): Promise<readonly Client[]>;
  findClient(id: string): Promise<Client | null>;
  saveClient(client: Client): Promise<void>;
  removeClient(id: string): Promise<void>;
}
