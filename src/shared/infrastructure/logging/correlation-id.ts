/**
 * Identificador de correlación: atraviesa petición → registro → respuesta y
 * permite reconstruir qué pasó sin guardar un solo dato de la persona.
 *
 * Se genera SIEMPRE del lado servidor. El valor que llegue del cliente en la
 * cabecera se descarta: aceptarlo dejaría forjar entradas en el registro
 * (SEGURIDAD.md §1.2) y ensuciar la traza de otra petición.
 */

export const CORRELATION_HEADER = 'x-correlation-id';

export function createCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Lee el identificador que el middleware ya colocó en la petición. Si el
 * handler se invoca sin pasar por el middleware (pruebas, rutas fuera del
 * matcher), genera uno para que jamás se registre un evento sin traza.
 */
export function readCorrelationId(headers: Headers): string {
  const value = headers.get(CORRELATION_HEADER);
  return value === null || value === '' ? createCorrelationId() : value;
}
