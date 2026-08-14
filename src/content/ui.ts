/**
 * Textos de la interfaz que no pertenecen a ninguna sección: rótulos de
 * accesibilidad y microcopia de los controles.
 *
 * Están acá y no dentro del componente porque ningún texto de cara al usuario
 * puede vivir en un componente (`CLAUDE.md` §2). Un `aria-label` cuenta: es lo
 * único que oye quien usa lector de pantalla.
 */

export const UI_TEXT = {
  modeToggle: 'Cambiar entre modo claro y oscuro',
} as const;

/**
 * La bandeja de correo simulada. Solo existe en desarrollo, pero su texto vive
 * acá igual: la regla no tiene excepciones por audiencia.
 */
export const DEV_MAILBOX = {
  title: 'Bandeja simulada',
  intro:
    'Los correos que el sistema habría enviado. Viven en memoria y desaparecen al reiniciar el servidor.',
  empty: 'Todavía no se envió ningún correo en esta sesión.',
  to: 'Para',
  sentAt: 'Enviado',
} as const;
