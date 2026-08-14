import { notFound } from 'next/navigation';

import { FakeMail, type SentMail } from '@/modules/lead/infrastructure/fake-mail';
import { DEV_MAILBOX } from '@/content/ui';
import { isDevelopment } from '@/shared/infrastructure/config/environment';
import { services } from '@/shared/infrastructure/config/service-registry';

import styles from './page.module.css';

/**
 * `/dev/bandeja` — los correos que el sistema habría enviado (`BUILD.md` §3).
 *
 * **Solo en desarrollo.** En producción devuelve 404, y no por una comprobación
 * de permisos sino porque no hay a quién dejar entrar: acá se ven correos
 * enteros, con destinatario y cuerpo, que es exactamente lo que no puede salir
 * de un servidor de verdad.
 *
 * Sirve para revisar las cuatro plantillas de P9 sin mandar un correo y sin una
 * cuenta de Brevo.
 */

export const dynamic = 'force-dynamic';

function inbox(): readonly SentMail[] {
  return services.mail instanceof FakeMail ? services.mail.sent() : [];
}

export default function DevMailboxPage() {
  if (!isDevelopment) notFound();

  const messages = inbox();

  return (
    <main className={styles['page']}>
      <h1>{DEV_MAILBOX.title}</h1>
      <p className={styles['intro']}>{DEV_MAILBOX.intro}</p>

      {messages.length === 0 && <p className={styles['empty']}>{DEV_MAILBOX.empty}</p>}

      {messages.map((message) => (
        <article key={`${message.sentAt}-${message.subject}`} className={styles['message']}>
          <h2>{message.subject}</h2>
          <p className={styles['meta']}>
            {DEV_MAILBOX.to}: {message.to} · {DEV_MAILBOX.sentAt}: {message.sentAt}
          </p>
          <pre className={styles['body']}>{message.body}</pre>
        </article>
      ))}
    </main>
  );
}
