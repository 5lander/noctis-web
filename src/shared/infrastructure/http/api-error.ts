/**
 * Formato único de error de la API.
 *
 * Toda respuesta de error del sistema tiene esta forma y ninguna otra:
 * `{ error: { code, message, correlationId } }`. El mensaje es genérico y sale
 * de `content/`; el detalle vive solo en el registro (CLAUDE.md §3). El
 * identificador de correlación es lo único que une ambas cosas, y no es un dato
 * personal: sirve para que alguien reporte un fallo sin contarnos quién es.
 */

import { ERROR_MESSAGES, type ErrorCode } from '@/content/errors';
import { log } from '@/shared/infrastructure/logging/logger';

export interface ApiErrorBody {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly correlationId: string;
  };
}

export interface ApiErrorInput {
  readonly code: ErrorCode;
  readonly status: number;
  readonly correlationId: string;
  readonly headers?: Readonly<Record<string, string>>;
}

const SERVER_ERROR_STATUS = 500;

export function buildApiErrorBody(code: ErrorCode, correlationId: string): ApiErrorBody {
  return { error: { code, message: ERROR_MESSAGES[code], correlationId } };
}

export function apiError(input: ApiErrorInput): Response {
  log({
    level: input.status >= SERVER_ERROR_STATUS ? 'error' : 'warn',
    event: 'api.error',
    correlationId: input.correlationId,
    fields: { code: input.code, status: input.status },
  });

  return Response.json(buildApiErrorBody(input.code, input.correlationId), {
    status: input.status,
    headers: { 'cache-control': 'no-store', ...input.headers },
  });
}
