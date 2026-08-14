import type { Service } from './types';

/**
 * Los cinco servicios (`SPEC.md` §5.2).
 *
 * **No se ofrece software a medida ni integraciones**: quedaron fuera del
 * alcance comercial. Si alguien quiere agregarlos, es una decisión de negocio,
 * no un cambio de contenido.
 */
export const SERVICES: readonly Service[] = [
  {
    id: 'crm',
    number: '01',
    name: 'CRM sencillo',
    description:
      'Sus clientes, sus seguimientos y sus ventas en un solo lugar. Sin campos que nadie llena.',
  },
  {
    id: 'mejora-web',
    number: '02',
    name: 'Mejora de páginas web',
    description:
      'Tomamos el sitio que ya tiene y lo dejamos rápido, claro y presentable. Sin empezar de cero si no hace falta.',
  },
  {
    id: 'automatizaciones',
    number: '03',
    name: 'Automatizaciones',
    description:
      'Atención multicanal, reportes que se arman solos y tareas repetitivas que consumen horas.',
  },
  {
    id: 'infraestructura',
    number: '04',
    name: 'Infraestructura',
    description: 'Servidores, respaldos y monitoreo. Su sistema queda en línea y con alguien mirando.',
  },
  {
    id: 'acompanamiento',
    number: '05',
    name: 'Acompañamiento',
    description:
      'Plan mensual con horas de desarrollo, corrección de errores y cambios a medida que el negocio crece.',
  },
];
