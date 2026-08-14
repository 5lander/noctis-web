import { REVEAL, WORKS } from '../animation-settings';
import { gsap } from '../gsap-plugins';

/**
 * RA-02 · una timeline por sección, disparada al entrar al viewport.
 *
 * Una sección puede querer animar sus piezas a su manera —la grilla de trabajos
 * con onda, el proceso con anclaje—. Esas se marcan con `data-owns-anim` y el
 * revelado genérico las deja en paz: si las animara también, cada pieza tendría
 * dos dueños y ganaría la que corriera última.
 */

const VISIBLE = 1;
const RESTING = 0;

function piecesOwnedBy(root: Element): Element[] {
  return [...root.querySelectorAll('[data-anim]')].filter(
    (piece) => piece.closest('[data-owns-anim]') === null,
  );
}

export function revealSections(): void {
  for (const root of document.querySelectorAll('[data-reveal-root]')) {
    const pieces = piecesOwnedBy(root);
    if (pieces.length === 0) continue;

    gsap.to(pieces, {
      opacity: VISIBLE,
      y: RESTING,
      duration: REVEAL.duration,
      stagger: REVEAL.stagger,
      ease: REVEAL.ease,
      scrollTrigger: { trigger: root, start: REVEAL.start },
    });
  }
}

/**
 * RA-11 · la grilla entra en onda desde el centro y la portada se descubre.
 *
 * `stagger.grid` es una propiedad de GSAP, no un algoritmo propio: se le dice
 * cuántas columnas hay y desde dónde sale la onda, y él calcula el retraso de
 * cada celda. `from: 'center'` es lo que hace que se lea como una onda y no como
 * una lista que aparece de arriba abajo.
 *
 * La cortina anima `clip-path`, que no dispara recálculo de layout: es la única
 * forma de descubrir una portada sin animar alto ni ancho (`ANIMACION.md` §1).
 */
export function waveGrids(): void {
  for (const grid of document.querySelectorAll('[data-grid-wave]')) {
    const cards = [...grid.querySelectorAll('[data-anim]')];
    if (cards.length === 0) continue;

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: grid, start: WORKS.waveStart },
    });

    timeline.to(cards, {
      opacity: VISIBLE,
      y: RESTING,
      duration: WORKS.waveDuration,
      ease: WORKS.waveEase,
      stagger: {
        grid: [Math.ceil(cards.length / WORKS.gridColumns), WORKS.gridColumns],
        from: 'center',
        amount: WORKS.waveAmount * cards.length,
      },
    });

    revealCurtains(grid, timeline);
  }
}

function revealCurtains(grid: Element, timeline: gsap.core.Timeline): void {
  const curtains = grid.querySelectorAll('[data-curtain]');
  if (curtains.length === 0) return;

  timeline.fromTo(
    curtains,
    { clipPath: WORKS.curtainFrom },
    {
      clipPath: WORKS.curtainTo,
      duration: WORKS.curtainDuration,
      ease: WORKS.curtainEase,
      stagger: { amount: WORKS.waveAmount * curtains.length },
    },
    RESTING,
  );
}
