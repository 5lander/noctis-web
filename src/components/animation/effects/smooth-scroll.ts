import { SMOOTH } from '../animation-settings';
import { ScrollSmoother } from '../gsap-plugins';

/**
 * RA-08 · suavizado de scroll.
 *
 * `ScrollSmoother` no intercepta la rueda: deja que la página se desplace de
 * verdad y desfasa el contenido con un `transform`, así que la barra del
 * navegador, el teclado y buscar en la página siguen funcionando. Esa es la
 * diferencia con el scroll secuestrado que `ANIMACION.md` v1 rechazaba, y la
 * razón por la que entra ahora.
 *
 * En táctil va apagado (`smoothTouch: 0`): el desplazamiento nativo del teléfono
 * ya tiene su propia inercia y superponerle otra se siente pegajoso.
 *
 * Los enlaces internos hay que atenderlos a mano: con el contenido desfasado, el
 * salto nativo del navegador aterriza en el lugar equivocado.
 */

const SMOOTHER_CLASS = 'smoother-active';
const WRAPPER = '#smooth-wrapper';
const CONTENT = '#smooth-content';
const INTERNAL_LINK = 'a[href^="#"]';

export function createSmoothScroll(): ScrollSmoother | undefined {
  if (document.querySelector(WRAPPER) === null) return undefined;

  document.documentElement.classList.add(SMOOTHER_CLASS);

  return ScrollSmoother.create({
    wrapper: WRAPPER,
    content: CONTENT,
    smooth: SMOOTH.smooth,
    smoothTouch: SMOOTH.smoothTouch,
    effects: SMOOTH.effects,
    normalizeScroll: true,
  });
}

export function interceptInternalLinks(smoother: ScrollSmoother): () => void {
  const onClick = (event: Event): void => {
    const link = event.target instanceof Element ? event.target.closest(INTERNAL_LINK) : null;
    const target = link?.getAttribute('href') ?? '';
    if (target.length <= 1 || document.querySelector(target) === null) return;

    event.preventDefault();
    smoother.scrollTo(target, true, SMOOTH.anchorPosition);
  };

  document.addEventListener('click', onClick);

  return () => {
    document.removeEventListener('click', onClick);
    document.documentElement.classList.remove(SMOOTHER_CLASS);
  };
}
