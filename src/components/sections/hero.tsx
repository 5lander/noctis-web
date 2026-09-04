import { HeroSkyLazy } from '@/components/animation/hero-sky-lazy';
import { Container } from '@/components/layout/container';
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
 *
 * **El registro nocturno ya no vive acá.** La portada llevaba seis bloques
 * —titular, bajada, dos botones, el rótulo de lugar y el panel del registro— y
 * medía 1011 px contra un visor de 900: no cabía. La portada es un solo momento,
 * y el registro es contenido que merece su propia sección con sitio para
 * respirar. Está justo debajo, en `<NightLogSection>`.
 *
 * El segundo botón solo aparece si hay trabajos publicados. Antes salía siempre
 * y apuntaba a `#trabajos`, un ancla que no está en el documento cuando el
 * portafolio está vacío: la promesa central del sitio llevaba a la nada.
 */
export function Hero({ showWorksLink }: { readonly showWorksLink: boolean }) {
  return (
    <section className={styles['hero']}>
      <HeroSkyLazy />
      <Container>
        <div className={styles['content']}>
          {/*
            El rótulo entra con el titular y no después: es la primera línea que
            se lee, y llegar tarde a su propia portada la deja pareciendo un
            añadido. Por eso lleva `data-hero-follow` y no un revelado propio.
          */}
          <p className={styles['eyebrow']} data-hero-follow>
            <Label>{HERO.eyebrow}</Label>
          </p>
          <h1 data-hero-headline>{HERO.headline}</h1>
          <p className={styles['support']} data-hero-follow>
            {HERO.support}
          </p>
          <div className={styles['actions']} data-hero-follow>
            <span className={styles['magnet']} data-magnetic>
              <Button href={HERO.primary.href}>{HERO.primary.label}</Button>
            </span>
            {showWorksLink && (
              <Button variant="outline" href={HERO.secondary.href}>
                {HERO.secondary.label}
              </Button>
            )}
          </div>
          {/*
            Debajo de los botones y no encima: es lo que se lee justo antes de
            decidir, y quita las dos objeciones que frenan el clic. Va con
            `data-hero-follow` para entrar en la misma secuencia que la bajada y
            los botones, no como un bloque suelto que aparece después.
          */}
          <p className={styles['reassure']} data-hero-follow>
            {HERO.primary.note}
          </p>
        </div>
      </Container>
    </section>
  );
}
