import { MODE_SWEEP, REDUCED_MOTION_QUERY } from '@/components/animation/animation-settings';

/**
 * RA-06 · el cambio de modo entra como un barrido circular desde el botón.
 *
 * Lo hace la View Transitions API del navegador, no GSAP: es la única forma de
 * animar entre dos estados completos del documento sin duplicar la página. El
 * navegador toma una captura del antes y del después y anima entre las dos.
 *
 * **La animación vive en el CSS** (`animation.css`), acá solo se dice desde qué
 * punto y hasta qué radio. Un `clip-path` sobre un pseudo-elemento no se puede
 * animar desde JavaScript, y tampoco haría falta.
 *
 * Los cuatro caminos que no son el feliz terminan igual de bien: sin soporte de
 * la API, con movimiento reducido, con dos clics seguidos o si algo falla, el
 * modo cambia igual y queda la transición de medio segundo que ya hacía el CSS.
 */

const HALVES = 2;

/** El radio que cubre la pantalla entera desde el punto de origen. */
function radiusFrom(originX: number, originY: number): number {
  const horizontal = Math.max(originX, window.innerWidth - originX);
  const vertical = Math.max(originY, window.innerHeight - originY);
  return Math.hypot(horizontal, vertical);
}

function markOrigin(originX: number, originY: number): void {
  const root = document.documentElement;
  root.style.setProperty(MODE_SWEEP.originXProperty, `${String(originX)}px`);
  root.style.setProperty(MODE_SWEEP.originYProperty, `${String(originY)}px`);
  root.style.setProperty(MODE_SWEEP.radiusProperty, `${String(radiusFrom(originX, originY))}px`);
  root.style.setProperty(MODE_SWEEP.durationProperty, `${String(MODE_SWEEP.durationMs)}ms`);
}

export function sweepFrom(origin: DOMRect, applyMode: () => void): void {
  // El tipo de `lib.dom` la declara siempre presente; los navegadores todavía no.
  const supported = typeof document.startViewTransition === 'function';

  if (!supported || window.matchMedia(REDUCED_MOTION_QUERY).matches) {
    applyMode();
    return;
  }

  markOrigin(origin.left + origin.width / HALVES, origin.top + origin.height / HALVES);

  const transition = document.startViewTransition(applyMode);

  // Dos clics seguidos abortan la transición en curso y el navegador rechaza la
  // promesa. No es un fallo que reportar: el modo **ya cambió** —`applyMode` corre
  // igual— y lo único que se pierde es el barrido del clic anterior. Sin este
  // `catch` queda un rechazo sin atender en la consola de cada visitante.
  void transition.finished.catch(() => undefined);
}
