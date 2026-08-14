/**
 * Las reglas de agendamiento, como **dato del dominio**.
 *
 * Los valores concretos (D1–D3 de `DECISIONES.md`) no viven acá: viven en
 * `src/config/scheduling.ts`, versionados. El dominio recibe la política por
 * parámetro y no la busca, que es lo que le permite ser puro y lo que hace que
 * cambiar un horario sea editar una configuración y no un motor.
 *
 * Los minutos se cuentan desde la medianoche **local**. Guardar horas y minutos
 * por separado invita a olvidarse de uno de los dos.
 */

export interface DailyWindow {
  readonly fromMinute: number;
  readonly toMinute: number;
}

export interface SchedulingPolicy {
  /** Zona IANA. El motor jamás usa la del servidor. */
  readonly timeZone: string;
  /** Días de la semana en que se atiende, 1 = lunes … 7 = domingo. */
  readonly workdays: readonly number[];
  /** Tramos de atención dentro de un día hábil. */
  readonly windows: readonly DailyWindow[];
  readonly meetingMinutes: number;
  /** Aire entre una reunión y la siguiente. */
  readonly bufferMinutes: number;
  /** Con menos aviso que esto, no se agenda. */
  readonly minimumNoticeHours: number;
  /** Cuántos días hábiles hacia adelante se ofrecen. */
  readonly horizonWorkdays: number;
  readonly maxMeetingsPerDay: number;
}

export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 1440;

export function minutesOf(hour: number, minute = 0): number {
  return hour * MINUTES_PER_HOUR + minute;
}
