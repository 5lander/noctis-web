/**
 * `POST /api/contacto` — el formulario del sitio, conectado.
 *
 * Es el paquete P10 del plan y cierra el único hueco funcional que quedaba en la
 * página: hasta hoy el formulario apuntaba acá y acá no había nada, así que el
 * visitante que decidía escribir se llevaba un 404. En un sitio cuyo producto
 * declarado es la credibilidad demostrada, eso era lo más caro que había roto.
 *
 * Lo que hace, en orden: limita por origen, acota el cuerpo, lo interpreta como
 * dato y nunca como instrucción, deja pasar el veredicto de la capa de
 * aplicación y solo entonces manda el aviso. La regla de negocio no vive acá:
 * está en `modules/lead`, y por eso se prueba sin servidor.
 *
 * **Contesta de dos formas según quién pregunte.** A la petición con
 * JavaScript le devuelve JSON, que es lo que permite la confirmación en pantalla
 * sin recargar. Al envío nativo de un `<form>` le devuelve una redirección de
 * vuelta a la página con el resultado en la URL: sin eso, quien tenga el
 * JavaScript caído vería el JSON crudo en una pantalla blanca.
 */

import { ERROR_CODES, type ErrorCode } from '@/content/errors';
import { IDENTITY } from '@/content/site';
import { judgeContactSubmission } from '@/modules/lead/application/contact-submission';
import { NotifyLead } from '@/modules/lead/application/notify-lead';
import { services } from '@/shared/infrastructure/config/service-registry';
import { apiError } from '@/shared/infrastructure/http/api-error';
import { readClientKey } from '@/shared/infrastructure/http/client-ip';
import { redirectTargetFor, type SentOutcome } from '@/shared/infrastructure/http/contact-redirect';
import { createRateLimiter } from '@/shared/infrastructure/http/rate-limit';
import { readCorrelationId } from '@/shared/infrastructure/logging/correlation-id';
import { describeError } from '@/shared/infrastructure/logging/describe-error';
import { log } from '@/shared/infrastructure/logging/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cinco envíos por cuarto de hora desde el mismo origen. Es holgado para quien
 * se equivocó y volvió a intentar, y estrecho para quien está probando el
 * formulario con un guion. A diferencia de la trampa y del control de prisa,
 * este límite no depende de nada que mande el navegador.
 */
const RATE_LIMIT = { limit: 5, windowMs: 900_000 } as const;

/**
 * Techo del cuerpo. Los topes por campo ya están en el dominio; esto ataja el
 * envío enorme **antes** de interpretarlo, que es donde costaría memoria.
 */
const MAX_BODY_BYTES = 16_384;

const BAD_REQUEST = 400;
const PAYLOAD_TOO_LARGE = 413;
const TOO_MANY_REQUESTS = 429;
const INTERNAL_ERROR = 500;
const SEE_OTHER = 303;
const ROUTE = '/api/contacto';

const limiter = createRateLimiter(RATE_LIMIT);
const notifyLead = new NotifyLead(services.mail, IDENTITY.email);

/** El envío nativo de un `<form>` no pide JSON; el `fetch` del formulario sí. */
function wantsJson(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('application/json');
}

function redirect(outcome: SentOutcome): Response {
  return new Response(null, {
    status: SEE_OTHER,
    headers: { location: redirectTargetFor(outcome), 'cache-control': 'no-store' },
  });
}

/**
 * La misma respuesta para el envío aceptado y para el que olía a robot.
 *
 * Es deliberado: contarle al automatismo que se le detectó la trampa es
 * regalarle exactamente el dato que necesita para ajustarla. El humano ve que
 * llegó, el robot también, y solo uno de los dos generó un correo.
 */
function accepted(request: Request): Response {
  return wantsJson(request)
    ? Response.json({ estado: 'recibido' }, { headers: { 'cache-control': 'no-store' } })
    : redirect('ok');
}

/**
 * El fallo entra como un objeto y no como tres argumentos sueltos: `max-params`
 * son tres, y de todas formas `apiError` ya pide exactamente esta forma.
 */
interface Failure {
  readonly code: ErrorCode;
  readonly status: number;
  readonly correlationId: string;
}

function failure(request: Request, detail: Failure): Response {
  return wantsJson(request) ? apiError(detail) : redirect('failed');
}

/**
 * De cuerpo crudo a algo que zod pueda mirar. Nunca lanza: un cuerpo ilegible es
 * un envío malformado, no un fallo del servidor.
 */
function parseBody(raw: string, contentType: string): unknown {
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

function isOversized(request: Request, raw: string): boolean {
  const declared = Number(request.headers.get('content-length') ?? '0');
  return declared > MAX_BODY_BYTES || raw.length > MAX_BODY_BYTES;
}

async function handleSubmission(request: Request, correlationId: string): Promise<Response> {
  const raw = await request.text();
  if (isOversized(request, raw)) {
    return failure(request, {
      code: ERROR_CODES.invalidSubmission,
      status: PAYLOAD_TOO_LARGE,
      correlationId,
    });
  }

  const body = parseBody(raw, request.headers.get('content-type') ?? '');
  const verdict = judgeContactSubmission(body, new Date().toISOString());

  if (verdict.outcome === 'spam') {
    log({ level: 'info', event: 'lead.discarded', correlationId, fields: { by: verdict.signal } });
    return accepted(request);
  }

  if (verdict.outcome !== 'accepted') {
    const problem = verdict.outcome === 'malformed' ? 'malformed' : verdict.problem;
    log({ level: 'warn', event: 'lead.rejected', correlationId, fields: { problem } });
    return failure(request, {
      code: ERROR_CODES.invalidSubmission,
      status: BAD_REQUEST,
      correlationId,
    });
  }

  // Del registro sale que llegó una ficha y nada de lo que dice: RN12 no admite
  // datos personales en los registros, y una ficha de contacto es toda dato
  // personal. Para leerla está el correo.
  await notifyLead.run(verdict.lead);
  log({ level: 'info', event: 'lead.notified', correlationId, fields: { route: ROUTE } });
  return accepted(request);
}

export async function POST(request: Request): Promise<Response> {
  const correlationId = readCorrelationId(request.headers);

  try {
    const verdict = limiter.check(readClientKey(request.headers), Date.now());
    if (!verdict.allowed) {
      return wantsJson(request)
        ? apiError({
            code: ERROR_CODES.tooManyRequests,
            status: TOO_MANY_REQUESTS,
            correlationId,
            headers: { 'retry-after': String(verdict.retryAfterSeconds) },
          })
        : redirect('failed');
    }

    return await handleSubmission(request, correlationId);
  } catch (error) {
    log({
      level: 'error',
      event: 'lead.failed',
      correlationId,
      fields: { route: ROUTE, ...describeError(error) },
    });
    return failure(request, {
      code: ERROR_CODES.internal,
      status: INTERNAL_ERROR,
      correlationId,
    });
  }
}
