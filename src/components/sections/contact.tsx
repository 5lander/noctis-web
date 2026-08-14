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

interface TextInputProps {
  readonly field: { readonly id: string; readonly label: string; readonly placeholder: string };
  readonly type: 'text' | 'email' | 'tel';
  readonly required?: boolean;
}

function TextInput({ field, type, required = false }: TextInputProps) {
  return (
    <Field htmlFor={field.id} label={field.label}>
      <input
        id={field.id}
        name={field.id}
        type={type}
        placeholder={field.placeholder}
        required={required}
      />
    </Field>
  );
}

function ContactForm() {
  return (
    <form className={styles['form']} method="post" action="/api/contacto">
      <TextInput field={FIELDS.name} type="text" required />
      <TextInput field={FIELDS.business} type="text" />
      <TextInput field={FIELDS.email} type="email" required />
      <TextInput field={FIELDS.whatsapp} type="tel" />
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
      </div>
    </form>
  );
}

export function Contact() {
  return (
    <section id="contacto" className={`inv ${styles['section']}`}>
      <Container>
        <div className={styles['grid']}>
          <div>
            <h2>{CONTACT.title}</h2>
            <p className={styles['support']}>{CONTACT.support}</p>
          </div>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
