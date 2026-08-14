import Image from 'next/image';

import { Section } from '@/components/layout/section';
import { HEADINGS } from '@/content/site-copy';
import type { Work, WorkCover, WorkTreatment } from '@/content/types';
import { WORKS } from '@/content/works';

import styles from './works.module.css';

/**
 * La grilla de seis trabajos.
 *
 * El componente acepta **portada tipográfica o imagen** desde hoy, aunque los
 * seis trabajos actuales sean marcadores de posición. Ese es el criterio de
 * aceptación de P10: cuando lleguen las capturas reales (C1) se cambia
 * `content/works.ts` y **este archivo no se toca**.
 */

const TREATMENT_CLASS: Readonly<Record<WorkTreatment, string>> = {
  plain: '',
  inverted: 'inverted',
  italic: 'italic',
  uppercase: 'uppercase',
};

function canvasClassName(cover: WorkCover): string {
  if (cover.kind === 'image') return `${styles['canvas']}`;
  const treatment = TREATMENT_CLASS[cover.treatment];
  return treatment === '' ? `${styles['canvas']}` : `${styles['canvas']} ${styles[treatment]}`;
}

/** El lienzo es `position: relative`, así que `fill` recorta y escala solo. */
const IMAGE_SIZES = '(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 33vw';

function Cover({ cover }: { readonly cover: WorkCover }) {
  if (cover.kind === 'image') {
    return (
      <Image className={styles['image']} src={cover.src} alt={cover.alt} fill sizes={IMAGE_SIZES} />
    );
  }

  return (
    <span className={styles['mark']}>
      {cover.lines.map((line, index) => (
        <span key={line}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </span>
  );
}

function WorkCard({ work }: { readonly work: Work }) {
  return (
    <a className={styles['work']} href={work.href} data-anim>
      <div className={canvasClassName(work.cover)}>
        <Cover cover={work.cover} />
        <span className={styles['kind']}>{work.kind}</span>
        <span className={styles['arrow']} aria-hidden="true">
          ↗
        </span>
      </div>
      <div className={styles['info']}>
        <b>{work.client}</b>
        <span>{work.year}</span>
      </div>
    </a>
  );
}

export function Works() {
  return (
    <Section id="trabajos" heading={HEADINGS.works}>
      <div className={styles['grid']}>
        {WORKS.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
    </Section>
  );
}
