import { describe, expect, it } from 'vitest';

import { HEALTHY_AND_INSTANT } from '@/shared/infrastructure/fakes/fake-behaviour';

import { FakeCalendar, SlotAlreadyTakenError } from './fake-calendar';

/** Lunes 17 a viernes 21 de agosto de 2026, más el fin de semana siguiente. */
const WEEK = {
  startsAt: new Date(Date.UTC(2026, 7, 17, 0, 0)),
  endsAt: new Date(Date.UTC(2026, 7, 24, 0, 0)),
};

function calendar() {
  return new FakeCalendar(HEALTHY_AND_INSTANT);
}

function slot(day: number, hour: number) {
  return {
    startsAt: new Date(Date.UTC(2026, 7, day, hour, 0)),
    endsAt: new Date(Date.UTC(2026, 7, day, hour + 1, 0)),
  };
}

describe('calendario simulado', () => {
  it('devuelve los mismos bloques ocupados en cada llamada', async () => {
    const first = await calendar().busyRanges(WEEK);
    const second = await calendar().busyRanges(WEEK);

    expect(first).toEqual(second);
  });

  it('no ocupa sábados ni domingos', async () => {
    const busy = await calendar().busyRanges(WEEK);
    const weekdays = busy.map((range) => range.startsAt.getUTCDay());

    expect(weekdays).not.toContain(0);
    expect(weekdays).not.toContain(6);
  });

  it('RN1 — un bloque ocupado es solo un intervalo: ni título, ni asistentes, ni notas', async () => {
    const busy = await calendar().busyRanges(WEEK);

    for (const range of busy) {
      expect(Object.keys(range).sort()).toEqual(['endsAt', 'startsAt']);
    }
  });

  it('crea un evento en un espacio libre y devuelve enlace de reunión', async () => {
    const created = await calendar().createEvent({
      range: slot(18, 9),
      title: 'Reunión de prueba',
      attendeeEmail: 'ana@ejemplo.ec',
    });

    expect(created.eventId).not.toBe('');
    expect(created.meetingUrl).not.toBe('');
  });

  it('rechaza crear sobre un bloque que ya estaba ocupado', async () => {
    await expect(
      calendar().createEvent({
        range: slot(18, 11),
        title: 'Choca con el bloque sembrado',
        attendeeEmail: 'ana@ejemplo.ec',
      }),
    ).rejects.toThrowError(SlotAlreadyTakenError);
  });

  it('RN2 — el segundo intento sobre el mismo espacio se rechaza', async () => {
    const agenda = calendar();
    const request = { range: slot(18, 9), title: 'Primera', attendeeEmail: 'ana@ejemplo.ec' };

    await agenda.createEvent(request);

    await expect(
      agenda.createEvent({ ...request, title: 'Segunda', attendeeEmail: 'luis@ejemplo.ec' }),
    ).rejects.toThrowError(SlotAlreadyTakenError);
  });

  it('lo creado aparece como ocupado en la siguiente consulta', async () => {
    const agenda = calendar();
    const before = await agenda.busyRanges(WEEK);

    await agenda.createEvent({
      range: slot(18, 9),
      title: 'Reunión',
      attendeeEmail: 'ana@ejemplo.ec',
    });

    expect((await agenda.busyRanges(WEEK)).length).toBe(before.length + 1);
  });

  it('se puede pedir que el servicio esté caído, para construir los estados de error', async () => {
    const caido = new FakeCalendar({ latencyMs: 0, fault: 'unavailable' });

    await expect(caido.busyRanges(WEEK)).rejects.toThrowError(/no disponible/);
  });
});
