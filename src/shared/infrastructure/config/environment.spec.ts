import { describe, expect, it } from 'vitest';

import { ConfigurationError, readEnvironment } from './environment';

describe('entorno validado por esquema', () => {
  it('arranca en demo sin una sola variable puesta', () => {
    expect(readEnvironment({})).toEqual({
      MODO_SERVICIOS: 'demo',
      // El portafolio arranca en SQLite y con rutas por omisión: el sitio se
      // clona y corre sin que nadie configure nada, que es la condición que
      // este archivo entero defiende.
      PORTAFOLIO_ADAPTER: 'sqlite',
      SQLITE_RUTA: './data/noctis.db',
      MEDIOS_RUTA: './data/medios',
      BOT_ACTIVO: false,
      AGENDADOR_ACTIVO: true,
    });
  });

  it('acepta los selectores por servicio de BUILD.md §2', () => {
    const environment = readEnvironment({
      MODO_SERVICIOS: 'real',
      CALENDARIO_ADAPTER: 'real',
      CORREO_ADAPTER: 'fake',
      CHAT_ADAPTER: 'fake',
      ALMACEN_ADAPTER: 'memoria',
    });

    expect(environment.MODO_SERVICIOS).toBe('real');
    expect(environment.CALENDARIO_ADAPTER).toBe('real');
    expect(environment.CORREO_ADAPTER).toBe('fake');
  });

  it('lee los interruptores como booleanos, no como texto', () => {
    const environment = readEnvironment({ BOT_ACTIVO: 'true', AGENDADOR_ACTIVO: 'false' });

    expect(environment.BOT_ACTIVO).toBe(true);
    expect(environment.AGENDADOR_ACTIVO).toBe(false);
  });

  it('rechaza un modo de servicios inventado y dice cuál es la variable', () => {
    expect(() => readEnvironment({ MODO_SERVICIOS: 'produccion' })).toThrowError(
      ConfigurationError,
    );
    expect(() => readEnvironment({ MODO_SERVICIOS: 'produccion' })).toThrowError(/MODO_SERVICIOS/);
  });

  it('rechaza un selector de adaptador inventado', () => {
    expect(() => readEnvironment({ CALENDARIO_ADAPTER: 'google' })).toThrowError(
      /CALENDARIO_ADAPTER/,
    );
  });

  it('rechaza un interruptor que no sea true o false', () => {
    expect(() => readEnvironment({ BOT_ACTIVO: 'si' })).toThrowError(/BOT_ACTIVO/);
  });

  it('ignora las demás variables del proceso en vez de romperse con ellas', () => {
    const environment = readEnvironment({ PATH: '/usr/bin', HOME: '/home/lander' });

    expect(environment.MODO_SERVICIOS).toBe('demo');
  });
});
