/**
 * Marca el documento como "va a haber animación", antes del primer pintado.
 *
 * El problema que resuelve es el que el prototipo tiene abierto: si el estado
 * inicial de los elementos animados vive en CSS a secas, **con JavaScript
 * deshabilitado la página se queda en blanco**, y RN11 dice que la página tiene
 * que ser legible sin JavaScript.
 *
 * Por eso el estado inicial cuelga de `html.animation-ready`, y esta clase solo
 * la pone JavaScript. Sin JavaScript, no hay clase y todo se ve.
 *
 * Falta el segundo caso: que la clase se ponga y después el paquete de la
 * animación no llegue a ejecutarse. Ahí el contenido quedaría escondido para
 * siempre. De eso se encarga el temporizador: si en tres segundos nadie reclamó
 * las animaciones, la clase se quita y se ve todo. La capa de animación lo
 * cancela apenas arranca.
 */

export const ANIMATION_READY_CLASS = 'animation-ready';
export const ANIMATION_WATCHDOG_KEY = '__noctisAnimacionVigilante';
const WATCHDOG_MS = 3000;

export const ANIMATION_READY_SCRIPT = [
  '(function(){try{',
  'var r=document.documentElement;',
  `r.classList.add(${JSON.stringify(ANIMATION_READY_CLASS)});`,
  `window[${JSON.stringify(ANIMATION_WATCHDOG_KEY)}]=setTimeout(function(){`,
  `r.classList.remove(${JSON.stringify(ANIMATION_READY_CLASS)});`,
  `},${String(WATCHDOG_MS)});`,
  '}catch(e){}})()',
].join('');
