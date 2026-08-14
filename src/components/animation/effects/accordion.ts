import { ACCORDION } from '../animation-settings';
import { gsap } from '../gsap-plugins';

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

const CLOSED = 0;

export function animateAccordion(): () => void {
  const listeners: (() => void)[] = [];

  for (const item of document.querySelectorAll('[data-accordion-item]')) {
    const body = item.querySelector('[data-accordion-body]');
    const summary = item.querySelector('summary');
    if (body === null || summary === null) continue;

    gsap.set(body, { height: CLOSED });
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
      height: CLOSED,
      duration: ACCORDION.closeDuration,
      ease: ACCORDION.closeEase,
      onComplete: () => item.removeAttribute('open'),
    });
    return;
  }

  item.setAttribute('open', '');
  gsap.fromTo(
    body,
    { height: CLOSED },
    { height: 'auto', duration: ACCORDION.openDuration, ease: ACCORDION.openEase },
  );
}
