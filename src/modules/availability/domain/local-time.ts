/**
 * Conversión entre instantes y hora de pared de una zona.
 *
 * **La zona es siempre explícita.** El motor no usa nunca la del servidor: un
 * sitio desplegado en Virginia tiene que ofrecer las mismas horas que uno
 * desplegado en Guayaquil, y la única forma de garantizarlo es no leer nunca la
 * zona del entorno.
 *
 * Usa `Intl`, que es parte del lenguaje. No hay import de terceros: esto sigue
 * siendo dominio puro y `audit:arch` lo verifica.
 *
 * Ecuador no tiene horario de verano, pero acá no se aprovecha: el cálculo del
 * desfase se hace igual para cada instante. Dar por sentado un desfase fijo es
 * la clase de atajo que funciona hasta que un país cambia de regla.
 */

import { MINUTES_PER_DAY, MINUTES_PER_HOUR } from './scheduling-policy';

const MILLISECONDS_PER_MINUTE = 60_000;
const NOON_HOUR = 12;

export interface LocalDay {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  /** 1 = lunes … 7 = domingo, como ISO. */
  readonly weekday: number;
}

export interface LocalMoment extends LocalDay {
  readonly minuteOfDay: number;
}

const PART_TYPES = ['year', 'month', 'day', 'hour', 'minute', 'weekday'] as const;

function partsOf(instant: Date, timeZone: string): Readonly<Record<string, string>> {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  });

  const found: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) {
    if ((PART_TYPES as readonly string[]).includes(part.type)) found[part.type] = part.value;
  }
  return found;
}

const ISO_WEEKDAYS: Readonly<Record<string, number>> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function numberOf(parts: Readonly<Record<string, string>>, key: string): number {
  return Number.parseInt(parts[key] ?? '0', 10);
}

export function localMomentOf(instant: Date, timeZone: string): LocalMoment {
  const parts = partsOf(instant, timeZone);
  const hour = numberOf(parts, 'hour');
  const minute = numberOf(parts, 'minute');

  return {
    year: numberOf(parts, 'year'),
    month: numberOf(parts, 'month'),
    day: numberOf(parts, 'day'),
    weekday: ISO_WEEKDAYS[parts['weekday'] ?? ''] ?? 1,
    minuteOfDay: hour * MINUTES_PER_HOUR + minute,
  };
}

/** Cuántos minutos va la zona por delante de UTC en ese instante. */
function offsetMinutesAt(instant: Date, timeZone: string): number {
  const local = localMomentOf(instant, timeZone);
  const asIfUtc =
    Date.UTC(local.year, local.month - 1, local.day) +
    local.minuteOfDay * MILLISECONDS_PER_MINUTE;
  return (asIfUtc - instant.getTime()) / MILLISECONDS_PER_MINUTE;
}

/**
 * Del reloj de pared al instante.
 *
 * Dos pasos: se supone que la hora local es UTC, se mide el desfase real de ese
 * momento y se corrige. Es la forma estándar de hacerlo sin una librería de
 * zonas horarias, y es exacta en cualquier zona sin salto ese día.
 */
export function instantOfLocal(day: LocalDay, minuteOfDay: number, timeZone: string): Date {
  const guess = new Date(
    Date.UTC(day.year, day.month - 1, day.day) + minuteOfDay * MILLISECONDS_PER_MINUTE,
  );
  const offset = offsetMinutesAt(guess, timeZone);
  return new Date(guess.getTime() - offset * MILLISECONDS_PER_MINUTE);
}

/** El día local siguiente, sin pasar por husos ni por aritmética de milisegundos. */
export function nextLocalDay(day: LocalDay, timeZone: string): LocalDay {
  // Se salta desde el mediodía y no desde la medianoche: si una zona moviera el
  // reloj a las 00:00, sumar un día desde ahí caería en la hora que no existe.
  const noon = NOON_HOUR * MINUTES_PER_HOUR;
  const dayAfter = new Date(
    instantOfLocal(day, noon, timeZone).getTime() + MINUTES_PER_DAY * MILLISECONDS_PER_MINUTE,
  );
  const moment = localMomentOf(dayAfter, timeZone);
  return { year: moment.year, month: moment.month, day: moment.day, weekday: moment.weekday };
}
