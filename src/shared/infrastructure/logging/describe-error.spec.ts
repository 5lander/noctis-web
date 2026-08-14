import { describe, expect, it } from 'vitest';

import { describeError } from './describe-error';

describe('descripción de errores para el registro', () => {
  it('toma nombre y mensaje de un Error', () => {
    expect(describeError(new TypeError('sin función'))).toEqual({
      errorName: 'TypeError',
      errorMessage: 'sin función',
    });
  });

  it('no se rompe con algo que no es un Error', () => {
    expect(describeError('se lanzó un texto')).toEqual({
      errorName: 'ErrorDesconocido',
      errorMessage: 'se lanzó un texto',
    });
  });

  it('nunca devuelve la traza', () => {
    const described = describeError(new Error('falló'));

    expect(Object.keys(described)).toEqual(['errorName', 'errorMessage']);
  });
});
