import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ERROR_CODES } from '@/content/errors';

import { apiError, buildApiErrorBody } from './api-error';

beforeEach(() => {
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('formato único de error', () => {
  it('siempre tiene la misma forma: código, mensaje y correlación', () => {
    const body = buildApiErrorBody(ERROR_CODES.internal, 'corr-1');

    expect(body).toEqual({
      error: {
        code: 'error_interno',
        message: 'Algo falló de nuestro lado. Intente de nuevo en unos minutos.',
        correlationId: 'corr-1',
      },
    });
  });

  it('el mensaje es genérico: sin trazas, rutas ni versiones', async () => {
    const response = apiError({
      code: ERROR_CODES.internal,
      status: 500,
      correlationId: 'corr-1',
    });
    const text = await response.text();

    expect(text).not.toMatch(/at |node_modules|\.ts:|Error:/);
  });

  it('no se guarda en caché ninguna respuesta de error', () => {
    const response = apiError({
      code: ERROR_CODES.tooManyRequests,
      status: 429,
      correlationId: 'corr-1',
    });

    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('deja pasar las cabeceras propias del error, como retry-after', () => {
    const response = apiError({
      code: ERROR_CODES.tooManyRequests,
      status: 429,
      correlationId: 'corr-1',
      headers: { 'retry-after': '30' },
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('30');
  });

  it('registra el error con su correlación y sin dato alguno del visitante', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    apiError({ code: ERROR_CODES.internal, status: 500, correlationId: 'corr-1' });

    const line = String(write.mock.calls[0]?.[0]);
    expect(JSON.parse(line)).toMatchObject({
      level: 'error',
      event: 'api.error',
      correlationId: 'corr-1',
      fields: { code: 'error_interno', status: 500 },
    });
  });
});
