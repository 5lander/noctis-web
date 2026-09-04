import { Container } from '@/components/layout/container';
import { ContactForm } from '@/components/sections/contact-form';
import { CONTACT } from '@/content/site-copy';
import type { SentOutcome } from '@/shared/infrastructure/http/contact-redirect';

import styles from './contact.module.css';

/**
 * El formulario de contacto, en franja invertida.
 *
 * La sección se queda en el servidor y solo el formulario es de cliente. La
 * división no es de estilo: el titular y el párrafo de apoyo no necesitan
 * JavaScript para existir, y bajarlos al navegador solo porque están al lado de
 * algo que sí lo necesita es peso que paga cada visitante.
 *
 * `startedAt` es la mitad del control anti-robots de la ruta: entre que la
 * página se genera y que alguien termina de escribir su problema pasan segundos,
 * y un envío instantáneo no lo hizo una persona. Lo sella el servidor a
 * propósito, para que la comprobación funcione también sin JavaScript, y baja
 * como propiedad porque un componente no puede leer el reloj mientras pinta
 * (ver `request-clock.ts`).
 */
export function Contact({
  outcome,
  startedAt,
}: {
  readonly outcome: SentOutcome | null;
  readonly startedAt: number;
}) {
  return (
    <section id="contacto" className={`inv ${styles['section']}`} data-reveal-root>
      <Container>
        <div className={styles['grid']}>
          <div data-anim>
            <h2>{CONTACT.title}</h2>
            <p className={styles['support']}>{CONTACT.support}</p>
          </div>
          <ContactForm startedAt={startedAt} outcome={outcome} />
        </div>
      </Container>
    </section>
  );
}
