import { Section } from '@/components/layout/section';
import { SERVICES } from '@/content/services';
import { HEADINGS } from '@/content/site-copy';

import styles from './services.module.css';

/**
 * Los cinco servicios.
 *
 * El prototipo usa `h4` acá; se usa `h3` porque es el nivel que sigue al `h2`
 * de la sección. Saltarse un nivel rompe la jerarquía de encabezados
 * (`SPEC.md` §8.6) y visualmente no cambia nada: el tamaño lo pone el CSS.
 *
 * Dos cosas cambiaron y las dos venían del diagnóstico visual:
 *
 * 1. **Se fue la numeración 01 a 05.** No ordenaba nada —los servicios no son
 *    una secuencia, se contratan sueltos— y era uno de los diecisiete rótulos
 *    que hacían que la página se leyera como plantilla.
 * 2. **Se fue la franja invertida.** Era la segunda inversión de tema de una
 *    página clara, y dos inversiones dejan de ser un recurso para volverse
 *    alternancia. La única que queda es la de contacto, que cierra. Acá la
 *    separación la da el panel sobre el fondo, dentro del mismo esquema.
 */
export function Services() {
  return (
    <Section id="servicios" heading={HEADINGS.services}>
      <div className={styles['grid']}>
        {SERVICES.map((service) => (
          <div key={service.id} className={styles['service']} data-anim>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
