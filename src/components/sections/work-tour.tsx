'use client';

import { useEffect, useRef } from 'react';

import { REDUCED_MOTION_QUERY } from '@/components/animation/animation-settings';
import { UI_TEXT } from '@/content/ui';

import styles from './works.module.css';

/**
 * El recorrido de un trabajo: la página entregada, bajada de arriba abajo.
 *
 * Es un vídeo sin sonido en bucle, a 1920×1200, con la portada de póster para
 * que no haya salto entre lo que se ve quieto y lo que empieza a moverse.
 *
 * **No se descarga hasta que la sección entra en pantalla.** Entre los dos
 * recorridos hay catorce megas, y el visitante que no llega hasta acá no tiene
 * por qué pagarlos. `preload="none"` evita la descarga inicial y el observador
 * decide cuándo empieza de verdad; al salir de pantalla se pausa, que además
 * ahorra la decodificación de un vídeo que nadie está mirando.
 *
 * **Con `prefers-reduced-motion` no arranca solo.** Un vídeo en bucle es
 * exactamente el tipo de movimiento que esa preferencia pide desactivar, y CSS
 * no puede pararlo: hay que hacerlo acá. En ese caso se pausa y aparecen los
 * controles, así que el recorrido sigue estando disponible — lo que cambia es
 * quién decide cuándo empieza.
 */

/** Basta con que asome un cuarto de la pieza para que valga la pena arrancarlo. */
const VISIBLE_SUFICIENTE = 0.25;

function reproducir(element: HTMLVideoElement, visible: boolean, reducido: boolean): void {
  if (reducido) {
    element.pause();
    element.controls = true;
    return;
  }

  element.controls = false;
  if (visible) void element.play().catch(() => undefined);
  else element.pause();
}

/**
 * Ata el vídeo a dos señales: si está en pantalla y si hay que reducir el
 * movimiento. Devuelve su propia limpieza.
 */
function gobernar(element: HTMLVideoElement): () => void {
  const reducido = window.matchMedia(REDUCED_MOTION_QUERY);
  let visible = false;

  const aplicar = () => {
    reproducir(element, visible, reducido.matches);
  };

  const observador = new IntersectionObserver((entradas) => {
    visible = entradas.some((entrada) => entrada.isIntersecting);
    aplicar();
  }, { threshold: VISIBLE_SUFICIENTE });

  observador.observe(element);
  reducido.addEventListener('change', aplicar);

  return () => {
    observador.disconnect();
    reducido.removeEventListener('change', aplicar);
  };
}

export function WorkTour({
  src,
  poster,
  label,
}: {
  readonly src: string;
  readonly poster: string | null;
  readonly label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    return element === null ? undefined : gobernar(element);
  }, []);

  return (
    <video
      ref={video}
      className={styles['tour']}
      src={src}
      poster={poster ?? undefined}
      aria-label={`${UI_TEXT.tourLabel} ${label}`}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
