import { HEAD_SCRIPT } from './head-script-source';

/**
 * El único script en línea del sitio, en el `<head>` y bloqueante.
 *
 * Hace dos cosas que **tienen que pasar antes del primer pintado** o se ven:
 * fijar el modo claro/oscuro (`CLAUDE.md` §10) y marcar que va a haber
 * animación, para que el estado inicial de los elementos animados exista desde
 * el primer byte y no aparezca un salto al hidratar.
 *
 * Van juntos a propósito. Cada script en línea es una excepción a la prohibición
 * de HTML crudo, y una excepción sale más barata que dos: `audit:forbidden` la
 * tiene declarada y la imprime en cada corrida. Cómo se unen —y por qué el
 * separador importa— está en `head-script-source.ts`.
 *
 * El contenido son dos constantes del repositorio, no algo que haya escrito una
 * persona — que es lo que prohíbe `CLAUDE.md` §8. Lleva el nonce de la petición.
 */
export function InlineHeadScript({ nonce }: { readonly nonce: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />;
}
