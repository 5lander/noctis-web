import { PROCESS } from '../animation-settings';
import { gsap } from '../gsap-plugins';

/**
 * RA-12 · el proceso se ancla y sus pasos cruzan mientras el visitante baja.
 *
 * Es la técnica 11 del catálogo, la marcada como "protagonista": cambia la
 * sensación del sitio y alarga la página. Entra porque el proceso es justo la
 * sección donde una secuencia se entiende mejor si el visitante la recorre en
 * orden en vez de verla completa de golpe.
 *
 * `invalidateOnRefresh` no es opcional con `pin` y `scrub`: sin él, rotar el
 * teléfono deja el anclaje calculado con la altura vieja y la sección se rompe.
 *
 * El trazo que une los pasos se dibuja con `DrawSVGPlugin`, gratuito desde que
 * GSAP se liberó por completo (ADR-0012). Sin él la línea simplemente se ve
 * entera: no hay contenido que dependa del dibujo.
 */

const START = 0;
const VISIBLE = 1;
const EMPTY = '0%';
const DRAWN = '100%';

export function pinProcess(): void {
  const panel = document.querySelector('[data-process-panel]');
  if (panel === null) return;

  const steps = [...panel.querySelectorAll('[data-process-step]')];
  if (steps.length === 0) return;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: panel,
      start: 'top 22%',
      end: PROCESS.pinDistance,
      pin: true,
      scrub: PROCESS.scrub,
      invalidateOnRefresh: true,
    },
  });

  drawConnector(panel, timeline);

  timeline.to(
    steps,
    {
      opacity: VISIBLE,
      y: START,
      duration: PROCESS.stepDuration,
      ease: PROCESS.stepEase,
      stagger: PROCESS.stepDuration,
    },
    START,
  );
}

function drawConnector(panel: Element, timeline: gsap.core.Timeline): void {
  const line = panel.querySelector('[data-process-line]');
  if (line === null) return;

  timeline.fromTo(
    line,
    { drawSVG: EMPTY },
    { drawSVG: DRAWN, duration: PROCESS.lineDuration, ease: PROCESS.lineEase },
    START,
  );
}
