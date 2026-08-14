import styles from './accordion.module.css';

/**
 * Acordeón sobre `<details>` y `<summary>` nativos.
 *
 * Nativo y no una implementación propia con `aria-expanded` porque el navegador
 * ya trae el comportamiento de teclado, el estado y el anuncio al lector de
 * pantalla. Cualquier versión hecha a mano empieza peor y hay que mantenerla.
 *
 * P3 le anima la altura interceptando el clic del `summary`; el requisito de
 * `SPEC.md` §8.4 es que **siga operable con teclado pese a eso**, y por eso la
 * base tiene que ser esta y no un `div` con un manejador.
 */

export interface AccordionItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export function Accordion({ items }: { readonly items: readonly AccordionItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.id} className={styles['item']}>
          <summary className={styles['summary']}>{item.question}</summary>
          <div className={styles['body']}>
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
