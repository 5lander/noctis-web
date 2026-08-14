import { SKEW } from '../animation-settings';
import { ScrollTrigger, gsap } from '../gsap-plugins';

/**
 * RA-10 · inclinación por velocidad de scroll.
 *
 * Es la técnica 12 del catálogo: la grilla se inclina un poco mientras el
 * visitante se desplaza rápido y se endereza sola al frenar. El techo de siete
 * grados es del propio catálogo y no es negociable — pasado ese punto deja de
 * leerse como inercia y empieza a marear.
 *
 * `quickTo` reutiliza un único tween por propiedad. Crear uno por evento de
 * scroll sería fabricar basura sesenta veces por segundo.
 *
 * El enderezado es un temporizador aparte y **no es un detalle**: el disparador
 * solo avisa mientras hay scroll, así que la última inclinación que llega se
 * queda puesta para siempre si nadie la baja a cero. Se veía como una grilla
 * torcida en una página quieta.
 */
export function skewOnVelocity(): void {
  const targets = document.querySelectorAll('[data-skew]');
  if (targets.length === 0) return;

  const setSkew = gsap.quickTo(targets, 'skewY', {
    duration: SKEW.duration,
    ease: SKEW.ease,
  });

  const straighten = gsap.delayedCall(SKEW.settleDelay, () => {
    setSkew(0);
  });
  straighten.pause();

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const tilt = self.getVelocity() / SKEW.velocityDivisor;
      setSkew(gsap.utils.clamp(-SKEW.maxDegrees, SKEW.maxDegrees, tilt));
      straighten.restart(true);
    },
  });
}
