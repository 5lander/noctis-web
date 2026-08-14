import { describe, expect, it } from 'vitest';

import { parseHexColor } from './brand-colors';

/**
 * El shader del cielo (RA-07) recibe números, no cadenas, y esos números salen
 * de `tokens.css`. Si la conversión se equivoca, no falla nada: el cielo sale de
 * otro color y nadie se entera hasta verlo. Por eso se prueba la conversión, que
 * es la única parte del WebGL que puede equivocarse en silencio.
 */

describe('parseHexColor', () => {
  it('convierte el índigo de la marca a componentes de 0 a 1', () => {
    const { red, green, blue } = parseHexColor('#3730A3');

    expect(red).toBeCloseTo(0x37 / 255);
    expect(green).toBeCloseTo(0x30 / 255);
    expect(blue).toBeCloseTo(0xa3 / 255);
  });

  it('acepta el valor con espacios, que es como lo devuelve getComputedStyle', () => {
    expect(parseHexColor('  #C4B5FD  ')).toEqual(parseHexColor('#c4b5fd'));
  });

  it('entiende la forma corta de tres dígitos', () => {
    expect(parseHexColor('#abc')).toEqual(parseHexColor('#aabbcc'));
  });

  it('no distingue mayúsculas de minúsculas', () => {
    expect(parseHexColor('#0A0A12')).toEqual(parseHexColor('#0a0a12'));
  });

  it('devuelve negro ante algo que no es hexadecimal, en vez de NaN', () => {
    const black = { red: 0, green: 0, blue: 0 };

    expect(parseHexColor('rgb(10, 10, 18)')).toEqual(black);
    expect(parseHexColor('')).toEqual(black);
    expect(parseHexColor('#zzzzzz')).toEqual(black);
  });
});
