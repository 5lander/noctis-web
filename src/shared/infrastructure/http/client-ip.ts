/**
 * Origen de la petición, solo para agrupar el conteo del limitador.
 *
 * El valor **no se registra**: bajo LOPDP una dirección IP identifica a una
 * persona, y RN12 dice que ningún dato personal entra al registro. Se usa como
 * clave en memoria, con vida de una ventana, y se descarta.
 */

const FORWARDED_FOR_HEADER = 'x-forwarded-for';
const UNKNOWN_CLIENT = 'origen-desconocido';

export function readClientKey(headers: Headers): string {
  const forwarded = headers.get(FORWARDED_FOR_HEADER);
  if (forwarded === null) return UNKNOWN_CLIENT;

  const first = forwarded.split(',')[0]?.trim() ?? '';
  return first === '' ? UNKNOWN_CLIENT : first;
}
