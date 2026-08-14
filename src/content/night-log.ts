/**
 * El registro nocturno de la portada.
 *
 * Es el argumento del sitio hecho imagen: siete cosas que pasan mientras el
 * local está cerrado. Va con `aria-hidden` porque es decorativo —lo que dice ya
 * está en el titular y en la bajada— y leerlo en bucle estorbaría.
 *
 * Horas y textos inventados, como corresponde a una demostración: ningún dato de
 * un cliente real.
 */

export interface NightLogEntry {
  readonly time: string;
  readonly event: string;
}

export const NIGHT_LOG: readonly NightLogEntry[] = [
  { time: '22:41', event: 'Instagram: consulta de precios respondida' },
  { time: '23:12', event: 'Cita confirmada para el jueves 09:30' },
  { time: '00:04', event: 'Cierre de caja del local Norte' },
  { time: '01:35', event: '12 mensajes contestados, 3 pasaron a una persona' },
  { time: '02:50', event: 'Aviso de stock bajo el mínimo' },
  { time: '04:18', event: 'Recordatorio enviado a 6 pacientes' },
  { time: '06:30', event: 'Reporte de ventas listo antes de abrir' },
];

/** Cuántas filas se ven a la vez, y cada cuánto entra la siguiente. */
export const NIGHT_LOG_VISIBLE = 4;
export const NIGHT_LOG_INTERVAL_MS = 3400;
