'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';

import { ANIMATION_WATCHDOG_KEY } from './animation-ready-source';
import {
  ACCORDION,
  DESKTOP_QUERY,
  HERO,
  MARQUEE,
  NAV_BAR,
  REDUCED_MOTION_QUERY,
  REVEAL,
} from './animation-settings';

/**
 * La capa de movimiento: RA-01 a RA-05 de `docs/ANIMACION.md`.
 *
 * Es un solo componente de cliente que anima el HTML que ya renderizó el
 * servidor. Las once secciones siguen siendo Server Components: nada de ponerle
 * `'use client'` a media página para animarla.
 *
 * **Todo vive dentro de un `gsap.context()`.** Al desmontar, `revert()` deshace
 * los estilos y mata los ScrollTrigger. Sin eso, navegar entre rutas del App
 * Router deja disparadores huérfanos apuntando a nodos que ya no existen.
 *
 * GSAP viene del paquete y se empaqueta con la aplicación: **nunca desde un
 * CDN** (`CLAUDE.md` §1). Sin plugins de Club — D15 sigue en 🔴 y RA-01 se
 * resuelve partiendo el titular en el servidor, no con SplitText.
 */

gsap.registerPlugin(ScrollTrigger);

/** La capa ya arrancó: el temporizador de rescate del `<head>` sobra. */
function cancelWatchdog(): void {
  const id: unknown = Reflect.get(window, ANIMATION_WATCHDOG_KEY);
  if (typeof id === 'number') window.clearTimeout(id);
}

/** RA-01 · el titular entra palabra por palabra y el resto se encadena. */
function animateHero(): void {
  const words = document.querySelectorAll('[data-hero-headline] .word > span');
  if (words.length === 0) return;

  gsap
    .timeline({ defaults: { ease: HERO.ease } })
    .to(words, { y: '0%', duration: HERO.wordDuration, stagger: HERO.wordStagger })
    .to('[data-hero-follow]', {
      opacity: 1,
      y: 0,
      duration: HERO.followDuration,
      stagger: HERO.wordStagger,
    }, HERO.overlap);
}

/** RA-02 · una timeline por sección, disparada al entrar al viewport. */
function revealSections(): void {
  for (const root of document.querySelectorAll('[data-reveal-root]')) {
    const pieces = root.querySelectorAll('[data-anim]');
    if (pieces.length === 0) continue;

    gsap.to(pieces, {
      opacity: 1,
      y: 0,
      duration: REVEAL.duration,
      stagger: REVEAL.stagger,
      ease: REVEAL.ease,
      scrollTrigger: { trigger: root, start: REVEAL.start },
    });
  }
}

/** RA-03 · la pista se duplica y se corre media vuelta: bucle sin salto. */
function loopMarquee(): void {
  const track = document.querySelector('[data-marquee-track]');
  if (track === null) return;

  track.innerHTML += track.innerHTML;
  gsap.to(track, { xPercent: -50, duration: MARQUEE.duration, ease: MARQUEE.ease, repeat: -1 });
}

/** RA-04 · la barra se esconde al bajar y vuelve al subir. */
function hideNavBarOnScroll(): void {
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

/**
 * RA-05 · acordeón con altura animada.
 *
 * Animar `height` es la única excepción autorizada a la regla de animar solo
 * `transform` y `opacity` (`ANIMACION.md` §1): no hay equivalente con
 * `transform` para un contenido de altura desconocida.
 *
 * Se intercepta el clic del `summary` para controlar el tiempo, pero el elemento
 * sigue siendo un `<details>` nativo: el teclado lo abre igual (`SPEC.md` §8.4).
 */
function animateAccordion(): () => void {
  const listeners: (() => void)[] = [];

  for (const item of document.querySelectorAll('[data-accordion-item]')) {
    const body = item.querySelector('[data-accordion-body]');
    const summary = item.querySelector('summary');
    if (body === null || summary === null) continue;

    gsap.set(body, { height: 0 });
    const onClick = (event: Event): void => {
      event.preventDefault();
      toggleAccordionItem(item, body);
    };

    summary.addEventListener('click', onClick);
    listeners.push(() => summary.removeEventListener('click', onClick));
  }

  return () => {
    for (const remove of listeners) remove();
  };
}

function toggleAccordionItem(item: Element, body: Element): void {
  if (item.hasAttribute('open')) {
    gsap.to(body, {
      height: 0,
      duration: ACCORDION.closeDuration,
      ease: ACCORDION.closeEase,
      onComplete: () => item.removeAttribute('open'),
    });
    return;
  }

  item.setAttribute('open', '');
  gsap.fromTo(
    body,
    { height: 0 },
    { height: 'auto', duration: ACCORDION.openDuration, ease: ACCORDION.openEase },
  );
}

/** En móvil no se registran disparadores de scroll: se muestra y ya. */
function revealWithoutScrollTriggers(): void {
  gsap.set('[data-anim]', { opacity: 1, y: 0 });
}

export function AnimationLayer() {
  useLayoutEffect(() => {
    cancelWatchdog();

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    let removeAccordionListeners: () => void = () => undefined;

    const context = gsap.context(() => {
      animateHero();
      removeAccordionListeners = animateAccordion();

      const media = gsap.matchMedia();
      media.add(DESKTOP_QUERY, () => {
        revealSections();
        loopMarquee();
        hideNavBarOnScroll();
      });
      media.add(`(max-width: 767px)`, revealWithoutScrollTriggers);
    });

    return () => {
      removeAccordionListeners();
      context.revert();
    };
  }, []);

  return null;
}
