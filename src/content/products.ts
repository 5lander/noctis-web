import type { Product } from './types';

/**
 * Los tres productos, con su estado real (`SPEC.md` §5.1).
 *
 * **El estado sale de acá y de ningún otro lado.** RN6: el bot no puede afirmar
 * que un producto está disponible si esta lista dice otra cosa.
 *
 * `shot` es la pantalla del producto. Las de hoy son **ejemplos compuestos**, no
 * capturas de una instalación de un cliente: enseñan la forma de cada producto
 * sin publicar el dato de nadie. Se reemplazan por capturas reales en cuanto
 * haya una instalación que se pueda mostrar, y el único cambio será esta ruta.
 *
 * **Los resúmenes y las viñetas se reescribieron con una sola regla: lo que el
 * dueño deja de hacer, no lo que el sistema tiene.** «Inventario por bodega con
 * aviso de mínimos» describe cómo está construido; «le avisa antes de que se
 * acabe» describe lo que le pasa a él. Nadie compra variantes de catálogo:
 * compra dejar de vender lo que ya no hay en bodega.
 */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'commerce',
    href: null,
    shot: {
      src: '/producto/commerce.png',
      alt: 'Panel de Noctis Commerce con el catálogo, el stock por bodega y el cierre de caja del día.',
    },
    name: 'Noctis Commerce',
    summary:
      'Saber qué queda en bodega, a qué precio salió y cuánto entró hoy. Sin abrir un solo Excel.',
    capabilities: [
      'Un precio para el mayorista y otro para el mostrador, en una sola lista',
      'Le avisa antes de que se acabe, no cuando ya se acabó',
      'Al cerrar el día, la caja ya está cuadrada',
      'Dos o tres locales, una sola cuenta',
    ],
    stage: 'en-desarrollo',
    stageLabel: 'En desarrollo',
    audience: 'Tiendas y distribuidoras que ya no alcanzan con cuaderno y Excel.',
  },
  {
    id: 'care',
    href: 'https://care.noctisdev.online',
    shot: {
      src: '/producto/care.png',
      alt: 'Agenda de Care con las citas del día y la conversación de WhatsApp que confirmó una de ellas.',
    },
    name: 'Care',
    /* No se toca: es el único de los tres que ya estaba escrito desde el lado del cliente. */
    summary: 'La agenda del consultorio, atendida por WhatsApp a la hora que el paciente escriba.',
    capabilities: [
      'Solo ofrece las horas que usted tiene libres',
      'Recuerda la cita el día antes, para que no le falten pacientes',
      'Su agenda, sus pacientes y cuánto atendió en el mes',
      'Se maneja entero desde el celular',
    ],
    stage: 'en-pruebas',
    stageLabel: 'En pruebas',
    audience: 'Consultorios independientes que hoy llevan la agenda en papel.',
  },
  {
    id: 'automatizacion',
    href: null,
    shot: {
      src: '/producto/automatizacion.png',
      alt: 'Bandeja única con conversaciones de WhatsApp, Instagram y Messenger contestadas por el asistente.',
    },
    name: 'Automatización',
    /*
     * La lista de cinco canales sola no decía lo único que importa: que contesta
     * cuando no hay nadie. La segunda frase es el producto entero.
     */
    summary:
      'Un asistente que contesta en WhatsApp, Instagram, Messenger, TikTok y Telegram. También a las once de la noche.',
    capabilities: [
      'Contesta las mismas preguntas de siempre, a la hora que sea',
      'Toma el pedido y agenda la cita en el mismo chat',
      'Le pasa la conversación cuando hace falta una persona',
      'Usa el número de WhatsApp que ya tiene',
    ],
    stage: 'disponible',
    stageLabel: 'Disponible',
    audience: 'Negocios que reciben más mensajes de los que pueden contestar.',
  },
];
