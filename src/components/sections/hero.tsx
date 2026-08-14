import { HeroSky } from '@/components/animation/hero-sky';
import { Container } from '@/components/layout/container';
import { NightLog } from '@/components/sections/night-log';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HERO } from '@/content/site-copy';

import styles from './hero.module.css';

/**
 * La portada: el único `h1` de la página (`SPEC.md` §8.6).
 *
 * El titular sale entero del servidor y lo parte `SplitText` en líneas al
 * arrancar la capa de animación (RA-01). Hasta la v1 se partía en palabras acá
 * mismo para no depender del plugin, cuya licencia estaba sin confirmar; con
 * D15 cerrado (ADR-0012) el corte por líneas es del plugin y este componente
 * vuelve a ser lo que debía: HTML plano. Sin JavaScript no hay clase
 * `animation-ready` y el titular se ve normal.
 *
 * El cielo WebGL va **detrás** de todo y no aporta contenido: si no arranca,
 * queda el degradado del CSS y la portada se lee igual.
 *
 * El botón principal es el único elemento magnético del sitio (RA-09): la
 * técnica solo se sostiene si es escasa.
 */
export function Hero() {
  return (
    <section className={styles['hero']}>
      <HeroSky />
      <Container>
        <div className={styles['content']}>
          <h1 data-hero-headline>{HERO.headline}</h1>
          <p className={styles['support']} data-hero-follow>
            {HERO.support}
          </p>
          <div className={styles['actions']} data-hero-follow>
            <span className={styles['magnet']} data-magnetic>
              <Button href={HERO.primary.href}>{HERO.primary.label}</Button>
            </span>
            <Button variant="outline" href={HERO.secondary.href}>
              {HERO.secondary.label}
            </Button>
          </div>
          <div className={styles['foot']}>
            <span data-hero-follow>
              <Label>{HERO.place}</Label>
            </span>
            <span className={styles['log']} data-parallax="0.06">
              <NightLog />
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
