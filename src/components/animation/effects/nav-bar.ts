import { NAV_BAR } from '../animation-settings';
import { ScrollTrigger, gsap } from '../gsap-plugins';

/**
 * RA-04 · la barra se esconde al bajar y vuelve al subir.
 *
 * El umbral existe para que no parpadee arriba de todo, donde el rebote elástico
 * del navegador produce cambios de dirección que no son del visitante.
 */
export function hideNavBarOnScroll(): void {
  let previous = 0;

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const current = self.scroll();
      const hidden = current > NAV_BAR.threshold && current > previous;
      gsap.to('[data-nav-bar]', {
        yPercent: hidden ? NAV_BAR.hiddenYPercent : NAV_BAR.visibleYPercent,
        duration: NAV_BAR.duration,
        ease: NAV_BAR.ease,
      });
      previous = current;
    },
  });
}
