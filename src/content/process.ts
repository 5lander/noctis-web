import type { ProcessStep } from './types';

/**
 * Los tres pasos del proceso (`SPEC.md` §6.7).
 *
 * Estaban bien escritos y ninguno decía **cuánto le cuesta al cliente en
 * tiempo**. «Una hora» convierte un paso descrito en un paso que se puede
 * aceptar: sin esa cifra, «una conversación» puede ser media mañana. Y es donde
 * Loja entra sin forzarse, porque la cercanía es una ventaja concreta y no una
 * declaración de origen.
 */
export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    id: 'levantamiento',
    title: 'Vemos cómo trabaja hoy',
    description:
      'Una hora, por videollamada o en su local si está en Loja. Vemos quién hace qué, dónde se pierde tiempo y qué se rompe cuando hay más trabajo del normal.',
  },
  {
    id: 'piloto',
    title: 'Arrancamos por una parte',
    description:
      'Ponemos a andar el pedazo que más duele, con su información y sus clientes reales. Si no sirve, se ajusta antes de seguir.',
  },
  {
    id: 'operacion',
    title: 'Queda funcionando',
    description:
      'Pasa a producción con soporte y mejoras periódicas. Suscripción mensual, no una licencia eterna.',
  },
];
