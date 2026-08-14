import { THEME_SCRIPT } from './theme-script-source';

/**
 * Inserta el script del modo en el `<head>`, en línea y bloqueante.
 *
 * Tiene que ser en línea: un archivo externo agrega un viaje de red antes de
 * poder pintar, que es exactamente lo que se está evitando. Y `next/script` no
 * ahorra el `dangerouslySetInnerHTML` — lo usa internamente.
 *
 * **Este es el único punto del sistema donde se inyecta HTML crudo**, y lo que
 * se inyecta es una constante del repositorio, no algo que haya escrito una
 * persona, que es lo que prohíbe `CLAUDE.md` §8. `audit:forbidden` lo tiene como
 * excepción única y la imprime en cada corrida, para que no pase inadvertida.
 *
 * Lleva el nonce de la petición, como todo script bajo la CSP (ADR-0004).
 */
export function ThemeScript({ nonce }: { readonly nonce: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
