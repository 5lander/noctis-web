import { PARALLAX } from '../animation-settings';
import { gsap } from '../gsap-plugins';

/**
 * RA-13 · parallax por capas.
 *
 * La profundidad la declara cada elemento en `data-parallax`, no este archivo:
 * así se ajusta el efecto donde se ve, en el componente, y no hay una tabla de
 * selectores acá que se desincronice del HTML.
 *
 * El catálogo lo marca como riesgo medio —"mucho parallax pelea con el
 * minimalismo"—, y por eso se aplica a un puñado de piezas decorativas y nunca
 * a un bloque de texto que el visitante esté leyendo.
 */

function depthOf(layer: Element): number {
  const declared = Number.parseFloat(layer.getAttribute('data-parallax') ?? '');
  return Number.isNaN(declared) ? PARALLAX.defaultDepth : declared;
}

export function parallaxLayers(): void {
  for (const layer of document.querySelectorAll('[data-parallax]')) {
    gsap.to(layer, {
      yPercent: -depthOf(layer) * PARALLAX.travelPercent,
      ease: PARALLAX.ease,
      scrollTrigger: {
        trigger: layer,
        start: 'top bottom',
        end: 'bottom top',
        scrub: PARALLAX.scrub,
        invalidateOnRefresh: true,
      },
    });
  }
}
