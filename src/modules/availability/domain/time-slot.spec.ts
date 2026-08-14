import { describe, expect, it } from 'vitest';

import { slotOf } from './time-slot';

const RANGE = {
  startsAt: new Date(Date.UTC(2026, 7, 18, 14, 0)),
  endsAt: new Date(Date.UTC(2026, 7, 18, 14, 20)),
};

describe('espacio agendable', () => {
  it('el identificador sale del instante de inicio, así que es estable', () => {
    expect(slotOf(RANGE).id).toBe(slotOf(RANGE).id);
  });

  it('dos espacios distintos tienen identificadores distintos', () => {
    const later = {
      startsAt: new Date(Date.UTC(2026, 7, 18, 14, 30)),
      endsAt: new Date(Date.UTC(2026, 7, 18, 14, 50)),
    };

    expect(slotOf(RANGE).id).not.toBe(slotOf(later).id);
  });

  it('conserva el intervalo tal cual se lo dieron', () => {
    expect(slotOf(RANGE).range).toEqual(RANGE);
  });
});
