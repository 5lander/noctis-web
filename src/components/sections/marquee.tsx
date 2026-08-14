import { MARQUEE_ITEMS } from '@/content/site-copy';

import styles from './marquee.module.css';

/**
 * La banda de servicios. Sin animación todavía: RA-03 la pone en bucle en P3.
 *
 * Es decorativa —repite lo que las secciones ya dicen— y por eso va oculta al
 * lector de pantalla: leer ocho términos sueltos en bucle no aporta nada y
 * estorba bastante.
 */
export function Marquee() {
  return (
    <div className={styles['marquee']} aria-hidden="true">
      <div className={styles['track']}>
        {MARQUEE_ITEMS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
