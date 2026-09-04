/**
 * Textos de la interfaz que no pertenecen a ninguna sección: rótulos de
 * accesibilidad y microcopia de los controles.
 *
 * Están acá y no dentro del componente porque ningún texto de cara al usuario
 * puede vivir en un componente (`CLAUDE.md` §2). Un `aria-label` cuenta: es lo
 * único que oye quien usa lector de pantalla.
 */

export const UI_TEXT = {
  menuToggle: 'Abrir el menú de secciones',
  whatsapp: 'Escribir por WhatsApp',
  tourLabel: 'Recorrido en vídeo de la página de',
  /*
   * Los dos estados del botón que cubre el recorrido. Es lo único que oye quien
   * usa lector de pantalla, así que dice la acción y sobre qué trabajo, no
   * «reproducir» a secas: en la página hay dos recorridos y hacen falta los dos
   * datos para saber cuál se está tocando.
   */
  tourPlay: 'Ver el recorrido de',
  tourPause: 'Pausar el recorrido de',
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
