/**
 * Los parámetros de `ANIMACION.md` §1 y §3, en un solo lugar.
 *
 * Salen del análisis de Squarespace que hizo el propio documento: subidas de
 * opacidad casi sin desplazamiento, cascada corta y duraciones por encima del
 * segundo. Están acá y no repartidos por el código para que ajustar el ritmo del
 * sitio sea tocar un archivo, no ocho.
 */

export const REVEAL = {
  distance: 18,
  duration: 1,
  stagger: 0.09,
  ease: 'power3.out',
  start: 'top 78%',
} as const;

export const HERO = {
  wordDuration: 1.05,
  wordStagger: 0.055,
  followDuration: 0.9,
  /** Cada elemento arranca antes de que termine el anterior (RA-01). */
  overlap: '-=0.65',
  ease: 'power3.out',
} as const;

export const MARQUEE = { duration: 26, ease: 'none' } as const;

export const NAV_BAR = {
  threshold: 140,
  duration: 0.4,
  ease: 'power2.out',
  /** Una altura completa hacia arriba: la barra sale de pantalla, no se encoge. */
  hiddenYPercent: -100,
  visibleYPercent: 0,
} as const;

export const ACCORDION = {
  openDuration: 0.5,
  closeDuration: 0.45,
  openEase: 'power2.out',
  closeEase: 'power2.inOut',
} as const;

/**
 * Corte de móvil de `ANIMACION.md` §4: la entrada de portada se conserva, el
 * resto se simplifica. Por debajo de este ancho no se registran disparadores de
 * scroll: en un teléfono cuestan batería y aportan poco.
 */
export const DESKTOP_QUERY = '(min-width: 768px)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
