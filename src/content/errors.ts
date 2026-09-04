/**
 * Catálogo de errores que el visitante puede llegar a ver.
 *
 * Vive en `content/` porque ningún texto de cara al usuario puede nacer dentro
 * de un componente o de un handler (CLAUDE.md §2). El mensaje que se muestra y
 * el detalle que se registra son cosas distintas (CLAUDE.md §3): acá solo está
 * el primero, deliberadamente genérico — sin trazas, sin nombres de archivo y
 * sin versiones de librerías (SEGURIDAD.md §8).
 *
 * El catálogo crece cuando llega el caso que lo necesita, no antes.
 */

export const ERROR_CODES = {
  tooManyRequests: 'demasiadas_peticiones',
  internal: 'error_interno',
  invalidSubmission: 'envio_invalido',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Readonly<Record<ErrorCode, string>> = {
  [ERROR_CODES.tooManyRequests]:
    'Recibimos demasiadas peticiones desde su conexión. Espere un momento y vuelva a intentar.',
  [ERROR_CODES.internal]: 'Algo falló de nuestro lado. Intente de nuevo en unos minutos.',
  /*
   * Dice qué revisar sin decir qué comprobación falló.
   *
   * La diferencia importa: «el nombre y una forma de contactarlo» es lo que el
   * visitante puede arreglar, y es verdad para los cuatro motivos de rechazo que
   * existen. Enumerar cuál de los cuatro fue le sirve más a quien está probando
   * el formulario con un guion que a quien lo está llenando en serio.
   */
  [ERROR_CODES.invalidSubmission]:
    'Revise el nombre y una forma de contactarlo, y vuelva a enviar.',
};
