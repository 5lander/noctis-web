import { Container } from '@/components/layout/container';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { Button } from '@/components/ui/button';
import { SITE } from '@/content/site';
import { NAV_CTA, NAV_LINKS } from '@/content/site-copy';
import { UI_TEXT } from '@/content/ui';

import styles from './nav-bar.module.css';

/**
 * La barra fija con logo, navegación, botón de modo y llamada a la acción.
 *
 * La navegación se oculta por debajo de 1000 px, igual que el prototipo: no hay
 * menú desplegable porque los cuatro destinos son anclas de la misma página y
 * están a un scroll de distancia.
 *
 * Que se esconda al bajar es RA-04, y llega en P3.
 */
export function NavBar() {
  return (
    <header className={styles['bar']}>
      <Container>
        <div className={styles['inner']}>
          <span className={styles['logo']}>{SITE.name}</span>
          <nav className={styles['nav']}>
            {NAV_LINKS.map((link) => (
              <a key={link.id} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <ModeToggle label={UI_TEXT.modeToggle} />
          <Button href={NAV_CTA.href}>{NAV_CTA.label}</Button>
        </div>
      </Container>
    </header>
  );
}
