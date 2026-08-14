import type { StorePort } from '@/shared/application/ports/store-port';

/**
 * Almacén en memoria. La implementación de v1 (`CLAUDE.md` §5, D5 🟡).
 *
 * Muere con el proceso, y eso está bien: nada de lo que guarda tiene que
 * sobrevivir a un reinicio hasta que se decida persistir. Cuando se decida,
 * entra un adaptador de PostgreSQL detrás de esta misma interfaz sin tocar
 * dominio ni casos de uso.
 *
 * `async` aunque no espere nada: si el puerto fuera síncrono, el día que llegue
 * la base de datos cambiaría la interfaz y con ella todos sus consumidores.
 */
export class MemoryStore<T> implements StorePort<T> {
  private readonly values = new Map<string, T>();

  save(id: string, value: T): Promise<void> {
    this.values.set(id, value);
    return Promise.resolve();
  }

  read(id: string): Promise<T | null> {
    return Promise.resolve(this.values.get(id) ?? null);
  }

  remove(id: string): Promise<void> {
    this.values.delete(id);
    return Promise.resolve();
  }

  /** Solo para pruebas y para la bandeja de desarrollo. */
  size(): number {
    return this.values.size;
  }
}
