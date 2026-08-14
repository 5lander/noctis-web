/**
 * El almacén.
 *
 * En v1 puede no haber base de datos (`CLAUDE.md` §5): la implementación es en
 * memoria. Si se decide persistir (D5), entra un adaptador de PostgreSQL detrás
 * de esta misma interfaz, **sin tocar dominio ni casos de uso**.
 *
 * Deliberadamente estrecho: guardar, leer y borrar por identificador. Un puerto
 * con consultas ricas obligaría a que el adaptador en memoria reimplemente medio
 * motor de base de datos para nada.
 */

export interface StorePort<T> {
  save(id: string, value: T): Promise<void>;
  read(id: string): Promise<T | null>;
  remove(id: string): Promise<void>;
}
