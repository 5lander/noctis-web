import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { FOOTER } from '@/content/site-copy';

import styles from './site-footer.module.css';

/**
 * El pie repite el titular de portada como cierre (`SPEC.md` §6.11). Es la misma
 * frase a propósito: abre y cierra con la idea que sostiene todo el sitio.
 */
export function SiteFooter() {
  return (
    <footer className={styles['footer']} data-reveal-root>
      <Container>
        <p className={styles['phrase']} data-anim>{FOOTER.phrase}</p>
        <div className={styles['inner']}>
          <Logo />
          <span>{FOOTER.company}</span>
          <span className={styles['rights']}>{FOOTER.rights}</span>
        </div>
      </Container>
    </footer>
  );
}
