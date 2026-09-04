import { z } from 'zod';

import {
  createLead,
  LEAD_LIMITS,
  type Lead,
  type LeadDraft,
  type LeadProblem,
} from '@/modules/lead/domain/lead';

/**
 * De un envío del formulario a un veredicto.
 *
 * Vive en aplicación y no en la ruta por la razón de siempre: una regla escrita
 * dentro de un handler no se puede probar sin levantar un servidor. Y no vive en
 * dominio porque usa zod, que `dominio-solo-dominio` prohíbe allí.
 *
 * **Lo que llega del navegador es dato, no instrucción.** No se confía en el
 * tipo de nada: el cuerpo entra como `unknown` y sale como una ficha o como un
 * motivo de rechazo, sin estados intermedios en los que alguien pueda apoyarse.
 */

/**
 * Las dos defensas anti-automatización que pide `SPEC.md` §10, y lo que
 * honestamente valen.
 *
 * La **trampa** es un campo que un visitante nunca ve y que un robot que rellena
 * todo lo que encuentra sí llena. La **prisa** es el tiempo entre que el
 * formulario se pintó y que se envió: nadie escribe su nombre, su correo y su
 * problema en menos de tres segundos.
 *
 * El instante de partida lo pone el servidor al pintar la página y viaja en un
 * campo oculto, no lo calcula un guion en el navegador. Esa diferencia es la que
 * hace que la comprobación siga funcionando **sin JavaScript**: con un guion que
 * midiera el tiempo, quien lo tuviera apagado quedaría marcado como robot en
 * cada envío.
 *
 * Ninguna de las dos es infalible, y hay que decirlo: el campo viaja por el
 * cliente y se puede falsear. Son badenes, no muros. El muro es el límite por IP
 * de la ruta, que no depende de nada que venga del navegador.
 */
const MIN_FILL_MS = 3000;

const field = (max: number) => z.string().max(max).default('');

/**
 * El esquema admite exactamente los campos del formulario y descarta el resto.
 * Los topes de acá son los del dominio con holgura para los espacios que después
 * se recortan: rechazar en el borde es más barato que arrastrar una cadena
 * enorme hasta la regla de negocio.
 */
const submissionSchema = z.object({
  nombre: field(LEAD_LIMITS.name),
  negocio: field(LEAD_LIMITS.business),
  correo: field(LEAD_LIMITS.email),
  whatsapp: field(LEAD_LIMITS.whatsapp),
  interes: field(LEAD_LIMITS.interest),
  mensaje: field(LEAD_LIMITS.message),
  /** La trampa. Su nombre imita un campo real para que el robot lo llene. */
  sitio: field(LEAD_LIMITS.name),
  /**
   * Instante en que el servidor pintó el formulario, en milisegundos de época.
   * Ausente vale cero, y cero da una demora de cero: un envío que no dice cuándo
   * empezó se trata igual que uno instantáneo, que es lo que es.
   */
  desde: z.coerce.number().int().min(0).default(0),
});

export type SpamSignal = 'trampa' | 'prisa';

export type SubmissionVerdict =
  | { readonly outcome: 'accepted'; readonly lead: Lead }
  | { readonly outcome: 'rejected'; readonly problem: LeadProblem }
  | { readonly outcome: 'malformed' }
  | { readonly outcome: 'spam'; readonly signal: SpamSignal };

function elapsedMs(desde: number, receivedAt: string): number {
  if (desde === 0) return 0;
  return Date.parse(receivedAt) - desde;
}

function spamSignalOf(sitio: string, elapsed: number): SpamSignal | null {
  if (sitio.trim() !== '') return 'trampa';
  if (elapsed < MIN_FILL_MS) return 'prisa';
  return null;
}

function toDraft(parsed: z.infer<typeof submissionSchema>): LeadDraft {
  return {
    name: parsed.nombre,
    business: parsed.negocio,
    email: parsed.correo,
    whatsapp: parsed.whatsapp,
    interest: parsed.interes,
    message: parsed.mensaje,
  };
}

/**
 * El veredicto completo, en un paso y sin salidas intermedias.
 *
 * `receivedAt` entra por parámetro y no se lee del reloj acá dentro: así la
 * marca de tiempo de la ficha se comprueba con un valor fijo en vez de con un
 * reloj falso.
 */
export function judgeContactSubmission(input: unknown, receivedAt: string): SubmissionVerdict {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { outcome: 'malformed' };

  const elapsed = elapsedMs(parsed.data.desde, receivedAt);
  const signal = spamSignalOf(parsed.data.sitio, elapsed);
  if (signal !== null) return { outcome: 'spam', signal };

  const result = createLead(toDraft(parsed.data), receivedAt);
  return result.ok
    ? { outcome: 'accepted', lead: result.lead }
    : { outcome: 'rejected', problem: result.problem };
}
