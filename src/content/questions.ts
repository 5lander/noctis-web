import type { Question } from './types';

/**
 * Las cuatro preguntas del acordeón (`SPEC.md` §6.9).
 *
 * La primera contesta "¿cuánto cuesta?" **sin dar un precio**: deriva a
 * proforma. Es la misma regla que rige al bot (RN5), y vale igual acá: si el
 * sitio diera un número, el bot quedaría obligado a sostenerlo.
 */
export const QUESTIONS: readonly Question[] = [
  {
    id: 'precio',
    question: '¿Cuánto cuesta?',
    answer:
      'Depende del alcance. Los productos van por suscripción mensual según el tamaño del negocio; el trabajo puntual se cotiza por fases con un valor cerrado por fase. Antes de que se comprometa a nada recibe una proforma con el detalle.',
  },
  {
    id: 'plazo',
    question: '¿En cuánto tiempo lo tengo funcionando?',
    answer:
      'Una página o un piloto de automatización arranca en semanas. Los sistemas más grandes se entregan por partes: la primera versión útil sale primero y el resto se suma sobre algo que ya está en uso.',
  },
  {
    id: 'datos',
    question: '¿Mis datos quedan mezclados con los de otros clientes?',
    answer:
      'No. Cada cliente tiene sus datos aislados a nivel de base de datos, con permisos por usuario y respaldos periódicos.',
  },
  {
    id: 'salida',
    question: '¿Qué pasa si mañana quiero dejar de trabajar con ustedes?',
    answer:
      'Su información es suya. Se la entregamos exportada en formatos estándar, sin retenerla ni cobrar por liberarla.',
  },
];
