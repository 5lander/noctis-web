import { describe, expect, it } from 'vitest';

import { readClientKey } from './client-ip';

describe('clave de origen para el limitador', () => {
  it('toma la primera dirección de la cadena de proxies', () => {
    const headers = new Headers({ 'x-forwarded-for': '190.0.0.1, 10.0.0.7, 10.0.0.8' });

    expect(readClientKey(headers)).toBe('190.0.0.1');
  });

  it('funciona con una sola dirección', () => {
    expect(readClientKey(new Headers({ 'x-forwarded-for': '190.0.0.1' }))).toBe('190.0.0.1');
  });

  it('usa una clave común cuando no hay cabecera', () => {
    expect(readClientKey(new Headers())).toBe('origen-desconocido');
  });

  it('usa la clave común si la cabecera llega vacía', () => {
    expect(readClientKey(new Headers({ 'x-forwarded-for': '   ' }))).toBe('origen-desconocido');
  });
});
