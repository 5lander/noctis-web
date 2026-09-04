import type { Service } from './types';

/**
 * Los seis servicios (`SPEC.md` §5.2).
 *
 * **Eran cinco y faltaba el principal.** La lista ofrecía «Mejora de páginas
 * web» pero no ofrecía hacer una página nueva, mientras la banda de cifras
 * cuenta seis entregadas, la marquesina dice «Páginas web», los dos trabajos
 * publicados son páginas y el formulario tiene la opción «Página web nueva o
 * rediseño». Lo que más se enseñaba en la página no estaba a la venta en la
 * página, y quien llegaba buscando eso no encontraba dónde se compraba.
 *
 * **«Mejora» pasó a «Rediseño»** porque es la palabra que escribe quien busca.
 * Nadie busca «mejora de páginas web».
 *
 * **No se ofrece software a medida ni integraciones**: quedaron fuera del
 * alcance comercial, y hay una prueba que lo vigila. Si alguien quiere
 * agregarlos, es una decisión de negocio, no un cambio de contenido.
 */
export const SERVICES: readonly Service[] = [
  {
    id: 'pagina-nueva',
    name: 'Página web nueva',
    description:
      'Desde cero, con el lenguaje visual que le sirva a su negocio. Textos, imágenes y medición incluidos.',
  },
  {
    id: 'crm',
    name: 'CRM sencillo',
    description:
      'Sus clientes, sus seguimientos y sus ventas en un solo lugar. Sin campos que nadie llena.',
  },
  {
    id: 'mejora-web',
    name: 'Rediseño de páginas web',
    description:
      'Tomamos el sitio que ya tiene y lo dejamos rápido, claro y presentable. Sin empezar de cero si no hace falta.',
  },
  {
    id: 'automatizaciones',
    name: 'Automatizaciones',
    description:
      'Atención multicanal, reportes que se arman solos y tareas repetitivas que consumen horas.',
  },
  {
    id: 'infraestructura',
    name: 'Infraestructura',
    description: 'Servidores, respaldos y monitoreo. Su sistema queda en línea y con alguien mirando.',
  },
  {
    id: 'acompanamiento',
    name: 'Acompañamiento',
    description:
      'Plan mensual con horas de desarrollo, corrección de errores y cambios a medida que el negocio crece.',
  },
];
