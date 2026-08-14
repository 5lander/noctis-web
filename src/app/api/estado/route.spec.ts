import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

const URL_ESTADO = 'https://noctis.test/api/estado';

function request(clientIp: string): Request {
  return new Request(URL_ESTADO, { headers: { 'x-forwarded-for': clientIp } });
}

beforeEach(() => {
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/estado', () => {
  it('responde que está en pie y con qué modo, sin credencial alguna configurada', async () => {
    const response = GET(request('190.0.0.1'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ estado: 'ok', modo: 'demo' });
  });

  it('no se guarda en caché', () => {
    expect(GET(request('190.0.0.2')).headers.get('cache-control')).toBe('no-store');
  });

  it('no filtra nada más que el estado y el modo', async () => {
    const body = (await GET(request('190.0.0.3')).json()) as Record<string, unknown>;

    expect(Object.keys(body).sort()).toEqual(['estado', 'modo']);
  });

  it('corta al pasarse del límite y responde con el formato único de error', async () => {
    const ip = '190.0.0.9';
    let response = GET(request(ip));
    for (let i = 0; i < 30; i += 1) response = GET(request(ip));

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).not.toBeNull();
    expect(await response.json()).toMatchObject({
      error: { code: 'demasiadas_peticiones' },
    });
  });

  it('el límite es por origen: uno abusivo no tumba al resto', () => {
    const abusiva = '190.0.0.10';
    for (let i = 0; i < 40; i += 1) GET(request(abusiva));

    expect(GET(request('190.0.0.11')).status).toBe(200);
  });
});
