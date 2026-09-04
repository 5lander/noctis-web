import Image from 'next/image';

import { Section } from '@/components/layout/section';
import { DESIGN_LANGUAGES } from '@/content/design-languages';
import { HEADINGS } from '@/content/site-copy';

import styles from './design-languages.module.css';

/**
 * Los cuatro lenguajes de diseño, cada uno con su tablero.
 *
 * El porqué de la sección está en `content/design-languages.ts`. Acá solo dos
 * decisiones de presentación:
 *
 * 1. **La imagen manda y el texto acompaña.** Es la única sección de la página
 *    donde lo que convence es lo que se ve, no lo que se lee: el nombre y la
 *    línea de uso van debajo, pequeños, sin competir con el tablero.
 * 2. **Cuatro piezas en dos columnas**, que llena la rejilla exacta. Con un
 *    número que no fuera par habría que repartirla de otra forma, igual que en
 *    servicios y en trabajos.
 */
const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 900;
const BOARD_SIZES = '(max-width: 760px) 100vw, 50vw';

export function DesignLanguages() {
  return (
    <Section id="lenguajes" heading={HEADINGS.languages}>
      <ul className={styles['grid']}>
        {DESIGN_LANGUAGES.map((language) => (
          <li key={language.id} className={styles['language']} data-anim>
            <div className={styles['board']}>
              <Image
                src={language.board.src}
                alt={language.board.alt}
                width={BOARD_WIDTH}
                height={BOARD_HEIGHT}
                sizes={BOARD_SIZES}
              />
            </div>
            <h3>{language.name}</h3>
            <p>{language.fit}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
