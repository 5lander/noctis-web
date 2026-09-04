import { describe, expect, it } from 'vitest';

import { createLead, hasValidContact, LEAD_LIMITS, type LeadDraft } from './lead';

/**
 * Estas pruebas no levantan nada. Es el criterio de CLAUDE.md §2 aplicado al
 * módulo `lead`: si para comprobar una regla de negocio hiciera falta un
 * servidor o un cliente de correo, la regla estaría en la capa equivocada.
 *
 * Los datos son sintéticos a propósito (CLAUDE.md §7): nunca datos reales de
 * personas en desarrollo, ni siquiera en un archivo de prueba.
 */

const RECIBIDO = '2026-09-04T15:00:00.000Z';

function borrador(cambios: Partial<LeadDraft> = {}): LeadDraft {
  return {
    name: 'Ana Prueba',
    business: 'Bodega Sintética',
    email: 'ana@ejemplo.test',
    whatsapp: '',
    interest: 'Página web nueva o rediseño',
    message: 'Llevo el inventario en cuaderno.',
    ...cambios,
  };
}

describe('createLead', () => {
  it('convierte un borrador completo en una ficha con los espacios recortados', () => {
    const resultado = createLead(borrador({ name: '  Ana Prueba  ' }), RECIBIDO);

    expect(resultado).toEqual({
      ok: true,
      lead: {
        name: 'Ana Prueba',
        business: 'Bodega Sintética',
        email: 'ana@ejemplo.test',
        whatsapp: null,
        interest: 'Página web nueva o rediseño',
        message: 'Llevo el inventario en cuaderno.',
        receivedAt: RECIBIDO,
      },
    });
  });

  it('deja en null lo que el visitante no llenó, en vez de guardar cadenas vacías', () => {
    const resultado = createLead(borrador({ business: '   ', message: '' }), RECIBIDO);

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.lead.business).toBeNull();
    expect(resultado.lead.message).toBeNull();
  });

  it('rechaza una ficha sin nombre: sin él no se puede leer ni contestar', () => {
    expect(createLead(borrador({ name: '  ' }), RECIBIDO)).toEqual({
      ok: false,
      problem: 'sin_nombre',
    });
  });

  it('rechaza un correo mal escrito antes de intentar responderlo', () => {
    expect(createLead(borrador({ email: 'ana@ejemplo' }), RECIBIDO)).toEqual({
      ok: false,
      problem: 'correo_invalido',
    });
  });

  it('rechaza el campo que se pasa de largo, que es la firma de un envío automático', () => {
    const largo = 'a'.repeat(LEAD_LIMITS.message + 1);

    expect(createLead(borrador({ message: largo }), RECIBIDO)).toEqual({
      ok: false,
      problem: 'campo_demasiado_largo',
    });
  });

  it('acepta exactamente el tope: el límite incluye su propio valor', () => {
    const justo = 'a'.repeat(LEAD_LIMITS.message);

    expect(createLead(borrador({ message: justo }), RECIBIDO).ok).toBe(true);
  });
});

/**
 * RN7 tiene prueba propia y no una casilla dentro de otra: es la regla que
 * decide si se manda un correo, y de ella depende que la bandeja siga siendo
 * útil.
 */
describe('RN7 · solo se notifica si hay por dónde contestar', () => {
  it('con correo válido alcanza', () => {
    expect(hasValidContact(borrador({ whatsapp: '' }))).toBe(true);
  });

  it('con WhatsApp alcanza aunque no haya correo', () => {
    expect(hasValidContact(borrador({ email: '', whatsapp: '098 010 5699' }))).toBe(true);
  });

  it('sin ninguno de los dos, no', () => {
    expect(hasValidContact(borrador({ email: '', whatsapp: '' }))).toBe(false);
  });

  it('un número de tres dígitos no es un canal de contacto', () => {
    expect(hasValidContact(borrador({ email: '', whatsapp: '123' }))).toBe(false);
  });

  it('createLead rechaza la ficha sin canal en vez de dejar pasar el correo', () => {
    expect(createLead(borrador({ email: '', whatsapp: '' }), RECIBIDO)).toEqual({
      ok: false,
      problem: 'sin_canal_de_contacto',
    });
  });

  it('una ficha solo con WhatsApp queda con el correo en null y se acepta', () => {
    const resultado = createLead(borrador({ email: '', whatsapp: '0980105699' }), RECIBIDO);

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.lead.email).toBeNull();
    expect(resultado.lead.whatsapp).toBe('0980105699');
  });
});
