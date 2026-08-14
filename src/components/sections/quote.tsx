import { Container } from '@/components/layout/container';
import { QUOTE } from '@/content/site-copy';

import styles from './quote.module.css';

/**
 * El testimonio.
 *
 * **Mientras `QUOTE.pending` sea verdadero, la sección no se pinta.** El
 * nombre y el cargo reales son C2 de `DECISIONES.md`, y publicar un testimonio
 * firmado por `[Nombre del cliente]` es peor que no tener testimonio: dice que
 * el sitio se armó con relleno.
 *
 * Cuando llegue el dato real, se cambia `pending` a `false` en `content/`. Este
 * archivo no se toca.
 */
export function Quote() {
  if (QUOTE.pending) return null;

  return (
    <section className={styles['quote']} data-reveal-root>
      <Container>
        <blockquote data-anim>{`“${QUOTE.text}”`}</blockquote>
        <p className={styles['attribution']}>
          <b>{QUOTE.author}</b>
          {QUOTE.role}
        </p>
      </Container>
    </section>
  );
}
