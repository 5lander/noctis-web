import { COUNTER } from '../animation-settings';
import { gsap } from '../gsap-plugins';

/**
 * Las cifras de la banda de prueba suben hasta su valor al entrar en pantalla.
 *
 * **El servidor ya pinta el número final.** Este efecto no lo crea: lo baja a
 * cero en el instante en que la banda entra y lo vuelve a subir. Por eso la
 * página sin JavaScript, con movimiento reducido o en móvil enseña la cifra
 * correcta desde el primer byte, que es lo que pide RN11.
 *
 * **`immediateRender: false` es lo que sostiene ese párrafo, y sin él era
 * mentira.** ScrollTrigger renderiza el estado inicial de su tween al crearlo,
 * para que el elemento espere en su posición de partida. Con un `to` normal eso
 * escribía «0» en las cuatro cifras nada más cargar la página, mucho antes de
 * que la banda entrara en pantalla: quien bajaba despacio veía cuatro ceros. Con
 * `fromTo` e `immediateRender: false`, el valor de partida no se aplica hasta
 * que el disparador dispara de verdad.
 *
 * Se anima un objeto y no el nodo: GSAP interpola números, no texto. `onUpdate`
 * es lo que escribe el resultado redondeado en cada fotograma.
 */

const FROM = 0;

function countUp(element: Element, target: number): void {
  const state = { value: FROM };

  gsap.fromTo(
    state,
    { value: FROM },
    {
      value: target,
      duration: COUNTER.duration,
      ease: COUNTER.ease,
      immediateRender: false,
      scrollTrigger: { trigger: element, start: COUNTER.start, once: true },
      onUpdate: () => {
        element.textContent = String(Math.round(state.value));
      },
    },
  );
}

export function countFigures(): void {
  for (const element of document.querySelectorAll('[data-count]')) {
    const target = Number(element.getAttribute('data-count'));
    // Un atributo que no es un número no es un caso de error: es una cifra que
    // alguien escribió mal, y lo correcto es dejarla como está en el HTML.
    if (Number.isFinite(target)) countUp(element, target);
  }
}
