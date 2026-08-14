import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HERO } from '@/content/site-copy';

import styles from './hero.module.css';

/**
 * La portada: el único `h1` de la página (`SPEC.md` §8.6).
 *
 * El registro nocturno decorativo del prototipo lo genera JavaScript y llega en
 * P3 con la capa de animación. No se deja un contenedor vacío esperándolo: si
 * hoy no hay nada que mostrar, no hay elemento.
 */
export function Hero() {
  return (
    <section className={styles['hero']}>
      <Container>
        <h1>{HERO.headline}</h1>
        <p className={styles['support']}>{HERO.support}</p>
        <div className={styles['actions']}>
          <Button href={HERO.primary.href}>{HERO.primary.label}</Button>
          <Button variant="outline" href={HERO.secondary.href}>
            {HERO.secondary.label}
          </Button>
        </div>
        <div className={styles['foot']}>
          <Label>{HERO.place}</Label>
        </div>
      </Container>
    </section>
  );
}
