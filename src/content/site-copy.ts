import type { SectionHeading } from './types';

/**
 * Todo el texto del sitio que no es una lista: barra, portada, marquesina,
 * encabezados de sección, testimonio, contacto y pie.
 *
 * Los tres marcadores de posición de `SPEC.md` §5.4 —testimonio, WhatsApp y
 * enlace para agendar— están marcados abajo. **No se publican hasta tener el
 * dato real** (`DECISIONES.md` C2 y C3).
 */

export const NAV_LINKS = [
  { id: 'productos', label: 'Productos', href: '#productos' },
  { id: 'trabajos', label: 'Trabajos', href: '#trabajos' },
  { id: 'servicios', label: 'Servicios', href: '#servicios' },
  { id: 'proceso', label: 'Proceso', href: '#proceso' },
] as const;

export const NAV_CTA = { label: 'Hablemos', href: '#contacto' } as const;

export const HERO = {
  headline: 'Su negocio no cierra a las seis.',
  support:
    'Construimos software y páginas web para negocios que siguen vendiendo, agendando y contestando cuando el local ya cerró.',
  primary: { label: 'Ver trabajos', href: '#trabajos' },
  secondary: { label: 'Conversemos', href: '#contacto' },
  place: 'Guayaquil, Ecuador · Meridian Holding',
} as const;

/** La banda en bucle de la marquesina (`SPEC.md` §6.3). */
export const MARQUEE_ITEMS = [
  'Páginas web',
  'Automatización',
  'WhatsApp',
  'CRM',
  'Infraestructura',
  'Agenda de citas',
  'Gestión comercial',
  'Soporte',
] as const;

/**
 * `satisfies` y no una anotación `Record<string, …>`: así cada encabezado se
 * valida contra el tipo pero `HEADINGS.products` sigue siendo una clave conocida
 * y no una búsqueda que pueda salir vacía.
 */
export const HEADINGS = {
  products: {
    label: 'Productos',
    title: 'Cuatro problemas que un negocio arrastra todos los días.',
    support:
      'Cada uno resuelve uno solo, completo. Le decimos en qué punto está cada producto para que sepa qué puede usar hoy.',
  },
  works: {
    label: 'Trabajos',
    title: 'Páginas y sistemas que ya están en línea.',
    support:
      'Marcadores de posición: cuando tengamos las capturas reales, cada cuadro se reemplaza por la imagen del sitio y el nombre del cliente.',
  },
  services: {
    label: 'Servicios',
    title: 'Trabajo puntual, cuando no hace falta un producto entero.',
  },
  process: {
    label: 'Proceso',
    title: 'Primero entendemos el negocio. Después escribimos código.',
  },
  questions: {
    label: 'Preguntas',
    title: 'Lo que todos preguntan antes de decidir.',
  },
} as const satisfies Record<string, SectionHeading>;

/**
 * Testimonio. **Marcador de posición**: el nombre y el cargo reales son C2 de
 * `DECISIONES.md`. Con `pending` en `true`, la sección no se pinta: publicar un
 * testimonio con corchetes es peor que no tener testimonio.
 */
export const QUOTE = {
  pending: true,
  text: 'Hablo directo con quien programó el sistema. Se pide un cambio y a los días está.',
  author: '[Nombre del cliente]',
  role: 'Gerente · distribuidora',
} as const;

export const CONTACT = {
  title: 'Cuéntenos qué se le complica todos los días.',
  support:
    'Veinte minutos alcanzan para saber si algo de lo que hacemos le sirve. Si no le sirve, se lo decimos ahí mismo.',
  fields: {
    name: { id: 'nombre', label: 'Nombre', placeholder: 'Su nombre' },
    business: { id: 'negocio', label: 'Negocio', placeholder: 'Nombre del negocio' },
    email: { id: 'correo', label: 'Correo', placeholder: 'nombre@correo.com' },
    whatsapp: { id: 'whatsapp', label: 'WhatsApp', placeholder: '09 9999 9999' },
    interest: { id: 'interes', label: 'Qué le interesa' },
    message: {
      id: 'mensaje',
      label: 'Qué se le complica hoy',
      placeholder: 'En pocas líneas, cómo lo resuelve hoy.',
    },
  },
  interestOptions: [
    'Página web nueva o rediseño',
    'Automatización de atención y ventas',
    'Agenda de citas (Care)',
    'Gestión comercial (Commerce)',
    'CRM sencillo',
    'Infraestructura y soporte',
    'Todavía no lo tengo claro',
  ],
  submit: 'Enviar mensaje',
} as const;

export const FOOTER = {
  phrase: 'Su negocio no cierra a las seis.',
  company: 'Meridian Holding · Ecuador',
  rights: '© 2026',
} as const;
