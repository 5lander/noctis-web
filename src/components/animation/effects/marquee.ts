import { MARQUEE } from '../animation-settings';
import { ScrollTrigger, gsap } from '../gsap-plugins';

/**
 * RA-03 · la marquesina, ahora reactiva al scroll.
 *
 * La pista se duplica y se corre media vuelta: eso da un bucle sin salto y ya
 * estaba en la v1. Lo nuevo es que **el scroll la empuja**: al bajar acelera
 * hacia adelante, al subir se invierte, y cuando el scroll se detiene vuelve
 * sola a su ritmo. Es la técnica 07 del catálogo, la que más terminación aporta
 * por lo poco que cuesta.
 *
 * El techo de `maxTimeScale` no es decorativo: sin él, un golpe de rueda de
 * ratón manda la pista a una velocidad en la que el texto deja de leerse.
 */

const HALF_TURN_PERCENT = -50;
const FORWARD = 1;
const BACKWARD = -1;

export function loopMarquee(): void {
  const track = document.querySelector('[data-marquee-track]');
  if (track === null) return;

  track.innerHTML += track.innerHTML;

  const loop = gsap.to(track, {
    xPercent: HALF_TURN_PERCENT,
    duration: MARQUEE.duration,
    ease: MARQUEE.ease,
    repeat: -1,
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      pushLoop(loop, self.getVelocity());
    },
  });
}

function pushLoop(loop: gsap.core.Tween, velocity: number): void {
  const direction = velocity >= 0 ? FORWARD : BACKWARD;
  const boost = Math.min(
    MARQUEE.maxTimeScale,
    MARQUEE.restTimeScale + Math.abs(velocity) / MARQUEE.velocityDivisor,
  );

  loop.timeScale(direction * boost);
  gsap.to(loop, {
    timeScale: direction * MARQUEE.restTimeScale,
    duration: MARQUEE.settleDuration,
    ease: MARQUEE.settleEase,
    overwrite: true,
  });
}
