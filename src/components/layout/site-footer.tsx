import { Container } from '@/components/layout/container';
import { SITE } from '@/content/site';
import { FOOTER } from '@/content/site-copy';

import styles from './site-footer.module.css';

/**
 * El pie repite el titular de portada como cierre (`SPEC.md` §6.11). Es la misma
 * frase a propósito: abre y cierra con la idea que sostiene todo el sitio.
 */
export function SiteFooter() {
  return (
    <footer className={styles['footer']}>
      <Container>
        <p className={styles['phrase']}>{FOOTER.phrase}</p>
        <div className={styles['inner']}>
          <span className={styles['logo']}>{SITE.name}</span>
          <span>{FOOTER.company}</span>
          <span className={styles['rights']}>{FOOTER.rights}</span>
        </div>
      </Container>
    </footer>
  );
}
