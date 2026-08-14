import { describe, expect, it } from 'vitest';

import { CORRELATION_HEADER, createCorrelationId, readCorrelationId } from './correlation-id';

describe('identificador de correlación', () => {
  it('genera identificadores distintos en cada llamada', () => {
    expect(createCorrelationId()).not.toBe(createCorrelationId());
  });

  it('lee el que puso el middleware', () => {
    const headers = new Headers({ [CORRELATION_HEADER]: 'el-de-la-peticion' });

    expect(readCorrelationId(headers)).toBe('el-de-la-peticion');
  });

  it('genera uno si la petición no pasó por el middleware', () => {
    expect(readCorrelationId(new Headers())).not.toBe('');
  });

  it('genera uno si la cabecera llega vacía', () => {
    const headers = new Headers({ [CORRELATION_HEADER]: '' });

    expect(readCorrelationId(headers)).not.toBe('');
  });
});
