import { Section } from '@/components/layout/section';
import { Label } from '@/components/ui/label';
import { SERVICES } from '@/content/services';
import { HEADINGS } from '@/content/site-copy';

import styles from './services.module.css';

/**
 * Los cinco servicios, en franja invertida como el prototipo.
 *
 * El prototipo usa `h4` acá; se usa `h3` porque es el nivel que sigue al `h2`
 * de la sección. Saltarse un nivel rompe la jerarquía de encabezados
 * (`SPEC.md` §8.6) y visualmente no cambia nada: el tamaño lo pone el CSS.
 */
export function Services() {
  return (
    <Section id="servicios" heading={HEADINGS.services} inverted>
      <div className={styles['grid']}>
        {SERVICES.map((service) => (
          <div key={service.id} className={styles['service']}>
            <Label>{service.number}</Label>
            <div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
