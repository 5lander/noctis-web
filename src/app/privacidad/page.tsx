import type { Metadata } from 'next';

import { Container } from '@/components/layout/container';
import { NavBar } from '@/components/layout/nav-bar';
import { SiteFooter } from '@/components/layout/site-footer';
import { PRIVACY } from '@/content/privacy';
import { SITE } from '@/content/site';

import styles from './privacidad.module.css';

/**
 * El aviso de privacidad.
 *
 * Sin barra de navegación con anclas: los enlaces del menú apuntan a secciones
 * de la portada y desde acá no existen. La barra se pinta sin enlaces, que deja
 * el logotipo —que vuelve al inicio— y la llamada a la acción.
 *
 * Es una página de texto y no lleva capa de animación: revelar párrafos al bajar
 * en un aviso legal es movimiento sin motivo, y además dejaría el contenido en
 * opacidad cero si el JavaScript no llega.
 */

export const metadata: Metadata = {
  title: `${PRIVACY.title} · ${SITE.name}`,
  description: PRIVACY.intro,
};

export default function PrivacyPage() {
  return (
    <>
      <NavBar links={[]} />
      <main className={styles['page']}>
        <Container>
          <article className={styles['sheet']}>
            <h1>{PRIVACY.title}</h1>
            <p className={styles['updated']}>{PRIVACY.updated}</p>
            <p className={styles['intro']}>{PRIVACY.intro}</p>

            {PRIVACY.sections.map((section) => (
              <section key={section.id} className={styles['block']}>
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}

            <a className={styles['back']} href={PRIVACY.backHref}>
              {PRIVACY.backLabel}
            </a>
          </article>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
