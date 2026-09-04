'use client';

import { useEffect } from 'react';

/**
 * Voltea la barra cuando pasa por encima de una franja invertida.
 *
 * La barra es fija y translúcida, y el cierre del sitio es una franja con el
 * esquema contrario. Sin esto, en modo claro quedaba una barra blanca con texto
 * negro flotando sobre un fondo `#0A0A12`: no se leía como decisión sino como un
 * fallo de maquetación. Pone `data-over="inv"` en la barra y de ahí lo toman
 * `tokens.css` —que le da el juego de tokens invertido— y `logo.module.css`.
 *
 * **No vive en la capa de animación, y es a propósito.** Esa capa no arranca con
 * `prefers-reduced-motion` y en móvil solo revela; el contraste de la barra no
 * es movimiento, es legibilidad, y tiene que funcionar en los tres casos. Por lo
 * mismo usa `IntersectionObserver` y no una escucha de scroll: el navegador
 * avisa cuando hay cruce en vez de preguntar en cada cuadro.
 *
 * El truco del observador es el `rootMargin` inferior: recorta la raíz hasta
 * dejar solo la banda que ocupa la barra, así que "intersecar" significa
 * literalmente "está debajo de la barra". Como depende del alto de la ventana,
 * se rearma al cambiar de tamaño.
 */

const NAV_HEIGHT = 66;
const INVERTED_SECTION = '.inv';
const BAR = '[data-nav-bar]';
const OVER = 'inv';

function observeInvertedBands(): () => void {
  // Sin argumento de tipo entre ángulos: la prueba que persigue texto suelto en
  // JSX lee los genéricos como etiquetas y marca el archivo entero.
  const bar = document.querySelector(BAR);
  const bands = [...document.querySelectorAll(INVERTED_SECTION)];
  if (!(bar instanceof HTMLElement) || bands.length === 0) return () => undefined;

  const covered = new Set<Element>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) covered.add(entry.target);
        else covered.delete(entry.target);
      }
      if (covered.size > 0) bar.dataset['over'] = OVER;
      else delete bar.dataset['over'];
    },
    { rootMargin: `0px 0px -${Math.max(window.innerHeight - NAV_HEIGHT, 0)}px 0px` },
  );

  for (const band of bands) observer.observe(band);

  return () => {
    observer.disconnect();
    delete bar.dataset['over'];
  };
}

export function NavContrast() {
  useEffect(() => {
    let release = observeInvertedBands();

    const rebuild = () => {
      release();
      release = observeInvertedBands();
    };

    window.addEventListener('resize', rebuild);

    return () => {
      window.removeEventListener('resize', rebuild);
      release();
    };
  }, []);

  return null;
}
