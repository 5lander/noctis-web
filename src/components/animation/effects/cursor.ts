import { CURSOR } from '../animation-settings';
import { gsap } from '../gsap-plugins';

/**
 * RA-14 · cursor personalizado sobre la grilla.
 *
 * El elemento lo crea JavaScript y no el HTML a propósito: es puro adorno, no
 * tiene que existir para nadie que no vea la pantalla y no tiene que llegar en
 * el documento que el servidor envía. Va con `aria-hidden` y sin contenido.
 *
 * El cursor del sistema **no se oculta**. Un sitio que esconde el puntero y lo
 * reemplaza por un círculo apuesta a que su JavaScript nunca falle; acá el
 * círculo acompaña al puntero real y, si algo se rompe, no se pierde nada.
 *
 * Solo se monta con puntero fino: en una pantalla táctil no hay a quién seguir.
 */

const CURSOR_CLASS = 'noctis-cursor';
const ACTIVE_CLASS = 'is-active';
const READY_CLASS = 'is-ready';

export function followCursor(): () => void {
  const dot = document.createElement('div');
  dot.className = CURSOR_CLASS;
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(dot);

  const moveX = gsap.quickTo(dot, 'x', { duration: CURSOR.followDuration, ease: CURSOR.ease });
  const moveY = gsap.quickTo(dot, 'y', { duration: CURSOR.followDuration, ease: CURSOR.ease });

  const onMove = (event: PointerEvent): void => {
    // Hasta el primer movimiento el círculo estaría parado en la esquina
    // superior izquierda, que es exactamente donde nadie lo puso.
    dot.classList.add(READY_CLASS);
    moveX(event.clientX);
    moveY(event.clientY);
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  const releaseTargets = growOverTargets(dot);

  return () => {
    window.removeEventListener('pointermove', onMove);
    releaseTargets();
    dot.remove();
  };
}

function growOverTargets(dot: HTMLElement): () => void {
  const scaleTo = (scale: number): void => {
    gsap.to(dot, { scale, duration: CURSOR.scaleDuration, ease: CURSOR.scaleEase });
  };

  const onEnter = (): void => {
    dot.classList.add(ACTIVE_CLASS);
    scaleTo(CURSOR.hoverScale);
  };

  const onLeave = (): void => {
    dot.classList.remove(ACTIVE_CLASS);
    scaleTo(CURSOR.restScale);
  };

  const targets = [...document.querySelectorAll('[data-cursor-grow]')];
  for (const target of targets) {
    target.addEventListener('pointerenter', onEnter);
    target.addEventListener('pointerleave', onLeave);
  }

  return () => {
    for (const target of targets) {
      target.removeEventListener('pointerenter', onEnter);
      target.removeEventListener('pointerleave', onLeave);
    }
  };
}
