import type { TimeRange } from '@/modules/availability/domain/time-range';

/**
 * El calendario del equipo, visto desde adentro del sistema.
 *
 * **RN1 está en la forma del puerto, no en la disciplina de quien lo use.**
 * `busyRanges` devuelve intervalos y nada más: ni títulos, ni asistentes, ni
 * notas, ni la existencia de eventos privados. Un adaptador no puede filtrar el
 * detalle de la agenda aunque quiera, porque no hay dónde ponerlo.
 *
 * El adaptador simulado y el de Google implementan esto mismo. Cambiar de uno a
 * otro no toca una línea de lógica (`BUILD.md` §2).
 */

export interface CalendarEventRequest {
  readonly range: TimeRange;
  readonly title: string;
  readonly attendeeEmail: string;
}

export interface CalendarEvent {
  readonly eventId: string;
  readonly range: TimeRange;
  readonly meetingUrl: string;
}

export interface CalendarPort {
  /** Solo bloques ocupados dentro de la ventana pedida. */
  busyRanges(window: TimeRange): Promise<readonly TimeRange[]>;

  /**
   * Verifica y crea en una sola operación. Rechaza si el espacio ya está
   * ocupado: es la mitad de lo que impide la doble reserva (RN2). La otra mitad
   * es el caso de uso de P6.
   */
  createEvent(request: CalendarEventRequest): Promise<CalendarEvent>;
}
