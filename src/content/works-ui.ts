/**
 * Los rótulos de la ficha de un trabajo.
 *
 * Están acá y no dentro del componente por la regla de siempre: ningún texto de
 * cara al usuario vive fuera de `content/` (`CLAUDE.md` §2). Lo que **sí** sale
 * de la base es el dato —el cliente, el tipo, el año, el resumen—; estas cuatro
 * cadenas son la interfaz que lo enmarca.
 */
export const WORKS_UI = {
  kind: 'Tipo',
  year: 'Año',
  /*
   * Un trabajo entregado puede estar todavía sin publicar: el dominio ya lo
   * contempla dejando `href` en nulo. Decirlo es mejor que callarlo — sin esta
   * línea, la única tarjeta sin flecha parece una tarjeta rota.
   */
  notPublished: 'Todavía sin publicar',
} as const;
