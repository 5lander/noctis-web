/**
 * Los parámetros de `docs/ANIMACION.md` v2, en un solo lugar.
 *
 * Hasta la v1 el criterio salía del análisis de Squarespace: subidas de opacidad
 * casi sin desplazamiento y nada que se notara como efecto. La v2 cambia el
 * criterio —el sitio ahora quiere que el movimiento se note, en la línea del
 * showcase de GSAP— y por eso aparecen anclaje, barrido y suavizado. Lo que no
 * cambia es dónde viven los números: acá, y no repartidos por el código, para
 * que ajustar el ritmo del sitio sea tocar un archivo y no doce.
 *
 * Cada bloque nombra el requisito de `ANIMACION.md` que implementa.
 */

/** RA-02 · revelado por sección. */
export const REVEAL = {
  distance: 18,
  duration: 1,
  stagger: 0.09,
  ease: 'power3.out',
  start: 'top 78%',
} as const;

/** RA-01 · entrada de portada, ahora partida por líneas con máscara. */
export const HERO = {
  /** Cada línea parte una altura completa por debajo de su máscara. */
  lineFromPercent: 105,
  lineDuration: 1.05,
  lineStagger: 0.075,
  followDuration: 0.9,
  followStagger: 0.055,
  /** Cada elemento arranca antes de que termine el anterior (RA-01). */
  overlap: '-=0.65',
  ease: 'power3.out',
} as const;

/** RA-03 · marquesina, ahora reactiva a la dirección y a la velocidad. */
export const MARQUEE = {
  duration: 26,
  ease: 'none',
  /** Cuánto acelera como máximo cuando el scroll va rápido. */
  maxTimeScale: 5,
  restTimeScale: 1,
  /** Divisor de la velocidad de scroll: más alto, menos reactiva. */
  velocityDivisor: 420,
  /** Cuánto tarda en volver a su ritmo cuando el scroll se detiene. */
  settleDuration: 0.9,
  settleEase: 'power2.out',
} as const;

/** RA-04 · barra que se esconde al bajar. */
export const NAV_BAR = {
  threshold: 140,
  duration: 0.4,
  ease: 'power2.out',
  /** Una altura completa hacia arriba: la barra sale de pantalla, no se encoge. */
  hiddenYPercent: -100,
  visibleYPercent: 0,
} as const;

/** RA-05 · acordeón. */
export const ACCORDION = {
  openDuration: 0.5,
  closeDuration: 0.45,
  openEase: 'power2.out',
  closeEase: 'power2.inOut',
} as const;

/** RA-08 · suavizado de scroll. Apagado en táctil: ahí estorba más de lo que suma. */
export const SMOOTH = {
  smooth: 1.15,
  smoothTouch: 0,
  effects: true,
  /** Dónde aterriza un ancla: por debajo de la barra fija, no tapada por ella. */
  anchorPosition: 'top 90px',
} as const;

/** RA-09 · botón magnético. */
export const MAGNETIC = {
  /** Fracción de la distancia al puntero que recorre el botón. */
  strength: 0.32,
  /** Radio de captura, en píxeles alrededor del borde del botón. */
  radius: 110,
  duration: 0.45,
  releaseDuration: 0.6,
  ease: 'power3.out',
  releaseEase: 'elastic.out(1, 0.45)',
} as const;

/** RA-10 · inclinación por velocidad de scroll. Techo de 7 grados: más, marea. */
export const SKEW = {
  maxDegrees: 7,
  /** Cuánto espera sin scroll antes de enderezarse: sin esto se queda torcida. */
  settleDelay: 0.12,
  velocityDivisor: 320,
  duration: 0.55,
  ease: 'power3.out',
} as const;

/** RA-11 · grilla de trabajos: onda desde el centro y cortina de portada. */
export const WORKS = {
  gridColumns: 3,
  waveAmount: 0.16,
  waveDuration: 0.95,
  waveEase: 'power3.out',
  waveStart: 'top 82%',
  curtainDuration: 1.15,
  curtainEase: 'power4.out',
  /** Estado de partida de la cortina: la portada tapada desde abajo. */
  curtainFrom: 'inset(0% 0% 100% 0%)',
  curtainTo: 'inset(0% 0% 0% 0%)',
} as const;

/** RA-12 · panel fijo del proceso, con el trazo que se dibuja. */
export const PROCESS = {
  /**
   * Cuánto scroll dura el anclaje, en alturas de pantalla.
   *
   * Estaba en 140% y sobraba: con tres pasos y un trazo, la secuencia terminaba
   * de contarse a media altura y el resto era pantalla anclada sin nada nuevo
   * que mirar. Una sección anclada cobra su precio en scroll, y el precio tiene
   * que corresponder a lo que se está contando.
   */
  pinDistance: '+=90%',
  scrub: 1,
  stepDuration: 1,
  stepEase: 'power2.inOut',
  lineDuration: 3,
  lineEase: 'none',
} as const;

/** RA-13 · parallax por capas. La profundidad la declara cada elemento. */
export const PARALLAX = {
  defaultDepth: 0.12,
  scrub: true,
  ease: 'none',
  /** Multiplicador de la profundidad declarada, en porcentaje de altura. */
  travelPercent: 100,
} as const;

/** RA-14 · cursor personalizado de la grilla. Solo con puntero fino. */
export const CURSOR = {
  followDuration: 0.5,
  ease: 'power3',
  hoverScale: 3.4,
  restScale: 1,
  scaleDuration: 0.4,
  scaleEase: 'power3.out',
} as const;

/**
 * Contador de la banda de cifras.
 *
 * `power2.out` y no lineal: un contador que sube a velocidad constante se lee
 * como un reloj. Con la salida amortiguada arranca rápido, frena cerca del
 * final y el número queda como si se hubiera asentado.
 *
 * `start` es más tardío que el del revelado genérico porque la cifra tiene que
 * empezar a subir cuando el visitante ya la está mirando, no antes.
 */
export const COUNTER = {
  duration: 1.5,
  ease: 'power2.out',
  start: 'top 78%',
} as const;

/** RA-07 · cielo WebGL de la portada. */
export const SKY = {
  /** Techo de densidad de píxeles: más allá se paga mucho y no se ve. */
  maxPixelRatio: 1.5,
  /** Cuánto sigue el cielo al puntero, en unidades de pantalla. */
  pointerStrength: 0.18,
  pointerEase: 0.045,
  /** Velocidad del tiempo del shader. */
  timeScale: 0.35,
  fadeInSeconds: 1.6,
} as const;

/**
 * Corte de móvil de `ANIMACION.md` §4: la entrada de portada se conserva, el
 * resto se simplifica. Por debajo de este ancho no hay anclaje, ni suavizado,
 * ni cursor, ni cielo: en un teléfono cuestan batería y aportan poco.
 */
export const DESKTOP_QUERY = '(min-width: 768px)';
export const MOBILE_QUERY = '(max-width: 767px)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
