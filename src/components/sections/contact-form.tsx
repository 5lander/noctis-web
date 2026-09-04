'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ERROR_CODES, ERROR_MESSAGES } from '@/content/errors';
import { CONTACT } from '@/content/site-copy';
import type { SentOutcome } from '@/shared/infrastructure/http/contact-redirect';

import styles from './contact.module.css';

/**
 * El formulario, con envío de verdad.
 *
 * **Es el único componente de cliente de la página que llama a la API**, y por
 * eso es el único que tiene los cuatro estados que exige `CLAUDE.md` §10:
 * quieto, enviando, enviado y fallado. Un formulario que no dice en qué estado
 * está se vuelve a enviar dos veces o se abandona; los dos finales cuestan el
 * mismo prospecto.
 *
 * **Funciona sin JavaScript.** El `<form>` conserva su `action` y su `method`,
 * así que si el guion no llega el navegador envía por su cuenta y la ruta
 * contesta con una redirección; el resultado vuelve en la URL y se pinta el
 * mismo mensaje. Lo que el JavaScript agrega es no recargar la página, que es
 * comodidad, no funcionamiento.
 *
 * `startedAt` lo pone el servidor al pintar: es la mitad del control de prisa
 * anti-robots, y viene de arriba precisamente para que exista aunque no corra
 * una línea de guion.
 */

type Estado = 'quieto' | 'enviando' | 'enviado' | 'fallado';

const FIELDS = CONTACT.fields;

/**
 * `autocomplete` no es una comodidad: es el criterio **WCAG 2.1 AA 1.3.5,
 * identificar el propósito de la entrada**. Declararlo permite además que el
 * navegador rellene los cuatro campos de una pasada en celular, que es donde el
 * formulario se abandona.
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

/**
 * El campo que nadie ve.
 *
 * Se esconde con CSS y no con `type="hidden"`: un campo oculto por tipo es
 * invisible también para el robot que lee el HTML, y entonces no lo llena. Lleva
 * `tabIndex={-1}` para que el teclado no caiga adentro y `aria-hidden` para que
 * el lector de pantalla no lo anuncie — quien navega a ciegas no tiene por qué
 * toparse con una trampa puesta para otro.
 */
function TrapField() {
  return (
    <div className={styles['trap']} aria-hidden="true">
      <label htmlFor={CONTACT.trap.id}>{CONTACT.trap.label}</label>
      <input
        id={CONTACT.trap.id}
        name={CONTACT.trap.id}
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

function FormFields() {
  return (
    <>
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
    </>
  );
}

const BAD_REQUEST = 400;

function messageFor(status: number): string {
  return status === BAD_REQUEST
    ? ERROR_MESSAGES[ERROR_CODES.invalidSubmission]
    : CONTACT.status.failed;
}

function bodyOf(form: HTMLFormElement): URLSearchParams {
  const body = new URLSearchParams();
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === 'string') body.append(key, value);
  }
  return body;
}

async function post(form: HTMLFormElement): Promise<number> {
  const response = await fetch(form.action, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
    body: bodyOf(form),
  });
  return response.status;
}

const OK_STATUS = 200;

function initialStateOf(outcome: SentOutcome | null): Estado {
  if (outcome === 'ok') return 'enviado';
  return outcome === 'failed' ? 'fallado' : 'quieto';
}

/**
 * La máquina de estados del envío, separada del dibujo.
 *
 * No es una división por gusto: acá está lo único que puede fallar, y tenerlo
 * aparte permite leer de un vistazo los cuatro finales posibles sin recorrer el
 * formulario entero.
 */
function useEnvio(outcome: SentOutcome | null): {
  readonly estado: Estado;
  readonly error: string;
  readonly enviar: (event: FormEvent<HTMLFormElement>) => Promise<void>;
} {
  const [estado, setEstado] = useState<Estado>(initialStateOf(outcome));
  const [error, setError] = useState<string>(CONTACT.status.failed);

  async function enviar(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    setEstado('enviando');

    try {
      const status = await post(form);
      if (status === OK_STATUS) {
        form.reset();
        setEstado('enviado');
        return;
      }
      setError(messageFor(status));
      setEstado('fallado');
    } catch {
      // Sin red no hay código de estado que mirar: es el mismo final para quien
      // envía, y el detalle no le sirve de nada.
      setError(CONTACT.status.failed);
      setEstado('fallado');
    }
  }

  return { estado, error, enviar };
}

export function ContactForm({
  startedAt,
  outcome,
}: {
  readonly startedAt: number;
  readonly outcome: SentOutcome | null;
}) {
  const { estado, error, enviar } = useEnvio(outcome);

  if (estado === 'enviado') {
    // Sin `data-anim`, a diferencia del formulario. La capa de animación deja
    // esos elementos en opacidad cero hasta que su disparador los revela al
    // pasar por pantalla, y este nace **después** de que el disparador ya
    // corrió: quedaba en el documento, anunciado por el lector de pantalla, y
    // completamente invisible. La confirmación de que llegó el mensaje es lo
    // último que puede depender de que una animación se haya ejecutado.
    return (
      <p className={styles['sent']} role="status">
        {CONTACT.status.success}
      </p>
    );
  }

  return (
    <form
      className={styles['form']}
      method="post"
      action="/api/contacto"
      onSubmit={(event) => void enviar(event)}
      data-anim
    >
      <FormFields />
      <TrapField />
      <input type="hidden" name="desde" value={startedAt} readOnly />
      <div className={styles['submit']}>
        <Button type="submit" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? CONTACT.status.sending : CONTACT.submit}
        </Button>
        <p className={styles['note']} role="status">
          {estado === 'fallado' ? error : CONTACT.note}
        </p>
      </div>
    </form>
  );
}
