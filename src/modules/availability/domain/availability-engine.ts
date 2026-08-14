import { instantOfLocal, localMomentOf, nextLocalDay, type LocalDay } from './local-time';
import {
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  type DailyWindow,
  type SchedulingPolicy,
} from './scheduling-policy';
import { overlaps, type TimeRange } from './time-range';
import { slotOf, type TimeSlot } from './time-slot';

/**
 * El motor de disponibilidad. El corazón del sistema (`CLAUDE.md` §2).
 *
 * Entra un conjunto de bloques ocupados y una política; salen los espacios
 * libres. **Nada más.** No sabe que existe Google Calendar, ni una base de
 * datos, ni una petición HTTP: por eso se prueba sin levantar nada, que es la
 * prueba de que las capas están bien cortadas.
 *
 * `now` entra por parámetro y no se lee del reloj. Sin eso, probar el aviso
 * mínimo de doce horas obligaría a falsear el tiempo, y una regla de negocio no
 * debería necesitar eso para verificarse.
 *
 * Las reglas que aplica, todas de `DECISIONES.md`:
 *
 * | Regla | Cómo se aplica |
 * |---|---|
 * | D1 horario | Solo se generan candidatos dentro de los tramos de la política |
 * | D1 días | Solo días de la semana declarados como hábiles |
 * | D3 duración | Cada espacio dura lo que diga la política |
 * | D3 margen | Un espacio se descarta si él **o su margen** tocan algo ocupado |
 * | D3 aviso | Se descarta lo que empiece antes de ahora + el aviso mínimo |
 * | D3 ventana | Se recorren tantos días hábiles como diga la política, no días naturales |
 * | D2 tope diario | Un día que ya llegó al tope no ofrece nada |
 *
 * Sobre el tope diario: el motor cuenta como reunión **todo bloque ocupado que
 * caiga en el día**. Es lo único que puede saber —el calendario no distingue
 * entre una reunión con un prospecto y cualquier otro compromiso— y se equivoca
 * hacia el lado seguro: ofrece de menos, nunca de más. La verificación al
 * reservar es de P6.
 */

const MILLISECONDS_PER_MINUTE = 60_000;

export interface AvailabilityQuery {
  readonly policy: SchedulingPolicy;
  readonly busy: readonly TimeRange[];
  readonly now: Date;
}

/** Los minutos de inicio de cada candidato dentro de un tramo. */
function startMinutesIn(window: DailyWindow, policy: SchedulingPolicy): readonly number[] {
  const step = policy.meetingMinutes + policy.bufferMinutes;
  const starts: number[] = [];

  for (
    let minute = window.fromMinute;
    minute + policy.meetingMinutes <= window.toMinute;
    minute += step
  ) {
    starts.push(minute);
  }

  return starts;
}

function candidatesOn(day: LocalDay, policy: SchedulingPolicy): readonly TimeRange[] {
  return policy.windows.flatMap((window) =>
    startMinutesIn(window, policy).map((minute) => ({
      startsAt: instantOfLocal(day, minute, policy.timeZone),
      endsAt: instantOfLocal(day, minute + policy.meetingMinutes, policy.timeZone),
    })),
  );
}

/** El margen se aplica a los dos lados: no se pega a lo ocupado ni antes ni después. */
function isBlocked(slot: TimeRange, busy: readonly TimeRange[], bufferMinutes: number): boolean {
  const padding = bufferMinutes * MILLISECONDS_PER_MINUTE;
  const padded: TimeRange = {
    startsAt: new Date(slot.startsAt.getTime() - padding),
    endsAt: new Date(slot.endsAt.getTime() + padding),
  };

  return busy.some((block) => overlaps(padded, block));
}

function meetingsOn(day: LocalDay, policy: SchedulingPolicy, busy: readonly TimeRange[]): number {
  const wholeDay: TimeRange = {
    startsAt: instantOfLocal(day, 0, policy.timeZone),
    endsAt: instantOfLocal(day, MINUTES_PER_DAY, policy.timeZone),
  };

  return busy.filter((block) => overlaps(block, wholeDay)).length;
}

function workdaysFrom(start: LocalDay, policy: SchedulingPolicy): readonly LocalDay[] {
  const workdays = new Set(policy.workdays);
  const found: LocalDay[] = [];
  let cursor = start;

  while (found.length < policy.horizonWorkdays) {
    if (workdays.has(cursor.weekday)) found.push(cursor);
    cursor = nextLocalDay(cursor, policy.timeZone);
  }

  return found;
}

function availableOn(day: LocalDay, query: AvailabilityQuery, earliest: Date): readonly TimeSlot[] {
  const { policy, busy } = query;

  if (meetingsOn(day, policy, busy) >= policy.maxMeetingsPerDay) return [];

  return candidatesOn(day, policy)
    .filter((slot) => slot.startsAt.getTime() >= earliest.getTime())
    .filter((slot) => !isBlocked(slot, busy, policy.bufferMinutes))
    .map(slotOf);
}

export function freeSlots(query: AvailabilityQuery): readonly TimeSlot[] {
  const { policy, now } = query;
  const earliest = new Date(
    now.getTime() + policy.minimumNoticeHours * MINUTES_PER_HOUR * MILLISECONDS_PER_MINUTE,
  );

  return workdaysFrom(localMomentOf(now, policy.timeZone), policy).flatMap((day) =>
    availableOn(day, query, earliest),
  );
}
