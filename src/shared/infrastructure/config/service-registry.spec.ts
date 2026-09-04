import { describe, expect, it } from 'vitest';

import type { AppEnvironment } from './environment';
import { createServices, resolveServiceModes } from './service-registry';

/**
 * RN10 es la regla más cara de romper del proyecto: un despliegue que se queda
 * en simulado sin avisar deja al prospecto agendando reuniones que no existen en
 * ningún calendario. Acá se prueba que **no hay forma** de que eso pase.
 */

/**
 * El portafolio va en memoria en las pruebas: el adaptador de SQLite escribe un
 * archivo, y una prueba que toca el disco deja de ser una prueba de esta unidad.
 */
const DEMO: AppEnvironment = {
  MODO_SERVICIOS: 'demo',
  PORTAFOLIO_ADAPTER: 'memoria',
  SQLITE_RUTA: './data/prueba.db',
  MEDIOS_RUTA: './data/medios-prueba',
  BOT_ACTIVO: false,
  AGENDADOR_ACTIVO: true,
};
const SIN_CREDENCIALES: Record<string, string | undefined> = {};

const CREDENCIALES_DE_CALENDARIO = {
  GOOGLE_CALENDAR_ID: 'agenda@noctis.test',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'robot@noctis.test',
  GOOGLE_PRIVATE_KEY: 'clave-de-prueba',
};

describe('selector de adaptadores', () => {
  it('en demo, los cuatro servicios van simulados', () => {
    expect(resolveServiceModes(DEMO)).toEqual({
      calendar: 'fake',
      mail: 'fake',
      chat: 'fake',
      store: 'fake',
    });
  });

  it('en real, los cuatro van reales si no se dice otra cosa', () => {
    expect(resolveServiceModes({ ...DEMO, MODO_SERVICIOS: 'real' })).toEqual({
      calendar: 'real',
      mail: 'real',
      chat: 'real',
      store: 'real',
    });
  });

  it('un selector por servicio manda sobre el global: así se pasa uno a la vez (P12)', () => {
    const modes = resolveServiceModes({
      ...DEMO,
      MODO_SERVICIOS: 'real',
      CORREO_ADAPTER: 'fake',
      CHAT_ADAPTER: 'fake',
    });

    expect(modes).toEqual({ calendar: 'real', mail: 'fake', chat: 'fake', store: 'real' });
  });

  it('el almacén habla en sus propios términos: memoria es simulado, postgres es real', () => {
    expect(resolveServiceModes({ ...DEMO, ALMACEN_ADAPTER: 'memoria' }).store).toBe('fake');
    expect(resolveServiceModes({ ...DEMO, ALMACEN_ADAPTER: 'postgres' }).store).toBe('real');
  });
});

describe('RN10 — jamás se cae a simulado en silencio', () => {
  it('arranca en demo sin una sola credencial', () => {
    const services = createServices(DEMO, SIN_CREDENCIALES);

    expect(services.modes.calendar).toBe('fake');
    expect(services.calendar).toBeDefined();
    expect(services.mail).toBeDefined();
    expect(services.chat).toBeDefined();
  });

  it('con un servicio en real y sin credenciales, no arranca', () => {
    expect(() =>
      createServices({ ...DEMO, CALENDARIO_ADAPTER: 'real' }, SIN_CREDENCIALES),
    ).toThrowError(/no arranca en simulado sin avisar/);
  });

  it('el mensaje nombra las variables que faltan, no dice solo "falta algo"', () => {
    let message = '';
    try {
      createServices({ ...DEMO, CALENDARIO_ADAPTER: 'real' }, SIN_CREDENCIALES);
    } catch (error) {
      message = error instanceof Error ? error.message : '';
    }

    expect(message).toContain('GOOGLE_CALENDAR_ID');
    expect(message).toContain('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    expect(message).toContain('GOOGLE_PRIVATE_KEY');
  });

  it('una credencial vacía cuenta como ausente', () => {
    expect(() =>
      createServices(
        { ...DEMO, CALENDARIO_ADAPTER: 'real' },
        { ...CREDENCIALES_DE_CALENDARIO, GOOGLE_PRIVATE_KEY: '   ' },
      ),
    ).toThrowError(/GOOGLE_PRIVATE_KEY/);
  });

  it('con las credenciales puestas se detiene igual, porque el adaptador real llega en P12', () => {
    expect(() =>
      createServices({ ...DEMO, CALENDARIO_ADAPTER: 'real' }, CREDENCIALES_DE_CALENDARIO),
    ).toThrowError(/todavía no existe/);
  });

  it('el resto sigue simulado mientras uno falla: el fallo es del que se pidió real', () => {
    let message = '';
    try {
      createServices({ ...DEMO, CORREO_ADAPTER: 'real' }, SIN_CREDENCIALES);
    } catch (error) {
      message = error instanceof Error ? error.message : '';
    }

    expect(message).toContain('BREVO_API_KEY');
    expect(message).not.toContain('GOOGLE_CALENDAR_ID');
  });
});
