/**
 * La ficha del prospecto: lo que alguien escribe en el formulario de contacto.
 *
 * Es dominio puro y no importa nada —ni zod, ni Node, ni React—, así que se
 * prueba con objetos en memoria y sin levantar un servidor. La traducción desde
 * un cuerpo HTTP vive en la capa de aplicación, que es donde puede usar zod.
 *
 * **La regla que manda acá es RN7**: solo se notifica si la ficha tiene al menos
 * un canal de contacto válido. No es una validación de formulario, es una
 * decisión de negocio: un correo por cada curioso que tocó «enviar» sin dejar
 * cómo responderle convierte la bandeja en ruido, y una bandeja ruidosa se deja
 * de mirar. El día que se deja de mirar, el módulo está muerto aunque funcione.
 */

/**
 * Topes de largo por campo.
 *
 * Existen por dos motivos distintos y los dos importan. El primero es de
 * seguridad: un cuerpo sin tope es una forma barata de tumbar el proceso
 * (SEGURIDAD.md §7). El segundo es de producto: un mensaje de dos mil caracteres
 * ya no es una consulta, y recortarlo en silencio sería peor que rechazarlo.
 */
export const LEAD_LIMITS = {
  name: 80,
  business: 80,
  email: 160,
  whatsapp: 30,
  interest: 80,
  message: 2000,
} as const;

/** Interno: solo existe para escribir `LeadDraft` y recorrer los topes. */
type LeadField = keyof typeof LEAD_LIMITS;

/** Lo que llega del formulario: todo texto, porque de un formulario no sale otra cosa. */
export type LeadDraft = Readonly<Record<LeadField, string>>;

/**
 * La ficha ya validada. Los campos que el visitante puede dejar vacíos son
 * `null` y no cadena vacía: `null` dice «no lo dio», `''` no dice nada.
 */
export interface Lead {
  readonly name: string;
  readonly business: string | null;
  readonly email: string | null;
  readonly whatsapp: string | null;
  readonly interest: string | null;
  readonly message: string | null;
  readonly receivedAt: string;
}

/**
 * Por qué se rechazó una ficha.
 *
 * Son códigos y no frases porque esto va al registro, no a la pantalla: el
 * visitante ve un mensaje genérico de `content/errors.ts` y el detalle se queda
 * del lado del servidor (CLAUDE.md §3). Ninguno de estos valores contiene un
 * dato personal, que es lo que exige RN12.
 */
export type LeadProblem =
  | 'sin_nombre'
  | 'sin_canal_de_contacto'
  | 'correo_invalido'
  | 'campo_demasiado_largo';

export type LeadResult =
  | { readonly ok: true; readonly lead: Lead }
  | { readonly ok: false; readonly problem: LeadProblem };

/**
 * Comprobación de correo deliberadamente floja: algo, arroba, algo, punto, algo,
 * sin espacios. La estricta es imposible —la gramática real de una dirección
 * admite cosas que ningún patrón corto cubre— y de todas formas lo único que
 * prueba que un correo existe es escribirle. Acá solo se atajan los errores de
 * dedo, que es para lo que sirve.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Un número de contacto ecuatoriano tiene nueve o diez dígitos; con prefijo
 * internacional llega a doce. Se cuentan dígitos y no caracteres porque la gente
 * escribe `098 010 5699`, `0980105699` y `+593 98 010 5699` para decir lo mismo.
 */
const MIN_PHONE_DIGITS = 7;
const NOT_DIGITS = /\D/g;

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

function isUsablePhone(value: string): boolean {
  return value.replace(NOT_DIGITS, '').length >= MIN_PHONE_DIGITS;
}

/** RN7 en una función: ¿hay por dónde contestarle a esta persona? */
export function hasValidContact(draft: LeadDraft): boolean {
  return isValidEmail(draft.email.trim()) || isUsablePhone(draft.whatsapp.trim());
}

function firstTooLongField(draft: LeadDraft): LeadField | null {
  for (const field of Object.keys(LEAD_LIMITS) as readonly LeadField[]) {
    if (draft[field].trim().length > LEAD_LIMITS[field]) return field;
  }
  return null;
}

function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * De borrador a ficha, o el motivo por el que no.
 *
 * El orden de las comprobaciones no es casual: primero el largo, porque un campo
 * desbordado es la señal de un envío automático y no vale la pena mirarle nada
 * más; después el nombre, que es lo único que hace que la ficha se pueda leer; y
 * al final el canal de contacto, que es RN7.
 */
export function createLead(draft: LeadDraft, receivedAt: string): LeadResult {
  if (firstTooLongField(draft) !== null) return { ok: false, problem: 'campo_demasiado_largo' };

  const name = draft.name.trim();
  if (name === '') return { ok: false, problem: 'sin_nombre' };

  const email = draft.email.trim();
  if (email !== '' && !isValidEmail(email)) return { ok: false, problem: 'correo_invalido' };
  if (!hasValidContact(draft)) return { ok: false, problem: 'sin_canal_de_contacto' };

  return {
    ok: true,
    lead: {
      name,
      business: orNull(draft.business),
      email: orNull(email),
      whatsapp: orNull(draft.whatsapp),
      interest: orNull(draft.interest),
      message: orNull(draft.message),
      receivedAt,
    },
  };
}
