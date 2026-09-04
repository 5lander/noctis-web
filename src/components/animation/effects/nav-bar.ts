import { NAV_BAR } from '../animation-settings';
import { ScrollTrigger, gsap } from '../gsap-plugins';

/**
 * La barra **no se esconde**: se condensa.
 *
 * Reemplaza a RA-04, que la sacaba de pantalla al bajar. El pedido fue explícito
 * —que quede sobrepuesta siempre— y coincide con lo que conviene: la barra lleva
 * la única llamada a la acción persistente del sitio, y una barra que se va es
 * una llamada a la acción que se va. En una página de once pantallas, eso obliga
 * a hacer scroll hacia arriba para poder contactar.
 *
 * Lo que sí cambia al bajar es su peso: gana opacidad de material, sombra y
 * pierde altura. Así sigue habiendo una señal de que la página se movió —que es
 * lo que la animación original comunicaba— sin quitar nada de en medio.
 */
export function condenseNavBarOnScroll(): void {
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const condensed = self.scroll() > NAV_BAR.threshold;
      gsap.to('[data-nav-bar]', {
        // La barra nunca se traslada: el desplazamiento se quedó en cero a
        // propósito, para que ningún efecto futuro la vuelva a mover sin que se
        // note en este archivo.
        yPercent: NAV_BAR.visibleYPercent,
        duration: NAV_BAR.duration,
        ease: NAV_BAR.ease,
      });
      document.documentElement.dataset['navCondensed'] = condensed ? 'true' : 'false';
    },
  });
}
