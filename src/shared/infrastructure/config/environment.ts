/**
 * Entorno validado por esquema — el único punto donde `process.env` se lee.
 *
 * Se valida al cargar el módulo, no al usarlo: si la configuración está mal, la
 * aplicación no arranca en vez de fallar en la cara de un visitante a las tres
 * de la tarde. RN10 —con `MODO_SERVICIOS=real` una credencial ausente impide el
 * arranque y se nombra cuál falta— se completa en P4, cuando existan
 * credenciales que exigir; el esquema y el mensaje ya están puestos para eso.
 */

import { z } from 'zod';

const SERVICE_MODES = ['demo', 'real'] as const;
const ADAPTER_MODES = ['fake', 'real'] as const;
const STORE_MODES = ['memoria', 'postgres'] as const;

const flag = z.enum(['true', 'false']).transform((value) => value === 'true');

const environmentSchema = z.object({
  MODO_SERVICIOS: z.enum(SERVICE_MODES).default('demo'),
  CALENDARIO_ADAPTER: z.enum(ADAPTER_MODES).optional(),
  CORREO_ADAPTER: z.enum(ADAPTER_MODES).optional(),
  CHAT_ADAPTER: z.enum(ADAPTER_MODES).optional(),
  ALMACEN_ADAPTER: z.enum(STORE_MODES).optional(),
  BOT_ACTIVO: flag.default(false),
  AGENDADOR_ACTIVO: flag.default(true),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

function describeIssues(error: z.ZodError): string {
  const details = error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(' · ');
  return `Configuración inválida. Revise estas variables de entorno — ${details}`;
}

export function readEnvironment(source: Record<string, string | undefined>): AppEnvironment {
  const result = environmentSchema.safeParse(source);
  if (!result.success) throw new ConfigurationError(describeIssues(result.error));
  return result.data;
}

export const environment: AppEnvironment = readEnvironment(process.env);
