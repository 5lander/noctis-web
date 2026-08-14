/**
 * Un intervalo de tiempo. El tipo de dominio más pequeño del sistema.
 *
 * Existe en P4 porque los puertos lo necesitan para hablar de bloques ocupados
 * sin usar dos `Date` sueltos, que es lo que prohíbe `CLAUDE.md` §3. El motor de
 * disponibilidad de P5 construye sobre esto.
 *
 * Es dominio puro: no importa nada, ni siquiera de `shared`. `audit:arch` lo
 * vigila.
 */

export interface TimeRange {
  readonly startsAt: Date;
  readonly endsAt: Date;
}

export function isValidRange(range: TimeRange): boolean {
  return range.startsAt.getTime() < range.endsAt.getTime();
}

/** Dos intervalos se solapan si cada uno empieza antes de que el otro termine. */
export function overlaps(first: TimeRange, second: TimeRange): boolean {
  return (
    first.startsAt.getTime() < second.endsAt.getTime() &&
    second.startsAt.getTime() < first.endsAt.getTime()
  );
}

export function durationInMinutes(range: TimeRange): number {
  const millisecondsPerMinute = 60_000;
  return (range.endsAt.getTime() - range.startsAt.getTime()) / millisecondsPerMinute;
}
