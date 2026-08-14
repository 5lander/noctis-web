/**
 * Limitador de peticiones base — ventana fija en memoria.
 *
 * Es la primera capa de SEGURIDAD.md §7 (global por IP). Las capas por sesión y
 * por endpoint sensible llegan con sus endpoints, en P6 y P8.
 *
 * En memoria y no en Redis porque v1 no tiene almacén externo (CLAUDE.md §5) y
 * traer uno para esto sería infraestructura sin usuario. **Consecuencia que hay
 * que tener presente al desplegar**: el conteo es por instancia; con varias
 * réplicas el límite efectivo se multiplica por el número de réplicas. Está
 * anotado en el runbook de despliegue.
 *
 * `now` entra por parámetro: así el comportamiento en el borde de la ventana se
 * prueba con aritmética y no con relojes falsos.
 */

export interface RateLimitRule {
  readonly limit: number;
  readonly windowMs: number;
}

interface RateLimitVerdict {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, now: number): RateLimitVerdict;
}

interface CounterWindow {
  count: number;
  startedAt: number;
}

/** Techo de claves antes de barrer las vencidas: evita que el mapa crezca sin fin. */
const MAX_TRACKED_KEYS = 10_000;
const MILLISECONDS_PER_SECOND = 1000;

function dropExpiredWindows(
  windows: Map<string, CounterWindow>,
  windowMs: number,
  now: number,
): void {
  if (windows.size < MAX_TRACKED_KEYS) return;
  for (const [key, window] of windows) {
    if (now - window.startedAt >= windowMs) windows.delete(key);
  }
}

function secondsUntilReset(window: CounterWindow, windowMs: number, now: number): number {
  const remainingMs = window.startedAt + windowMs - now;
  return Math.max(1, Math.ceil(remainingMs / MILLISECONDS_PER_SECOND));
}

export function createRateLimiter(rule: RateLimitRule): RateLimiter {
  const windows = new Map<string, CounterWindow>();

  return {
    check(key, now) {
      dropExpiredWindows(windows, rule.windowMs, now);

      const current = windows.get(key);
      if (current === undefined || now - current.startedAt >= rule.windowMs) {
        windows.set(key, { count: 1, startedAt: now });
        return { allowed: true, remaining: rule.limit - 1, retryAfterSeconds: 0 };
      }

      current.count += 1;
      const allowed = current.count <= rule.limit;
      return {
        allowed,
        remaining: Math.max(0, rule.limit - current.count),
        retryAfterSeconds: allowed ? 0 : secondsUntilReset(current, rule.windowMs, now),
      };
    },
  };
}
