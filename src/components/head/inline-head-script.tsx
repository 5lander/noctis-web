import { ANIMATION_READY_SCRIPT } from '@/components/animation/animation-ready-source';

/**
 * El único script en línea del sitio, en el `<head>` y bloqueante.
 *
 * Hace una sola cosa, y **tiene que pasar antes del primer pintado** o se ve:
 * marcar que va a haber animación, para que el estado inicial de los elementos
 * animados exista desde el primer byte y no aparezca un salto al hidratar.
 *
 * Antes hacía dos, porque también fijaba el modo claro/oscuro antes de pintar.
 * Con un solo esquema eso ya no existe: el color sale de `tokens.css` y no
 * depende de nada que haya que leer en el arranque. Se fue con él la parte más
 * delicada de este archivo —dos scripts concatenados que había que separar con
 * `;` o el segundo no corría nunca— y con ella su prueba.
 *
 * Cada script en línea es una excepción a la prohibición de HTML crudo:
 * `audit:forbidden` la tiene declarada y la imprime en cada corrida.
 *
 * El contenido es una constante del repositorio, no algo que haya escrito una
 * persona — que es lo que prohíbe `CLAUDE.md` §8. Lleva el nonce de la petición.
 */
export function InlineHeadScript({ nonce }: { readonly nonce: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: ANIMATION_READY_SCRIPT }} />;
}
