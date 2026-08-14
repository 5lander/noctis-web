import { HERO, MAGNETIC } from '../animation-settings';
import { SplitText, gsap } from '../gsap-plugins';

/**
 * RA-01 · la portada entra por líneas, con máscara.
 *
 * Hasta la v1 el titular se partía en palabras en el servidor para no depender
 * de `SplitText`, cuya licencia estaba sin confirmar (D15). Resuelto D15
 * (ADR-0012), el corte se hace por **líneas**, que es lo que pedía el propio
 * `ANIMACION.md` §3: en pantallas anchas una línea que sube se lee como una
 * frase, y una palabra que sube se lee como un truco.
 *
 * `mask: 'lines'` envuelve cada línea en un contenedor con recorte, así que la
 * máscara ya no vive en el CSS. `revert()` devuelve el titular a su HTML
 * original: sin eso, el App Router deja el titular partido para siempre.
 */

const HIDDEN = 0;
const VISIBLE = 1;
const HALVES = 2;

/**
 * La máscara recorta a la altura de la caja de línea, y una serif de 104px se
 * sale de su caja por arriba y por abajo. La clase le pone aire en el CSS; sin
 * eso, el titular entra con las mayúsculas y los descendentes cortados.
 */
const HEADLINE_LINE_CLASS = 'hero-line';
export function animateHero(): () => void {
  const headline = document.querySelector('[data-hero-headline]');
  if (headline === null) return () => undefined;

  const split = new SplitText(headline, {
    type: 'lines',
    mask: 'lines',
    linesClass: HEADLINE_LINE_CLASS,
  });
  gsap.set(headline, { opacity: VISIBLE });

  gsap
    .timeline({ defaults: { ease: HERO.ease } })
    .from(split.lines, {
      yPercent: HERO.lineFromPercent,
      duration: HERO.lineDuration,
      stagger: HERO.lineStagger,
    })
    .to(
      '[data-hero-follow]',
      {
        opacity: VISIBLE,
        y: HIDDEN,
        duration: HERO.followDuration,
        stagger: HERO.followStagger,
      },
      HERO.overlap,
    );

  return () => {
    split.revert();
  };
}

/**
 * RA-09 · botón magnético.
 *
 * El elemento persigue al puntero una fracción de la distancia al centro y
 * vuelve con rebote al salir. `quickTo` reutiliza el mismo tween en vez de crear
 * uno por evento, que es la diferencia entre esto y una fuga de memoria.
 *
 * Solo se aplica a lo que lo pide con `data-magnetic`: un sitio donde todo se
 * mueve al pasar el mouse no se siente terminado, se siente inestable.
 */
export function magnetizeElements(): () => void {
  const cleanups = [...document.querySelectorAll('[data-magnetic]')].map(magnetizeOne);

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

function magnetizeOne(element: Element): () => void {
  const moveX = gsap.quickTo(element, 'x', { duration: MAGNETIC.duration, ease: MAGNETIC.ease });
  const moveY = gsap.quickTo(element, 'y', { duration: MAGNETIC.duration, ease: MAGNETIC.ease });

  const onMove = (event: Event): void => {
    if (!(event instanceof PointerEvent)) return;
    const box = element.getBoundingClientRect();
    moveX((event.clientX - (box.left + box.width / HALVES)) * MAGNETIC.strength);
    moveY((event.clientY - (box.top + box.height / HALVES)) * MAGNETIC.strength);
  };

  const onLeave = (): void => {
    gsap.to(element, {
      x: HIDDEN,
      y: HIDDEN,
      duration: MAGNETIC.releaseDuration,
      ease: MAGNETIC.releaseEase,
    });
  };

  element.addEventListener('pointermove', onMove);
  element.addEventListener('pointerleave', onLeave);

  return () => {
    element.removeEventListener('pointermove', onMove);
    element.removeEventListener('pointerleave', onLeave);
  };
}
