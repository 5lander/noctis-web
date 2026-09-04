import { Container } from '@/components/layout/container';
import { NightLog } from '@/components/sections/night-log';
import { Label } from '@/components/ui/label';
import { HERO } from '@/content/site-copy';

import styles from './night-log-section.module.css';

/**
 * El registro nocturno, ahora como banda propia debajo de la portada.
 *
 * Estaba dentro de la portada y era el sexto bloque de un momento que admite
 * cuatro: entre el titular, la bajada, los dos botones, el rótulo de lugar y
 * este panel, la portada medía 1011 px contra un visor de 900 y los botones se
 * iban al borde. Sacarlo no le quita nada al contenido: le da sitio.
 *
 * La banda no lleva titular a propósito. No es una sección de las que el menú
 * nombra —es la ilustración de lo que dice el titular de arriba— y ponerle uno
 * la convertiría en un apartado más de la página.
 *
 * El rótulo de lugar viene con el registro porque los dos dicen lo mismo: dónde
 * está la empresa y a qué hora sigue trabajando el sistema. Es el único rótulo
 * en versalita que queda en toda la página, y por eso puede quedarse.
 */
export function NightLogSection() {
  return (
    // `data-reveal-root` no es decorativo: el revelado genérico solo recorre las
    // raíces marcadas, así que sin él el rótulo se quedaba en opacidad cero para
    // siempre en vez de aparecer al entrar en pantalla.
    <section className={styles['band']} data-reveal-root>
      <Container>
        <div className={styles['inner']}>
          <span className={styles['place']} data-anim>
            <Label>{HERO.place}</Label>
          </span>
          <span className={styles['log']} data-parallax="0.06">
            <NightLog />
          </span>
        </div>
      </Container>
    </section>
  );
}
