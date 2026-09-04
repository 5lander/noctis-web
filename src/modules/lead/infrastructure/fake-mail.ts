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

/**
 * La bandeja vive colgada del proceso y no de la instancia.
 *
 * En desarrollo, Next arma **dos grafos de módulos distintos** —uno para las
 * rutas de API y otro para las páginas—, así que `service-registry` se evalúa
 * dos veces y salen dos `FakeMail`. Con la bandeja dentro de la instancia, el
 * correo que enviaba `POST /api/contacto` caía en una lista y `/dev/bandeja`
 * mostraba la otra, siempre vacía: la herramienta que existe justamente para
 * revisar los correos no enseñaba ninguno.
 *
 * `Symbol.for` es la clave: devuelve el mismo símbolo en cualquier grafo que
 * corra en el proceso, que es exactamente el alcance que se quiere. En
 * producción esto no cambia nada — el adaptador real ni siquiera pasa por acá.
 */
const OUTBOX_KEY: unique symbol = Symbol.for('noctis.fake-mail.outbox');

type OutboxScope = { [OUTBOX_KEY]?: SentMail[] };

function sharedOutbox(): SentMail[] {
  const scope = globalThis as OutboxScope;
  scope[OUTBOX_KEY] ??= [];
  return scope[OUTBOX_KEY];
}

export class FakeMail implements MailPort {
  private readonly outbox: SentMail[] = sharedOutbox();

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
