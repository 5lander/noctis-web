/**
 * El contrato de la vuelta sin JavaScript.
 *
 * Cuando el envío llega desde un `<form>` que se envió solo —sin el guion que
 * lo intercepta— no se puede contestar con JSON: el navegador lo pintaría como
 * texto crudo en una pantalla en blanco. Se contesta con una redirección a la
 * misma página, marcando en la URL cómo terminó, y la sección de contacto pinta
 * el mismo mensaje que pinta la vía con JavaScript.
 *
 * Vive en un módulo aparte porque lo necesitan dos lados —la ruta que redirige y
 * la página que lee— y porque un archivo `route.ts` de Next no admite
 * exportaciones que no sean las suyas.
 */

export const SENT_PARAM = 'enviado';

/*
 * Los dos valores que puede llevar el parámetro. No se exportan: quien los
 * necesita usa `redirectTargetFor` para escribirlos y `readSentOutcome` para
 * leerlos, y así el formato de la URL vive en un solo archivo.
 */
const SENT_VALUES = {
  ok: 'si',
  failed: 'no',
} as const;

export type SentOutcome = keyof typeof SENT_VALUES;

/** El ancla lleva de vuelta al formulario y no al principio de la página. */
export function redirectTargetFor(outcome: SentOutcome): string {
  return `/?${SENT_PARAM}=${SENT_VALUES[outcome]}#contacto`;
}

/** De lo que venga en la URL a un resultado, o a nada si no dice nada válido. */
export function readSentOutcome(value: string | undefined): SentOutcome | null {
  if (value === SENT_VALUES.ok) return 'ok';
  if (value === SENT_VALUES.failed) return 'failed';
  return null;
}
