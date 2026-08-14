import { describe, expect, it } from 'vitest';

import { durationInMinutes, isValidRange, overlaps } from './time-range';

function range(startHour: number, endHour: number) {
  return {
    startsAt: new Date(Date.UTC(2026, 7, 20, startHour, 0)),
    endsAt: new Date(Date.UTC(2026, 7, 20, endHour, 0)),
  };
}

describe('intervalo de tiempo', () => {
  it('es válido si empieza antes de terminar', () => {
    expect(isValidRange(range(9, 10))).toBe(true);
    expect(isValidRange(range(10, 9))).toBe(false);
    expect(isValidRange(range(9, 9))).toBe(false);
  });

  it('detecta el solape en cualquier dirección', () => {
    expect(overlaps(range(9, 11), range(10, 12))).toBe(true);
    expect(overlaps(range(10, 12), range(9, 11))).toBe(true);
    expect(overlaps(range(9, 12), range(10, 11))).toBe(true);
  });

  it('tocarse en el borde no es solaparse', () => {
    expect(overlaps(range(9, 10), range(10, 11))).toBe(false);
    expect(overlaps(range(10, 11), range(9, 10))).toBe(false);
  });

  it('no se solapan los que no se tocan', () => {
    expect(overlaps(range(9, 10), range(14, 15))).toBe(false);
  });

  it('mide la duración en minutos', () => {
    expect(durationInMinutes(range(9, 10))).toBe(60);
  });
});
