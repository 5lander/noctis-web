import type { CalendarPort } from '@/modules/availability/application/ports/calendar-port';
import { FakeCalendar } from '@/modules/availability/infrastructure/fake-calendar';
import type { ChatPort } from '@/modules/chat/application/ports/chat-port';
import { FakeChat } from '@/modules/chat/infrastructure/fake-chat';
import type { MailPort } from '@/modules/lead/application/ports/mail-port';
import { FakeMail } from '@/modules/lead/infrastructure/fake-mail';
import type { PortfolioRepositoryPort } from '@/modules/portfolio/application/ports/portfolio-repository-port';
import { MemoryPortfolioRepository } from '@/modules/portfolio/infrastructure/memory-portfolio-repository';
import { SqlitePortfolioRepository } from '@/modules/portfolio/infrastructure/sqlite-portfolio-repository';
import type { StorePort } from '@/shared/application/ports/store-port';
import { MemoryStore } from '@/shared/infrastructure/store/memory-store';

import { assertCredentialsFor, type ServiceName } from './credentials';
import { environment, environmentSource, type AppEnvironment } from './environment';

/**
 * El selector de `BUILD.md` §2: qué implementación se inyecta.
 *
 * Una sola variable decide el modo global, y cada servicio puede sobrescribirla.
 * Eso es lo que permite pasar a real **un servicio a la vez** en P12, con los
 * demás simulados mientras tanto.
 *
 * Pedir un servicio en `real` hace dos cosas, en este orden: exige sus
 * credenciales —y si falta una, la aplicación no arranca y dice cuál (RN10)— y
 * después busca el adaptador real. Los reales llegan en P12; hasta entonces
 * pedir `real` falla con un mensaje que lo dice. **Lo que no pasa nunca es que
 * se caiga a simulado en silencio.**
 */

type AdapterMode = 'fake' | 'real';

export interface ServiceModes {
  readonly calendar: AdapterMode;
  readonly mail: AdapterMode;
  readonly chat: AdapterMode;
  readonly store: AdapterMode;
}

class RealAdapterNotBuiltError extends Error {
  constructor(service: ServiceName) {
    super(
      `El adaptador real de "${service}" todavía no existe: se conecta en P12. ` +
        `Sus credenciales están puestas, así que el sistema se detiene en vez de ` +
        `usar el simulado sin avisar (RN10).`,
    );
    this.name = 'RealAdapterNotBuiltError';
  }
}

function fromGlobal(mode: AppEnvironment['MODO_SERVICIOS']): AdapterMode {
  return mode === 'real' ? 'real' : 'fake';
}

export function resolveServiceModes(source: AppEnvironment): ServiceModes {
  const fallback = fromGlobal(source.MODO_SERVICIOS);
  return {
    calendar: source.CALENDARIO_ADAPTER ?? fallback,
    mail: source.CORREO_ADAPTER ?? fallback,
    chat: source.CHAT_ADAPTER ?? fallback,
    store: storeModeOf(source.ALMACEN_ADAPTER, fallback),
  };
}

function storeModeOf(
  override: AppEnvironment['ALMACEN_ADAPTER'],
  fallback: AdapterMode,
): AdapterMode {
  if (override === undefined) return fallback;
  return override === 'postgres' ? 'real' : 'fake';
}

type CredentialSource = Record<string, string | undefined>;

/** Un servicio en real exige credenciales antes que nada. */
function guardReal(service: ServiceName, mode: AdapterMode, credentials: CredentialSource): void {
  if (mode === 'fake') return;
  assertCredentialsFor(service, credentials);
  throw new RealAdapterNotBuiltError(service);
}

export interface Services {
  readonly modes: ServiceModes;
  readonly calendar: CalendarPort;
  readonly mail: MailPort;
  readonly chat: ChatPort;
  /**
   * El portafolio no pasa por `guardReal`: su adaptador real **ya existe**, así
   * que no hay nada que diferir a P12 ni credencial que exigir. Pedirle SQLite
   * en un entorno sin disco escribible falla al primer uso con el error del
   * sistema de archivos, que dice exactamente qué pasó.
   */
  readonly portfolio: PortfolioRepositoryPort;
  createStore<T>(): StorePort<T>;
}

function createPortfolio(source: AppEnvironment): PortfolioRepositoryPort {
  if (source.PORTAFOLIO_ADAPTER === 'memoria') return new MemoryPortfolioRepository();
  return new SqlitePortfolioRepository(source.SQLITE_RUTA);
}

export function createServices(source: AppEnvironment, credentials: CredentialSource): Services {
  const modes = resolveServiceModes(source);

  guardReal('calendar', modes.calendar, credentials);
  guardReal('mail', modes.mail, credentials);
  guardReal('chat', modes.chat, credentials);
  guardReal('store', modes.store, credentials);

  return {
    modes,
    calendar: new FakeCalendar(),
    mail: new FakeMail(),
    chat: new FakeChat(),
    portfolio: createPortfolio(source),
    createStore: <T>(): StorePort<T> => new MemoryStore<T>(),
  };
}

/**
 * Se compone al cargar el módulo, no al primer uso: si la configuración exige un
 * servicio real sin credenciales, la aplicación tiene que caerse al arrancar y
 * no en la cara del primer visitante.
 */
export const services: Services = createServices(environment, environmentSource);
