import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NOT_FOUND } from '@/content/site-copy';

import styles from './not-found.module.css';

/**
 * El 404 del sitio.
 *
 * `app/not-found.tsx` no atiende solo a `notFound()`: Next lo usa para **toda**
 * dirección que no resuelve, así que es la pantalla real de quien escribió mal
 * un enlace o siguió uno viejo. Antes salía la de Next —fondo claro, tipografía
 * del sistema, en inglés—, que en un sitio de un solo esquema oscuro se lee como
 * una página de otra empresa.
 *
 * Va sin barra de navegación a propósito. Los enlaces del menú son anclas a
 * secciones de la portada, y desde acá ninguno resuelve: apuntarían a `#`
 * inexistentes en este documento y no harían nada. Dos botones que sí llevan a
 * algún lado valen más que siete que no.
 */
export default function NotFound() {
  return (
    <main className={styles['page']}>
      <Container>
        <div className={styles['block']}>
          <span className={styles['mark']}>
            <Logo />
          </span>
          <div className={styles['eyebrow']}>
            <Label>{NOT_FOUND.eyebrow}</Label>
          </div>
          <h1 className={styles['title']}>{NOT_FOUND.title}</h1>
          <p className={styles['support']}>{NOT_FOUND.support}</p>
          <div className={styles['actions']}>
            <Button href="/">{NOT_FOUND.home}</Button>
            <Button href="/#contacto" variant="outline">
              {NOT_FOUND.contact}
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
