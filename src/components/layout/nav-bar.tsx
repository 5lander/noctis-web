import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { NAV_CTA } from '@/content/site-copy';
import { UI_TEXT } from '@/content/ui';

import styles from './nav-bar.module.css';

/**
 * La barra: logo, navegación, menú de celular y llamada a la acción.
 *
 * **Ya no lleva conmutador de modo.** El sitio tiene un solo esquema, y un botón
 * que no cambia nada es peor que ninguno: ocupa el sitio contiguo a la llamada a
 * la acción, que es el más caro de la barra.
 *
 * Dos cambios más respecto de lo que había, los dos pedidos y los dos
 * justificados:
 *
 * 1. **Ya no se esconde al bajar.** Queda sobrepuesta y solo se condensa. Ver la
 *    nota de `animation/effects/nav-bar.ts`.
 * 2. **En celular hay menú.** Antes los cuatro enlaces desaparecían por debajo
 *    de 1000 px sin nada que los reemplazara, en una página de once pantallas.
 *
 * Los enlaces llegan por parámetro y no de `content/` directamente porque la
 * sección de trabajos ahora puede no existir —si no hay ninguno publicado, no se
 * pinta— y un enlace a un ancla que no está en el documento no lleva a ninguna
 * parte. Quien compone la página es quien sabe qué secciones hay.
 */

export interface NavLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export function NavBar({ links }: { readonly links: readonly NavLink[] }) {
  return (
    <header className={styles['bar']} data-nav-bar>
      <Container>
        <div className={styles['inner']}>
          <span className={styles['brand']}>
            <Logo />
          </span>
          <nav className={styles['nav']}>
            {links.map((link) => (
              <a key={link.id} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <details className={styles['menu']}>
            <summary aria-label={UI_TEXT.menuToggle}>
              <span />
            </summary>
            <nav className={styles['panel']}>
              {links.map((link) => (
                <a key={link.id} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </details>
          <Button href={NAV_CTA.href}>{NAV_CTA.label}</Button>
        </div>
      </Container>
    </header>
  );
}
