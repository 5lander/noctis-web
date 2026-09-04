import { LEAD_MAIL } from '@/content/lead-mail';
import type { MailPort } from '@/modules/lead/application/ports/mail-port';
import type { Lead } from '@/modules/lead/domain/lead';

/**
 * Avisar de un prospecto nuevo.
 *
 * Recibe el puerto de correo por constructor y no lo instancia acá: es la
 * inyección que exige `CLAUDE.md` §2, y es lo que permite probar el caso de uso
 * con un doble en memoria y sin cuenta de Brevo. El destinatario también entra
 * por constructor, porque es configuración de despliegue y no una regla.
 *
 * **El caso de uso no vuelve a comprobar RN7.** Un `Lead` solo existe si pasó
 * por `createLead`, y ahí ya se garantizó que hay por dónde contestar. Repetir
 * la comprobación acá daría la impresión de que un `Lead` puede llegar sin
 * canal, que es justo lo que el tipo promete que no pasa.
 */

function line(label: string, value: string | null): string {
  return `${label}: ${value ?? LEAD_MAIL.missing}`;
}

export function renderLeadMail(lead: Lead): string {
  const { labels } = LEAD_MAIL;

  return [
    LEAD_MAIL.intro,
    '',
    line(labels.name, lead.name),
    line(labels.business, lead.business),
    line(labels.email, lead.email),
    line(labels.whatsapp, lead.whatsapp),
    line(labels.interest, lead.interest),
    '',
    `${labels.message}:`,
    lead.message ?? LEAD_MAIL.missing,
    '',
    line(labels.receivedAt, lead.receivedAt),
    '',
    LEAD_MAIL.closing,
  ].join('\n');
}

export class NotifyLead {
  constructor(
    private readonly mail: MailPort,
    private readonly recipient: string,
  ) {}

  async run(lead: Lead): Promise<void> {
    await this.mail.send({
      to: this.recipient,
      subject: `${LEAD_MAIL.subjectPrefix}: ${lead.name}`,
      body: renderLeadMail(lead),
    });
  }
}
