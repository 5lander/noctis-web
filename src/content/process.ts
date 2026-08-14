import type { ProcessStep } from './types';

/** Los tres pasos del proceso (`SPEC.md` §6.7). */
export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    id: 'levantamiento',
    stage: 'Levantamiento',
    title: 'Vemos cómo trabaja hoy',
    description:
      'Una conversación para entender el flujo real: quién hace qué, dónde se pierde tiempo y qué se rompe cuando hay más trabajo del normal.',
  },
  {
    id: 'piloto',
    stage: 'Piloto',
    title: 'Arrancamos por una parte',
    description:
      'Ponemos a andar el pedazo que más duele, con su información y sus clientes reales. Si no sirve, se ajusta antes de seguir.',
  },
  {
    id: 'operacion',
    stage: 'Operación',
    title: 'Queda funcionando',
    description:
      'Pasa a producción con soporte y mejoras periódicas. Suscripción mensual, no una licencia eterna.',
  },
];
