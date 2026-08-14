import { describe, expect, it } from 'vitest';

import { formatLogEntry } from './logger';

const AT = '2026-08-14T12:00:00.000Z';

function parse(raw: string): Record<string, unknown> {
  return JSON.parse(raw) as Record<string, unknown>;
}

function fieldsOf(raw: string): Record<string, unknown> {
  return parse(raw)['fields'] as Record<string, unknown>;
}

describe('registro estructurado', () => {
  it('emite una línea JSON con nivel, evento, correlación y fecha', () => {
    const entry = parse(
      formatLogEntry({ level: 'info', event: 'health_check.ok', correlationId: 'abc' }, AT),
    );

    expect(entry).toMatchObject({
      at: AT,
      level: 'info',
      event: 'health_check.ok',
      correlationId: 'abc',
      fields: {},
    });
  });

  it('redacta los campos que podrían contener datos de una persona (RN12)', () => {
    const fields = fieldsOf(
      formatLogEntry(
        {
          level: 'info',
          event: 'lead.received',
          correlationId: 'abc',
          fields: {
            nombre: 'Ana Pérez',
            email: 'ana@ejemplo.ec',
            telefono: '0999999999',
            mensaje: 'quiero una cotización',
            ip: '190.0.0.1',
            token: 'zzzz',
          },
        },
        AT,
      ),
    );

    for (const value of Object.values(fields)) {
      expect(value).toBe('[redactado]');
    }
  });

  it('redacta sin importar cómo se escriba el nombre del campo', () => {
    const fields = fieldsOf(
      formatLogEntry(
        { level: 'info', event: 'x', correlationId: 'abc', fields: { EMAIL: 'ana@ejemplo.ec' } },
        AT,
      ),
    );

    expect(fields['EMAIL']).toBe('[redactado]');
  });

  it('deja pasar los campos técnicos que no son de una persona', () => {
    const fields = fieldsOf(
      formatLogEntry(
        {
          level: 'error',
          event: 'health_check.failed',
          correlationId: 'abc',
          fields: { errorName: 'TypeError', errorMessage: 'x is not a function', status: 500 },
        },
        AT,
      ),
    );

    expect(fields).toEqual({
      errorName: 'TypeError',
      errorMessage: 'x is not a function',
      status: 500,
    });
  });

  it('quita saltos de línea, para que nadie forje una entrada falsa', () => {
    const fields = fieldsOf(
      formatLogEntry(
        {
          level: 'warn',
          event: 'x',
          correlationId: 'abc',
          fields: { detalle: 'línea uno\n{"level":"info","event":"falso"}' },
        },
        AT,
      ),
    );

    expect(fields['detalle']).toBe('línea uno {"level":"info","event":"falso"}');
  });

  it('sanea también el evento y el identificador de correlación', () => {
    const entry = parse(
      formatLogEntry({ level: 'warn', event: 'a\nb', correlationId: 'c\rd' }, AT),
    );

    expect(entry['event']).toBe('a b');
    expect(entry['correlationId']).toBe('c d');
  });

  it('recorta los valores largos para que un envío enorme no inunde el registro', () => {
    const fields = fieldsOf(
      formatLogEntry(
        { level: 'info', event: 'x', correlationId: 'abc', fields: { detalle: 'a'.repeat(2000) } },
        AT,
      ),
    );

    expect(String(fields['detalle'])).toHaveLength(512);
  });
});
