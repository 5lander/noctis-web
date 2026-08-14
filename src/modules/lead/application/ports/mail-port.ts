/**
 * El envío de correo.
 *
 * El cuerpo llega ya renderizado: el puerto no sabe de plantillas, y por eso el
 * adaptador de Brevo tampoco. Las cuatro plantillas llegan en P9.
 */

export interface MailMessage {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
}

export interface MailPort {
  send(message: MailMessage): Promise<void>;
}
