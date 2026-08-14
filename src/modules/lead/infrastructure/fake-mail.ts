import type { MailMessage, MailPort } from '@/modules/lead/application/ports/mail-port';
import {
  applyBehaviour,
  HEALTHY_WITH_LATENCY,
  type FakeBehaviour,
} from '@/shared/infrastructure/fakes/fake-behaviour';
import { log } from '@/shared/infrastructure/logging/logger';

/**
 * Correo simulado: no envía nada.
 *
 * Guarda cada mensaje en una bandeja en memoria, visible en `/dev/bandeja`
 * **solo en desarrollo**. Así se revisan las cuatro plantillas de P9 sin mandar
 * un correo y sin una cuenta de Brevo.
 *
 * Del registro sale el hecho de que se envió, nunca el destinatario ni el
 * cuerpo: RN12 no admite datos personales en los registros, y un correo es todo
 * dato personal. Para leerlo está la bandeja, que vive en memoria y muere con el
 * proceso.
 */

export interface SentMail extends MailMessage {
  readonly sentAt: string;
}

const MAX_KEPT = 50;

export class FakeMail implements MailPort {
  private readonly outbox: SentMail[] = [];

  constructor(private readonly behaviour: FakeBehaviour = HEALTHY_WITH_LATENCY) {}

  async send(message: MailMessage): Promise<void> {
    await applyBehaviour(this.behaviour, 'correo');

    this.outbox.unshift({ ...message, sentAt: new Date().toISOString() });
    if (this.outbox.length > MAX_KEPT) this.outbox.length = MAX_KEPT;

    log({
      level: 'info',
      event: 'mail.simulated',
      correlationId: 'sin-peticion',
      fields: { kept: this.outbox.length },
    });
  }

  /** Lo que muestra la bandeja de desarrollo. */
  sent(): readonly SentMail[] {
    return [...this.outbox];
  }
}
