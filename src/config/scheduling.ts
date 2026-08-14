import {
  minutesOf,
  type SchedulingPolicy,
} from '@/modules/availability/domain/scheduling-policy';

/**
 * Los valores de D1, D2 y D3 de `DECISIONES.md`, versionados.
 *
 * Están acá y no dentro del motor porque `CLAUDE.md` §9 lo exige: las decisiones
 * provisionales se implementan **como configuración versionada, nunca
 * incrustadas**. Cuando el usuario confirme el horario real (B4 de
 * `FASE0-CHECKLIST.md`), se cambia este archivo y nada más.
 *
 * El dominio no importa esto. Es al revés: quien compone le pasa la política al
 * motor, que por eso puede probarse con cualquier horario sin tocar nada.
 */

/** D1 · Lunes a viernes, 09:00–13:00 y 14:30–17:30, hora de Guayaquil. */
export const NOCTIS_SCHEDULING: SchedulingPolicy = {
  timeZone: 'America/Guayaquil',
  workdays: [1, 2, 3, 4, 5],
  windows: [
    { fromMinute: minutesOf(9), toMinute: minutesOf(13) },
    { fromMinute: minutesOf(14, 30), toMinute: minutesOf(17, 30) },
  ],
  /** D3 · 20 minutos de reunión, 10 de margen, 12 horas de aviso, 10 días hábiles. */
  meetingMinutes: 20,
  bufferMinutes: 10,
  minimumNoticeHours: 12,
  horizonWorkdays: 10,
  /** D2 · cuatro reuniones por día. */
  maxMeetingsPerDay: 4,
};
