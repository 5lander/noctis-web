import { describe, expect, it } from 'vitest';

import { NOCTIS_SCHEDULING } from '@/config/scheduling';

import { freeSlots, type AvailabilityQuery } from './availability-engine';
import { localMomentOf } from './local-time';
import type { TimeRange } from './time-range';

/**
 * Los casos conocidos del motor. La lista con el resultado esperado escrito a
 * mano **antes** de ejecutar está en `docs/pruebas/casos-conocidos.md`.
 *
 * Nada de esto levanta base de datos, red ni Google Calendar. Si algún día hace
 * falta, las capas están mal y hay que arreglarlas antes de seguir
 * (`CLAUDE.md` §2).
 *
 * Guayaquil es UTC−5 todo el año, así que las 09:00 locales son las 14:00 UTC.
 * Se escribe en UTC en las pruebas a propósito: si el motor se equivocara de
 * zona, los números no cuadrarían.
 */

const GUAYAQUIL_OFFSET_HOURS = 5;

/** Un instante a partir de la hora de pared de Guayaquil. */
function local(day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(2026, 7, day, hour + GUAYAQUIL_OFFSET_HOURS, minute));
}

/** Lunes 17 de agosto de 2026, 08:00 de Guayaquil. */
const MONDAY_MORNING = local(17, 8);

function query(overrides: Partial<AvailabilityQuery> = {}): AvailabilityQuery {
  return { policy: NOCTIS_SCHEDULING, busy: [], now: MONDAY_MORNING, ...overrides };
}

function busyBlock(day: number, fromHour: number, toHour: number): TimeRange {
  return { startsAt: local(day, fromHour), endsAt: local(day, toHour) };
}

function wallClock(instant: Date): string {
  const moment = localMomentOf(instant, NOCTIS_SCHEDULING.timeZone);
  const hour = Math.floor(moment.minuteOfDay / 60);
  const minute = moment.minuteOfDay % 60;
  return `${String(moment.day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function wallClocksOf(slots: readonly { range: TimeRange }[]): string[] {
  return slots.map((slot) => wallClock(slot.range.startsAt));
}

describe('D1 — horario y días de atención', () => {
  it('no ofrece nada fuera de los dos tramos', () => {
    const slots = freeSlots(query());

    for (const slot of slots) {
      const minute = localMomentOf(slot.range.startsAt, NOCTIS_SCHEDULING.timeZone).minuteOfDay;
      const morning = minute >= 9 * 60 && minute < 13 * 60;
      const afternoon = minute >= 14 * 60 + 30 && minute < 17 * 60 + 30;
      expect(morning || afternoon).toBe(true);
    }
  });

  it('no ofrece sábados ni domingos', () => {
    for (const slot of freeSlots(query())) {
      const weekday = localMomentOf(slot.range.startsAt, NOCTIS_SCHEDULING.timeZone).weekday;
      expect(weekday).toBeLessThanOrEqual(5);
    }
  });

  it('el último espacio de cada tramo cabe entero: no se desborda el horario', () => {
    const morning = freeSlots(query()).filter((slot) => wallClock(slot.range.startsAt) === '18 12:30');

    expect(morning).toHaveLength(1);
    expect(wallClock(morning[0]?.range.endsAt ?? new Date(0))).toBe('18 12:50');
  });

  it('un día hábil libre ofrece catorce espacios: ocho de mañana y seis de tarde', () => {
    const tuesday = freeSlots(query()).filter((slot) =>
      wallClock(slot.range.startsAt).startsWith('18 '),
    );

    expect(tuesday).toHaveLength(14);
  });
});

describe('D3 — aviso mínimo de doce horas', () => {
  it('el lunes a las 08:00 no se puede agendar ese mismo lunes', () => {
    const monday = freeSlots(query()).filter((slot) =>
      wallClock(slot.range.startsAt).startsWith('17 '),
    );

    expect(monday).toHaveLength(0);
  });

  it('el primer espacio disponible es el martes a las 09:00', () => {
    expect(wallClocksOf(freeSlots(query()))[0]).toBe('18 09:00');
  });

  it('el borde exacto de las doce horas entra', () => {
    // Lunes 21:00 + 12 h = martes 09:00, justo el inicio del primer espacio.
    const slots = freeSlots(query({ now: local(17, 21) }));

    expect(wallClocksOf(slots)[0]).toBe('18 09:00');
  });

  it('un minuto después del borde, ese espacio ya no se ofrece', () => {
    const slots = freeSlots(query({ now: local(17, 21, 1) }));

    expect(wallClocksOf(slots)[0]).toBe('18 09:30');
  });
});

describe('D3 — margen entre reuniones', () => {
  it('un bloque ocupado tapa también los espacios pegados a sus bordes', () => {
    const slots = freeSlots(query({ busy: [busyBlock(18, 10, 11)] }));
    const tuesday = wallClocksOf(slots).filter((label) => label.startsWith('18 '));

    // 11:00–11:20 arrancaría pegado al final del bloque, sin un minuto de aire.
    expect(tuesday).not.toContain('18 11:00');
    // 11:30 deja treinta minutos: entra.
    expect(tuesday).toContain('18 11:30');
    // 09:00–09:20 termina cuarenta minutos antes: entra.
    expect(tuesday).toContain('18 09:00');
    // 09:30–09:50 deja **exactamente** los diez minutos de margen, y eso alcanza:
    // el margen es un mínimo, no una separación que haya que superar.
    expect(tuesday).toContain('18 09:30');
  });

  it('un espacio pegado al comienzo de lo ocupado, sin margen, se descarta', () => {
    // 09:40–10:00 terminaría justo cuando empieza el bloque: cero margen.
    const slots = freeSlots(
      query({
        policy: { ...NOCTIS_SCHEDULING, meetingMinutes: 20, bufferMinutes: 20 },
        busy: [busyBlock(18, 10, 11)],
      }),
    );
    const tuesday = wallClocksOf(slots).filter((label) => label.startsWith('18 '));

    // Con margen de veinte, 09:20–09:40 ya no alcanza y 09:00 sí.
    expect(tuesday).not.toContain('18 09:20');
    expect(tuesday).toContain('18 09:00');
  });

  it('los espacios ofrecidos ya vienen separados entre sí por el margen', () => {
    const tuesday = freeSlots(query()).filter((slot) =>
      wallClock(slot.range.startsAt).startsWith('18 '),
    );
    const first = tuesday[0]?.range;
    const second = tuesday[1]?.range;

    expect(second?.startsAt.getTime()).toBe((first?.endsAt.getTime() ?? 0) + 10 * 60_000);
  });
});

describe('D2 — tope de reuniones por día', () => {
  it('un día que ya llegó al tope no ofrece nada', () => {
    const full = [
      busyBlock(18, 9, 10),
      busyBlock(18, 10, 11),
      busyBlock(18, 11, 12),
      busyBlock(18, 15, 16),
    ];
    const tuesday = wallClocksOf(freeSlots(query({ busy: full }))).filter((label) =>
      label.startsWith('18 '),
    );

    expect(tuesday).toHaveLength(0);
  });

  it('con una reunión menos, el día sigue ofreciendo espacios', () => {
    const almostFull = [busyBlock(18, 9, 10), busyBlock(18, 10, 11), busyBlock(18, 11, 12)];
    const tuesday = wallClocksOf(freeSlots(query({ busy: almostFull }))).filter((label) =>
      label.startsWith('18 '),
    );

    expect(tuesday.length).toBeGreaterThan(0);
  });

  it('un día lleno no afecta a los demás', () => {
    const full = [
      busyBlock(18, 9, 10),
      busyBlock(18, 10, 11),
      busyBlock(18, 11, 12),
      busyBlock(18, 15, 16),
    ];
    const wednesday = wallClocksOf(freeSlots(query({ busy: full }))).filter((label) =>
      label.startsWith('19 '),
    );

    expect(wednesday).toHaveLength(14);
  });
});

describe('D3 — ventana de diez días hábiles', () => {
  /**
   * La ventana cuenta **desde hoy**, no desde el primer día agendable. Es un
   * techo —"no más de diez días hábiles hacia adelante"— y no una promesa de
   * ofrecer diez días. Por eso el lunes cuenta aunque su día quede entero fuera
   * por el aviso mínimo, y el visitante ve nueve días. Se equivoca hacia el lado
   * seguro: nunca ofrece más allá de la ventana.
   */
  it('recorre días hábiles, no naturales: del martes 18 al viernes 28, salteando dos fines de semana', () => {
    const days = [...new Set(wallClocksOf(freeSlots(query())).map((label) => label.slice(0, 2)))];

    expect(days).toEqual(['18', '19', '20', '21', '24', '25', '26', '27', '28']);
  });

  it('cruza el cambio de mes sin perder días', () => {
    const days = [
      ...new Set(wallClocksOf(freeSlots(query({ now: local(25, 8) }))).map((l) => l.slice(0, 2))),
    ];

    // Del miércoles 26 de agosto al lunes 7 de septiembre.
    expect(days).toEqual(['26', '27', '28', '31', '01', '02', '03', '04', '07']);
  });
});

describe('propiedades del resultado', () => {
  it('cada espacio dura lo que dice la política', () => {
    for (const slot of freeSlots(query())) {
      const minutes = (slot.range.endsAt.getTime() - slot.range.startsAt.getTime()) / 60_000;
      expect(minutes).toBe(NOCTIS_SCHEDULING.meetingMinutes);
    }
  });

  it('los identificadores no se repiten y son estables entre llamadas', () => {
    const first = freeSlots(query()).map((slot) => slot.id);
    const second = freeSlots(query()).map((slot) => slot.id);

    expect(new Set(first).size).toBe(first.length);
    expect(first).toEqual(second);
  });

  it('vienen en orden cronológico', () => {
    const times = freeSlots(query()).map((slot) => slot.range.startsAt.getTime());
    const sorted = [...times].sort((a, b) => a - b);

    expect(times).toEqual(sorted);
  });

  it('sin nada ocupado, nueve días agendables dan ciento veintiséis espacios', () => {
    // 14 espacios por día × 9 días. El décimo día de la ventana es hoy, y hoy
    // queda entero fuera por el aviso mínimo.
    expect(freeSlots(query())).toHaveLength(126);
  });
});

describe('independencia de la zona del servidor', () => {
  it('la misma consulta da lo mismo aunque la política diga otra zona', () => {
    const guayaquil = freeSlots(query());
    const madrid = freeSlots(
      query({ policy: { ...NOCTIS_SCHEDULING, timeZone: 'Europe/Madrid' } }),
    );

    // Mismos espacios en cantidad, pero en instantes distintos: la zona manda.
    expect(madrid).toHaveLength(guayaquil.length);
    expect(madrid[0]?.range.startsAt.toISOString()).not.toBe(
      guayaquil[0]?.range.startsAt.toISOString(),
    );
  });
});
