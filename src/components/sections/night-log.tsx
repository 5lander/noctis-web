'use client';

import { useEffect, useState } from 'react';

import { REDUCED_MOTION_QUERY } from '@/components/animation/animation-settings';
import { NIGHT_LOG, NIGHT_LOG_INTERVAL_MS, NIGHT_LOG_VISIBLE } from '@/content/night-log';

import styles from './night-log.module.css';

/**
 * El registro nocturno de la portada: la idea del sitio, hecha imagen.
 *
 * Renderiza las primeras cuatro filas en el servidor y va rotando. Con
 * movimiento reducido **no rota**: se quedan las cuatro primeras, que es
 * contenido igual de completo (`ANIMACION.md` §4).
 *
 * Va con `aria-hidden`: es decorativo y lo que dice ya está en el titular.
 */

function windowOf(offset: number): readonly { time: string; event: string }[] {
  return Array.from({ length: NIGHT_LOG_VISIBLE }, (_unused, position) => {
    const entry = NIGHT_LOG[(offset + position) % NIGHT_LOG.length];
    return entry ?? { time: '', event: '' };
  });
}

export function NightLog() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;

    const timer = window.setInterval(() => {
      setOffset((previous) => (previous + 1) % NIGHT_LOG.length);
    }, NIGHT_LOG_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles['log']} aria-hidden="true">
      {windowOf(offset).map((entry, position) => (
        <div
          key={entry.time}
          className={
            position === NIGHT_LOG_VISIBLE - 1 ? `${styles['row']} ${styles['current']}` : styles['row']
          }
        >
          <span>{entry.time}</span>
          <span>{entry.event}</span>
        </div>
      ))}
    </div>
  );
}
