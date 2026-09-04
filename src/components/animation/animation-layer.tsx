'use client';

import { useLayoutEffect } from 'react';

import { ANIMATION_WATCHDOG_KEY } from './animation-ready-source';
import {
  DESKTOP_QUERY,
  FINE_POINTER_QUERY,
  MOBILE_QUERY,
  REDUCED_MOTION_QUERY,
} from './animation-settings';
import { animateAccordion } from './effects/accordion';
import { countFigures } from './effects/counters';
import { followCursor } from './effects/cursor';
import { animateHero, magnetizeElements } from './effects/hero';
import { loopMarquee } from './effects/marquee';
import { condenseNavBarOnScroll } from './effects/nav-bar';
import { parallaxLayers } from './effects/parallax';
import { pinProcess } from './effects/process';
import { revealSections, waveGrids } from './effects/reveal';
import { skewOnVelocity } from './effects/scroll-skew';
import { createSmoothScroll, interceptInternalLinks } from './effects/smooth-scroll';
import { gsap } from './gsap-plugins';

/**
 * La capa de movimiento: RA-01 a RA-14 de `docs/ANIMACION.md` v2.
 *
 * Es un solo componente de cliente que anima el HTML que ya renderizó el
 * servidor. Las once secciones siguen siendo Server Components: nada de ponerle
 * `'use client'` a media página para animarla. Este archivo **solo compone**;
 * cada efecto vive en `effects/` con el requisito que implementa en su cabecera.
 *
 * **Todo vive dentro de un `gsap.context()`.** Al desmontar, `revert()` deshace
 * los estilos y mata los ScrollTrigger. Sin eso, navegar entre rutas del App
 * Router deja disparadores huérfanos apuntando a nodos que ya no existen. Los
 * efectos que además ponen escuchas devuelven su propia limpieza: `context`
 * no sabe nada de `addEventListener`.
 *
 * Tres cortes, y ninguno es un adorno:
 * - **movimiento reducido** — no se ejecuta nada y la página queda entera;
 * - **móvil** — sin anclaje, suavizado ni cielo: se revela y ya;
 * - **puntero fino** — el cursor personalizado no se monta en una pantalla táctil.
 */

/** La capa ya arrancó: el temporizador de rescate del `<head>` sobra. */
function cancelWatchdog(): void {
  const id: unknown = Reflect.get(window, ANIMATION_WATCHDOG_KEY);
  if (typeof id === 'number') window.clearTimeout(id);
}

const VISIBLE = 1;
const RESTING = 0;

/** En móvil no se registran disparadores de scroll: se muestra y ya. */
function revealWithoutScrollTriggers(): void {
  gsap.set('[data-anim]', { opacity: VISIBLE, y: RESTING });
}

/** El recorrido completo, solo donde hay pantalla y puntero para sostenerlo. */
function startDesktopMotion(): () => void {
  const smoother = createSmoothScroll();
  const releaseLinks = smoother === undefined ? () => undefined : interceptInternalLinks(smoother);

  revealSections();
  waveGrids();
  countFigures();
  loopMarquee();
  condenseNavBarOnScroll();
  pinProcess();
  parallaxLayers();
  skewOnVelocity();

  return () => {
    releaseLinks();
    smoother?.kill();
  };
}

function startMotion(): () => void {
  const releaseHero = animateHero();
  const releaseAccordion = animateAccordion();
  const releaseMagnets = magnetizeElements();

  const media = gsap.matchMedia();
  media.add(DESKTOP_QUERY, startDesktopMotion);
  media.add(MOBILE_QUERY, revealWithoutScrollTriggers);
  media.add(FINE_POINTER_QUERY, followCursor);

  return () => {
    releaseHero();
    releaseAccordion();
    releaseMagnets();
    media.revert();
  };
}

export function AnimationLayer() {
  useLayoutEffect(() => {
    cancelWatchdog();

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    let release: () => void = () => undefined;
    const context = gsap.context(() => {
      release = startMotion();
    });

    return () => {
      release();
      context.revert();
    };
  }, []);

  return null;
}
