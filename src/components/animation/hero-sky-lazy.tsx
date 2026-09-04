'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';

import { REDUCED_MOTION_QUERY } from './animation-settings';

/**
 * El cargador condicional del cielo.
 *
 * La primera versión de este archivo solo hacía `dynamic(...)`, y eso **no
 * ahorraba nada**: el trozo se pedía igual, apenas unos milisegundos más tarde.
 * Se vio al medir el arranque después del cambio y comprobar que el total de
 * JavaScript no había bajado ni un kilobyte. Que algo esté en otro archivo no
 * significa que no se descargue.
 *
 * Lo que sí ahorra es preguntar **antes** de pedirlo. Las tres condiciones son
 * las mismas que el componente ya usaba para apagarse — solo que ahora se
 * evalúan antes de gastar la descarga, no después:
 *
 * 1. Movimiento reducido pedido por el visitante.
 * 2. Sin contexto WebGL: navegador viejo, GPU en lista negra, máquina virtual.
 * 3. Ahorro de datos activo, que en un Android de gama media con plan prepago es
 *    exactamente el visitante al que no hay que cobrarle 190 KB por un degradado
 *    animado.
 *
 * En los tres casos queda el degradado del CSS, que es lo que se ve igual.
 *
 * Se usa `useSyncExternalStore` y no `useState` + `useEffect` porque escribir
 * estado dentro de un efecto está prohibido por el linter de React 19, y con
 * razón: provoca un segundo render antes de pintar. Acá el servidor siempre
 * responde `false` —no hay cielo en el HTML— y el cliente resuelve la respuesta
 * real en el primer commit, sin render extra.
 */

const HeroSky = dynamic(async () => (await import('./hero-sky')).HeroSky, { ssr: false });

interface SaveDataConnection {
  readonly saveData?: boolean;
}

function prefersLessData(): boolean {
  const connection: SaveDataConnection | undefined = (
    navigator as Navigator & { connection?: SaveDataConnection }
  ).connection;
  return connection?.saveData === true;
}

function supportsWebGl(): boolean {
  try {
    const probe = document.createElement('canvas');
    return probe.getContext('webgl2') !== null || probe.getContext('webgl') !== null;
  } catch {
    return false;
  }
}

/**
 * La respuesta se calcula una sola vez y se guarda.
 *
 * `getSnapshot` tiene que devolver siempre el mismo valor mientras nada cambie:
 * si recalculara el contexto WebGL en cada lectura, React vería un valor nuevo,
 * volvería a renderizar y entraría en bucle. Crear un `<canvas>` de prueba en
 * cada render sería además caro de verdad.
 */
let cached: boolean | null = null;

function readSnapshot(): boolean {
  if (cached !== null) return cached;
  cached =
    !window.matchMedia(REDUCED_MOTION_QUERY).matches && !prefersLessData() && supportsWebGl();
  return cached;
}

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  const handle = (): void => {
    cached = null;
    onChange();
  };
  query.addEventListener('change', handle);
  return () => {
    query.removeEventListener('change', handle);
  };
}

/** En el servidor no hay cielo: el HTML sale con el degradado del CSS y nada más. */
function serverSnapshot(): boolean {
  return false;
}

export function HeroSkyLazy() {
  const worthLoading = useSyncExternalStore(subscribe, readSnapshot, serverSnapshot);
  return worthLoading ? <HeroSky /> : null;
}
