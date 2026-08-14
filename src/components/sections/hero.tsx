import { Container } from '@/components/layout/container';
import { NightLog } from '@/components/sections/night-log';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HERO } from '@/content/site-copy';

import styles from './hero.module.css';

/**
 * La portada: el único `h1` de la página (`SPEC.md` §8.6).
 *
 * El titular se parte en palabras **en el servidor** y no con JavaScript, que es
 * lo que hace el prototipo. Dos razones: el HTML sale ya partido, así que no hay
 * un instante con el titular entero antes de reorganizarse; y no hace falta
 * `SplitText`, cuya licencia sigue sin confirmarse (D15, 🔴).
 *
 * Cada palabra va en un contenedor con `overflow: hidden` para la máscara de
 * RA-01. Sin JavaScript no hay clase `animation-ready` y se ve normal.
 */
function Headline({ text }: { readonly text: string }) {
  return (
    <h1 data-hero-headline>
      {text.split(' ').map((word, index) => (
        <span key={`${word}-${String(index)}`} className="word">
          <span>{word}</span>
          {index < text.split(' ').length - 1 ? ' ' : ''}
        </span>
      ))}
    </h1>
  );
}

export function Hero() {
  return (
    <section className={styles['hero']}>
      <Container>
        <Headline text={HERO.headline} />
        <p className={styles['support']} data-hero-follow>
          {HERO.support}
        </p>
        <div className={styles['actions']} data-hero-follow>
          <Button href={HERO.primary.href}>{HERO.primary.label}</Button>
          <Button variant="outline" href={HERO.secondary.href}>
            {HERO.secondary.label}
          </Button>
        </div>
        <div className={styles['foot']}>
          <span data-hero-follow>
            <Label>{HERO.place}</Label>
          </span>
          <NightLog />
        </div>
      </Container>
    </section>
  );
}
