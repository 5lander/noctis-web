import { Section } from '@/components/layout/section';
import { PROCESS_STEPS } from '@/content/process';
import { HEADINGS } from '@/content/site-copy';

import styles from './process.module.css';

/**
 * El proceso, anclado (RA-12).
 *
 * La sección se queda fija mientras el visitante baja y los pasos entran en
 * orden, con un trazo que se dibuja uniéndolos. Es la técnica 11 del catálogo,
 * la que el propio documento marca como "protagonista": entra acá y en ninguna
 * otra parte porque el proceso **es** una secuencia, y una secuencia se entiende
 * mejor recorrida que vista de golpe.
 *
 * El panel lleva `data-owns-anim`: sus pasos los anima el anclaje, no el
 * revelado genérico de la sección. En móvil no hay anclaje —la capa no lo
 * registra por debajo de 768px— y los pasos se muestran de una vez.
 *
 * El trazo es decorativo y va con `aria-hidden`: lo que dice ya lo dice el orden
 * de los pasos.
 */

const CONNECTOR_VIEWBOX = '0 0 1000 2';

export function Process() {
  return (
    <Section id="proceso" heading={HEADINGS.process}>
      <div className={styles['panel']} data-owns-anim data-process-panel>
        <svg
          className={styles['connector']}
          viewBox={CONNECTOR_VIEWBOX}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0" y1="1" x2="1000" y2="1" data-process-line />
        </svg>
        <div className={styles['grid']}>
          {PROCESS_STEPS.map((step) => (
            <div key={step.id} className={styles['step']} data-anim data-process-step>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
