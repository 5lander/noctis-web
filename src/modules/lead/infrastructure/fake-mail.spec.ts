import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HEALTHY_AND_INSTANT } from '@/shared/infrastructure/fakes/fake-behaviour';

import { FakeMail } from './fake-mail';

const MESSAGE = {
  to: 'ana@ejemplo.ec',
  subject: 'Su reunión con Noctis',
  body: 'Confirmada para el jueves.',
};

beforeEach(() => {
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('correo simulado', () => {
  it('no envía nada: lo deja en la bandeja', async () => {
    const mail = new FakeMail(HEALTHY_AND_INSTANT);
    await mail.send(MESSAGE);

    expect(mail.sent()).toHaveLength(1);
    expect(mail.sent()[0]).toMatchObject(MESSAGE);
  });

  it('el más reciente primero, que es como se lee una bandeja', async () => {
    const mail = new FakeMail(HEALTHY_AND_INSTANT);
    await mail.send({ ...MESSAGE, subject: 'Primero' });
    await mail.send({ ...MESSAGE, subject: 'Segundo' });

    expect(mail.sent()[0]?.subject).toBe('Segundo');
  });

  it('RN12 — el registro no lleva destinatario, asunto ni cuerpo', async () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const mail = new FakeMail(HEALTHY_AND_INSTANT);

    await mail.send(MESSAGE);

    const line = String(write.mock.calls[0]?.[0]);
    expect(line).not.toContain('ana@ejemplo.ec');
    expect(line).not.toContain('Su reunión con Noctis');
    expect(line).not.toContain('Confirmada para el jueves.');
  });

  it('se puede pedir que el servicio esté caído', async () => {
    const caido = new FakeMail({ latencyMs: 0, fault: 'unavailable' });

    await expect(caido.send(MESSAGE)).rejects.toThrowError(/no disponible/);
  });
});
