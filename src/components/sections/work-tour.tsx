'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

import { REDUCED_MOTION_QUERY } from '@/components/animation/animation-settings';
import { UI_TEXT } from '@/content/ui';

import styles from './works.module.css';

/**
 * El recorrido de un trabajo: la página entregada, bajada de arriba abajo.
 *
 * Es un vídeo sin sonido en bucle, a 1920×1200, con la portada de póster para
 * que no haya salto entre lo que se ve quieto y lo que empieza a moverse.
 *
 * **Arranca con un clic y no al entrar en pantalla.** Antes se reproducía solo
 * en cuanto asomaba un cuarto de la pieza, así que con dos trabajos publicados
 * había dos páginas desplazándose a la vez mientras el visitante intentaba leer
 * la ficha de al lado. Dos movimientos simultáneos que nadie pidió no son
 * demostración, son distracción. Ahora se mueve el que se toca y el resto queda
 * quieto en su portada.
 *
 * De paso resuelve solo lo que antes necesitaba una rama aparte: si nada arranca
 * hasta que alguien lo pide, `prefers-reduced-motion` ya está respetado. A quien
 * la tiene activada se le dan además los controles nativos, para que pueda
 * pausar y adelantar con una interfaz que ya conoce.
 *
 * **No se descarga hasta que se pide.** Entre los dos recorridos hay catorce
 * megas, y con `preload="none"` el visitante que no toca ninguno no paga ni uno.
 */

/**
 * Detiene el recorrido cuando sale de pantalla y lo devuelve al principio.
 * **Nunca lo arranca**: esa decisión es del visitante y de nadie más.
 *
 * **Esto era un `IntersectionObserver` y no funcionaba.** Vale la pena dejarlo
 * escrito porque el fallo era invisible y la herramienta era la obvia: la página
 * usa ScrollSmoother, que no desplaza el contenido sino que lo mueve con un
 * `transform` sobre `#smooth-content`. Un observador de intersección no mira las
 * transformaciones de un ancestro —se comprobó con uno propio sobre el mismo
 * vídeo: avisó una sola vez al crearse, y siguió callado mientras el elemento
 * pasaba de +2974px a −9203px—, así que el recorrido seguía andando a nueve mil
 * píxeles de la vista, gastando batería y decodificación por nada.
 *
 * La comprobación va colgada de `timeupdate`, que el propio vídeo dispara unas
 * cuatro veces por segundo **mientras se reproduce**. Eso da dos cosas de una:
 * ve el movimiento por transformación, porque `getBoundingClientRect` sí lo
 * refleja; y no cuesta absolutamente nada cuando no hay nada andando, que es el
 * estado normal de la página.
 *
 * Rebobinar no es limpieza. Antes solo pausaba, así que un recorrido que alguien
 * tocó y dejó atrás quedaba congelado a mitad de la página entregada; al volver a
 * subir, la tarjeta ya no mostraba su portada sino un fotograma cualquiera del
 * medio, y eso se lee como que el vídeo arrancó por su cuenta.
 */
function estaFueraDePantalla(element: HTMLVideoElement): boolean {
  const marco = element.getBoundingClientRect();
  return marco.bottom <= 0 || marco.top >= window.innerHeight;
}

function detenerAlSalir(element: HTMLVideoElement): () => void {
  const revisar = (): void => {
    if (!estaFueraDePantalla(element)) return;
    element.pause();
    element.currentTime = 0;
  };

  element.addEventListener('timeupdate', revisar);
  return () => {
    element.removeEventListener('timeupdate', revisar);
  };
}

/** La preferencia puede cambiar con la página abierta, así que se escucha. */
function seguirMovimientoReducido(aplicar: (reducido: boolean) => void): () => void {
  const consulta = window.matchMedia(REDUCED_MOTION_QUERY);
  const alCambiar = () => {
    aplicar(consulta.matches);
  };

  alCambiar();
  consulta.addEventListener('change', alCambiar);
  return () => {
    consulta.removeEventListener('change', alCambiar);
  };
}

/** Las dos señales que gobiernan la pieza, atadas al nodo y con su limpieza. */
function useRecorrido(video: RefObject<HTMLVideoElement | null>): {
  readonly reducido: boolean;
  readonly alternar: () => void;
} {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (element === null) return undefined;

    const soltarVigilancia = detenerAlSalir(element);
    const soltarPreferencia = seguirMovimientoReducido(setReducido);

    return () => {
      soltarVigilancia();
      soltarPreferencia();
    };
  }, [video]);

  return {
    reducido,
    alternar: () => {
      const element = video.current;
      if (element === null) return;
      if (element.paused) void element.play().catch(() => undefined);
      else element.pause();
    },
  };
}

/**
 * Cubre la pieza entera: el gesto natural es tocar la imagen, no buscar un
 * control en una esquina. Es un `<button>` de verdad y no un `onClick` sobre el
 * vídeo, para que llegue por teclado y se anuncie con su rótulo.
 */
function BotonRecorrido({
  quieto,
  label,
  onClick,
}: {
  readonly quieto: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  const accion = quieto ? UI_TEXT.tourPlay : UI_TEXT.tourPause;

  return (
    <button
      type="button"
      className={styles['play']}
      data-quieto={quieto ? 'true' : undefined}
      onClick={onClick}
      aria-label={`${accion} ${label}`}
    >
      <span className={styles['playIcon']} aria-hidden="true" />
    </button>
  );
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
  const [quieto, setQuieto] = useState(true);
  const { reducido, alternar } = useRecorrido(video);

  return (
    <>
      <video
        ref={video}
        className={styles['tour']}
        src={src}
        poster={poster ?? undefined}
        aria-label={`${UI_TEXT.tourLabel} ${label}`}
        controls={reducido}
        muted
        loop
        playsInline
        preload="none"
        onPlay={() => {
          setQuieto(false);
        }}
        onPause={() => {
          setQuieto(true);
        }}
      />
      {/* Con movimiento reducido manda la barra nativa: una capa encima la taparía. */}
      {!reducido && <BotonRecorrido quieto={quieto} label={label} onClick={alternar} />}
    </>
  );
}
