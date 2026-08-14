/**
 * Registro estructurado en JSON, una línea por evento, hacia la salida estándar.
 *
 * Es propio y no una dependencia porque son sesenta líneas y OPTIMIZACION.md §1
 * prohíbe traer un paquete para eso. A cambio hace dos cosas que un logger
 * genérico no hace solo:
 *
 * 1. **RN12 — ningún dato personal en los registros.** La lista de campos
 *    prohibidos se aplica por nombre, no por criterio de quien escribe: si
 *    mañana alguien registra `{ email }` en un descuido, sale `[redactado]`.
 * 2. **Inyección en el registro** (SEGURIDAD.md §1.2): todo texto pierde saltos
 *    de línea y caracteres de control, así nadie forja una entrada falsa
 *    escribiendo un salto de línea en un formulario.
 *
 * Corre en el runtime de Node (route handlers), no en el middleware.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogValue = string | number | boolean | null;
type LogFields = Readonly<Record<string, LogValue>>;

export interface LogEntry {
  readonly level: LogLevel;
  readonly event: string;
  readonly correlationId: string;
  readonly fields?: LogFields;
}

const REDACTED = '[redactado]';
const REPLACEMENT = ' ';
const MAX_VALUE_LENGTH = 512;
const FIRST_PRINTABLE_CODE_POINT = 0x20;
const DELETE_CODE_POINT = 0x7f;

/**
 * Coincidencia exacta y no por subcadena: así `errorMessage` sigue siendo
 * registrable y `message` no. Una lista difusa termina redactando lo útil y
 * enseñando a la gente a esquivarla.
 */
const PERSONAL_FIELD_NAMES: ReadonlySet<string> = new Set([
  'nombre',
  'name',
  'apellido',
  'correo',
  'email',
  'telefono',
  'phone',
  'whatsapp',
  'mensaje',
  'message',
  'texto',
  'comentario',
  'transcripcion',
  'transcript',
  'contacto',
  'contact',
  'direccion',
  'address',
  'cedula',
  'ruc',
  'ip',
  'password',
  'clave',
  'secret',
  'token',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
]);

function isControlCharacter(character: string): boolean {
  const codePoint = character.codePointAt(0) ?? 0;
  return codePoint < FIRST_PRINTABLE_CODE_POINT || codePoint === DELETE_CODE_POINT;
}

function sanitizeText(value: string): string {
  const truncated = value.slice(0, MAX_VALUE_LENGTH);
  return Array.from(truncated, (character) =>
    isControlCharacter(character) ? REPLACEMENT : character,
  ).join('');
}

function sanitizeValue(key: string, value: LogValue): LogValue {
  if (PERSONAL_FIELD_NAMES.has(key.toLowerCase())) return REDACTED;
  return typeof value === 'string' ? sanitizeText(value) : value;
}

function sanitizeFields(fields: LogFields): Record<string, LogValue> {
  const safe: Record<string, LogValue> = {};
  for (const [key, value] of Object.entries(fields)) {
    safe[sanitizeText(key)] = sanitizeValue(key, value);
  }
  return safe;
}

/** Parte pura y verificable del registro: la fecha entra, no se lee del reloj. */
export function formatLogEntry(entry: LogEntry, at: string): string {
  return JSON.stringify({
    at,
    level: entry.level,
    event: sanitizeText(entry.event),
    correlationId: sanitizeText(entry.correlationId),
    fields: sanitizeFields(entry.fields ?? {}),
  });
}

export function log(entry: LogEntry): void {
  process.stdout.write(`${formatLogEntry(entry, new Date().toISOString())}\n`);
}
