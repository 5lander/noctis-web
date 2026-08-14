import type {
  CalendarEvent,
  CalendarEventRequest,
  CalendarPort,
} from '@/modules/availability/application/ports/calendar-port';
import { overlaps, type TimeRange } from '@/modules/availability/domain/time-range';
import {
  applyBehaviour,
  HEALTHY_WITH_LATENCY,
  type FakeBehaviour,
} from '@/shared/infrastructure/fakes/fake-behaviour';

/**
 * Calendario simulado.
 *
 * Devuelve bloques ocupados **deterministas**: dos por día hábil, siempre los
 * mismos. Nada de aleatorio — una demostración que cambia entre recargas no
 * sirve para mostrarle nada a nadie, y una prueba que cambia no sirve para nada.
 *
 * Aplica la misma validación que el real, incluida la de doble reserva: crear un
 * evento sobre un espacio ocupado se rechaza acá, no más adelante.
 *
 * No se descarta cuando llegue Google: es el entorno de pruebas y el modo
 * demostración (`BUILD.md` §3).
 */

/** Media mañana y media tarde: creíble, y deja huecos a ambos lados. */
const MORNING_BUSY_HOUR = 11;
const AFTERNOON_BUSY_HOUR = 15;
const SEEDED_BUSY_HOURS = [MORNING_BUSY_HOUR, AFTERNOON_BUSY_HOUR] as const;
const BUSY_BLOCK_HOURS = 1;
const SATURDAY = 6;
const SUNDAY = 0;
const MEETING_URL = 'https://meet.example/noctis-demo';

function isWorkday(day: Date): boolean {
  const weekday = day.getUTCDay();
  return weekday !== SATURDAY && weekday !== SUNDAY;
}

function blockAt(day: Date, hour: number): TimeRange {
  const startsAt = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour),
  );
  const endsAt = new Date(startsAt);
  endsAt.setUTCHours(startsAt.getUTCHours() + BUSY_BLOCK_HOURS);
  return { startsAt, endsAt };
}

function blocksOfDay(day: Date, window: TimeRange): readonly TimeRange[] {
  return SEEDED_BUSY_HOURS.map((hour) => blockAt(day, hour)).filter((block) =>
    overlaps(block, window),
  );
}

function seededBusyRanges(window: TimeRange): readonly TimeRange[] {
  const found: TimeRange[] = [];
  const cursor = new Date(window.startsAt);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor.getTime() < window.endsAt.getTime()) {
    if (isWorkday(cursor)) found.push(...blocksOfDay(cursor, window));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return found;
}

export class FakeCalendar implements CalendarPort {
  private readonly created: TimeRange[] = [];
  private nextEventNumber = 1;

  constructor(private readonly behaviour: FakeBehaviour = HEALTHY_WITH_LATENCY) {}

  async busyRanges(window: TimeRange): Promise<readonly TimeRange[]> {
    await applyBehaviour(this.behaviour, 'calendario');
    return [...seededBusyRanges(window), ...this.created.filter((r) => overlaps(r, window))];
  }

  async createEvent(request: CalendarEventRequest): Promise<CalendarEvent> {
    await applyBehaviour(this.behaviour, 'calendario');

    const busy = await this.busyRangesWithoutLatency(request.range);
    if (busy.some((range) => overlaps(range, request.range))) {
      throw new SlotAlreadyTakenError();
    }

    this.created.push(request.range);
    const eventId = `demo-${String(this.nextEventNumber)}`;
    this.nextEventNumber += 1;
    return { eventId, range: request.range, meetingUrl: MEETING_URL };
  }

  /** La verificación previa a crear no vuelve a pagar la latencia simulada. */
  private busyRangesWithoutLatency(window: TimeRange): Promise<readonly TimeRange[]> {
    return Promise.resolve([
      ...seededBusyRanges(window),
      ...this.created.filter((range) => overlaps(range, window)),
    ]);
  }
}

export class SlotAlreadyTakenError extends Error {
  constructor() {
    super('El espacio ya estaba ocupado');
    this.name = 'SlotAlreadyTakenError';
  }
}
