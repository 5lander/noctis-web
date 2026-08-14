/**
 * `GET /api/estado` — el punto donde se comprueba que la aplicación levantó y
 * con qué modo de servicios.
 *
 * Existe desde P0 por una razón operativa concreta: es la verificación que
 * atrapa un despliegue que se quedó en `demo` sin que nadie se diera cuenta,
 * que es exactamente el desastre invisible que prohíbe RN10. Devuelve el modo y
 * nada más: ni versiones, ni credenciales, ni configuración.
 *
 * De paso ejerce toda la infraestructura de P0 — entorno validado, límite por
 * origen, formato único de error y registro con correlación.
 */

import { ERROR_CODES } from '@/content/errors';
import { environment } from '@/shared/infrastructure/config/environment';
import { apiError } from '@/shared/infrastructure/http/api-error';
import { readClientKey } from '@/shared/infrastructure/http/client-ip';
import { createRateLimiter } from '@/shared/infrastructure/http/rate-limit';
import { readCorrelationId } from '@/shared/infrastructure/logging/correlation-id';
import { describeError } from '@/shared/infrastructure/logging/describe-error';
import { log } from '@/shared/infrastructure/logging/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT = { limit: 30, windowMs: 60_000 } as const;
const TOO_MANY_REQUESTS = 429;
const INTERNAL_ERROR = 500;
const ROUTE = '/api/estado';

const limiter = createRateLimiter(RATE_LIMIT);

function okResponse(): Response {
  return Response.json(
    { estado: 'ok', modo: environment.MODO_SERVICIOS },
    { headers: { 'cache-control': 'no-store' } },
  );
}

export function GET(request: Request): Response {
  const correlationId = readCorrelationId(request.headers);

  try {
    const verdict = limiter.check(readClientKey(request.headers), Date.now());
    if (!verdict.allowed) {
      return apiError({
        code: ERROR_CODES.tooManyRequests,
        status: TOO_MANY_REQUESTS,
        correlationId,
        headers: { 'retry-after': String(verdict.retryAfterSeconds) },
      });
    }

    return okResponse();
  } catch (error) {
    log({
      level: 'error',
      event: 'health_check.failed',
      correlationId,
      fields: { route: ROUTE, ...describeError(error) },
    });
    return apiError({ code: ERROR_CODES.internal, status: INTERNAL_ERROR, correlationId });
  }
}
