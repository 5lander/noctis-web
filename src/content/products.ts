import type { Product } from './types';

/**
 * Los cuatro productos, con su estado real (`SPEC.md` §5.1).
 *
 * Los textos salen del prototipo, ya redactados y revisados: se copian tal cual.
 *
 * **El estado sale de acá y de ningún otro lado.** RN6: el bot no puede afirmar
 * que un producto está disponible si esta lista dice otra cosa.
 */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'commerce',
    scope: 'Comercio',
    name: 'Noctis Commerce',
    summary:
      'Qué tiene, a qué precio y cuánto salió. La gestión de un negocio que vende todos los días.',
    capabilities: [
      'Catálogo con variantes y listas de precios',
      'Inventario por bodega con aviso de mínimos',
      'Ventas y cierre de caja',
      'Varios locales en una sola cuenta',
    ],
    stage: 'en-desarrollo',
    stageLabel: 'En desarrollo',
    audience: 'Tiendas y distribuidoras que ya no alcanzan con cuaderno y Excel.',
  },
  {
    id: 'care',
    scope: 'Salud',
    name: 'Care',
    summary: 'La agenda del consultorio, atendida por WhatsApp a la hora que el paciente escriba.',
    capabilities: [
      'Agenda contra la disponibilidad real',
      'Confirma y recuerda antes de la cita',
      'Panel de agenda, pacientes y métricas',
      'Funciona también desde el celular',
    ],
    stage: 'en-pruebas',
    stageLabel: 'En pruebas',
    audience: 'Consultorios independientes que hoy llevan la agenda en papel.',
  },
  {
    id: 'automatizacion',
    scope: 'Ventas',
    name: 'Automatización',
    summary:
      'Un solo asistente que responde en WhatsApp, Instagram, Messenger, TikTok y Telegram.',
    capabilities: [
      'Contesta precios y preguntas repetidas',
      'Toma pedidos y agenda en el mismo chat',
      'Pasa a una persona cuando hace falta',
      'Se monta sobre lo que ya tiene',
    ],
    stage: 'disponible',
    stageLabel: 'Disponible',
    audience: 'Negocios que reciben más mensajes de los que pueden contestar.',
  },
  {
    id: 'reclutamiento',
    scope: 'Talento',
    name: 'Reclutamiento por chat',
    summary:
      'Los candidatos se registran conversando y la empresa recibe perfiles comparables.',
    capabilities: [
      'Sin formularios largos',
      'Datos ordenados, no hojas sueltas',
      'Filtrado por lo que necesita',
      'Todo en un solo lugar',
    ],
    stage: 'proyecto-futuro',
    stageLabel: 'Proyecto futuro',
    audience: 'Empresas que reciben hojas de vida por todos lados y no logran compararlas.',
  },
];
