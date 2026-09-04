import { describe, expect, it } from 'vitest';

import type { MailMessage, MailPort } from '@/modules/lead/application/ports/mail-port';
import type { Lead } from '@/modules/lead/domain/lead';

import { NotifyLead, renderLeadMail } from './notify-lead';

/**
 * El caso de uso, probado con un doble de tres líneas.
 *
 * Que alcance con esto es el punto: si para comprobar que se manda un aviso
 * hiciera falta una cuenta de Brevo, la inyección de dependencias de
 * `CLAUDE.md` §2 no estaría haciendo su trabajo.
 */

class MailSpy implements MailPort {
  readonly sent: MailMessage[] = [];

  async send(message: MailMessage): Promise<void> {
    this.sent.push(message);
    return Promise.resolve();
  }
}

const FICHA: Lead = {
  name: 'Ana Prueba',
  business: 'Bodega Sintética',
  email: 'ana@ejemplo.test',
  whatsapp: null,
  interest: 'Página web nueva o rediseño',
  message: 'Llevo el inventario en cuaderno.',
  receivedAt: '2026-09-04T15:00:00.000Z',
};

describe('NotifyLead', () => {
  it('manda un solo correo al destinatario configurado', async () => {
    const correo = new MailSpy();

    await new NotifyLead(correo, 'destino@ejemplo.test').run(FICHA);

    expect(correo.sent).toHaveLength(1);
    expect(correo.sent[0]?.to).toBe('destino@ejemplo.test');
  });

  it('el asunto trae el nombre, para reconocerlo sin abrirlo', async () => {
    const correo = new MailSpy();

    await new NotifyLead(correo, 'destino@ejemplo.test').run(FICHA);

    expect(correo.sent[0]?.subject).toContain('Ana Prueba');
  });
});

describe('renderLeadMail', () => {
  it('trae los cinco datos y el mensaje', () => {
    const cuerpo = renderLeadMail(FICHA);

    expect(cuerpo).toContain('Ana Prueba');
    expect(cuerpo).toContain('Bodega Sintética');
    expect(cuerpo).toContain('ana@ejemplo.test');
    expect(cuerpo).toContain('Página web nueva o rediseño');
    expect(cuerpo).toContain('Llevo el inventario en cuaderno.');
  });

  it('dice que un campo no se llenó en vez de dejar el rótulo colgando', () => {
    const cuerpo = renderLeadMail({ ...FICHA, whatsapp: null, message: null });

    expect(cuerpo).not.toMatch(/WhatsApp:\s*$/m);
    expect(cuerpo).toContain('no lo dejó');
  });
});
