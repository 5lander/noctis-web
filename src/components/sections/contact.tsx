import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { CONTACT } from '@/content/site-copy';

import styles from './contact.module.css';

/**
 * El formulario de contacto, en franja invertida.
 *
 * **P2 pone la marca, no el envío.** El endpoint `POST /api/contacto` con
 * validación en servidor, campo trampa y verificación de tiempo llega en P10, y
 * con él la confirmación en pantalla sin recargar.
 *
 * El formulario apunta a `/api/contacto` con `method="post"` desde ya, y no a
 * ninguna otra parte, por una razón concreta: un `<form>` sin destino envía por
 * `GET` a la propia página y deja lo que escribió el visitante en la barra de
 * direcciones y en el historial. Hasta que exista el endpoint esto responde 404,
 * que es una señal honesta de "todavía no está" en vez de una fuga silenciosa.
 */

const FIELDS = CONTACT.fields;

/**
 * `autocomplete` no es una comodidad: es el criterio **WCAG 2.1 AA 1.3.5,
 * identificar el propósito de la entrada**, y era el único incumplimiento de
 * nivel AA que quedaba en la página. Declararlo permite además que el navegador
 * rellene los cuatro campos de una pasada en celular, que es donde el formulario
 * se abandona.
 *
 * `inputMode` en el teléfono saca el teclado numérico. Va junto con `type="tel"`
 * y no en su lugar: uno describe el dato, el otro el teclado.
 */
interface TextInputProps {
  readonly field: { readonly id: string; readonly label: string; readonly placeholder: string };
  readonly type: 'text' | 'email' | 'tel';
  readonly autoComplete: string;
  readonly required?: boolean;
}

function TextInput({ field, type, autoComplete, required = false }: TextInputProps) {
  return (
    <Field htmlFor={field.id} label={field.label}>
      <input
        id={field.id}
        name={field.id}
        type={type}
        autoComplete={autoComplete}
        inputMode={type === 'tel' ? 'tel' : undefined}
        placeholder={field.placeholder}
        required={required}
      />
    </Field>
  );
}

function ContactForm() {
  return (
    <form className={styles['form']} method="post" action="/api/contacto" data-anim>
      <TextInput field={FIELDS.name} type="text" autoComplete="name" required />
      <TextInput field={FIELDS.business} type="text" autoComplete="organization" />
      <TextInput field={FIELDS.email} type="email" autoComplete="email" required />
      <TextInput field={FIELDS.whatsapp} type="tel" autoComplete="tel" />
      <Field htmlFor={FIELDS.interest.id} label={FIELDS.interest.label} wide>
        <select id={FIELDS.interest.id} name={FIELDS.interest.id} defaultValue="">
          {CONTACT.interestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field htmlFor={FIELDS.message.id} label={FIELDS.message.label} wide>
        <textarea
          id={FIELDS.message.id}
          name={FIELDS.message.id}
          placeholder={FIELDS.message.placeholder}
        />
      </Field>
      <div className={styles['submit']}>
        <Button type="submit">{CONTACT.submit}</Button>
        <p className={styles['note']}>{CONTACT.note}</p>
      </div>
    </form>
  );
}

export function Contact() {
  return (
    <section id="contacto" className={`inv ${styles['section']}`} data-reveal-root>
      <Container>
        <div className={styles['grid']}>
          <div data-anim>
            <h2>{CONTACT.title}</h2>
            <p className={styles['support']}>{CONTACT.support}</p>
          </div>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
