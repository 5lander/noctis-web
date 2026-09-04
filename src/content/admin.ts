/**
 * Los textos del panel.
 *
 * Están acá y no dentro de las páginas de `/admin` por la misma regla que rige
 * al resto del sitio (`CLAUDE.md` §2): ningún texto de cara a una persona vive
 * dentro de un componente. La prueba de `content.spec.ts` recorre `src/app`
 * entero, y el panel no es una excepción por ser interno — el día que alguien
 * más del equipo cargue contenido, va a leer estas palabras.
 */

export const ADMIN_TEXT = {
  brand: 'Panel de Noctis',
  signIn: {
    title: 'Acceso al panel',
    support: 'Desde acá se cargan los clientes y los trabajos que se ven en el sitio.',
    label: 'Clave',
    submit: 'Entrar',
    error: 'Clave incorrecta.',
    throttled: 'Demasiados intentos. Espere un minuto y vuelva a probar.',
  },
  signOut: 'Salir',
  nav: { works: 'Trabajos', clients: 'Clientes', site: 'Ver el sitio' },
  status: { draft: 'Borrador', published: 'Publicado' },
  actions: {
    newWork: 'Nuevo trabajo',
    newClient: 'Nuevo cliente',
    edit: 'Editar',
    save: 'Guardar',
    remove: 'Eliminar',
    publish: 'Publicar',
    unpublish: 'Pasar a borrador',
    cancel: 'Cancelar',
  },
  works: {
    title: 'Trabajos',
    support:
      'Solo los publicados se ven en el sitio. Si no hay ninguno publicado, la sección de trabajos no se pinta: es preferible a mostrar ejemplos que el visitante lee como clientes reales.',
    empty: 'Todavía no hay trabajos cargados.',
    columns: { client: 'Cliente', kind: 'Tipo', year: 'Año', status: 'Estado', order: 'Orden' },
  },
  clients: {
    title: 'Clientes',
    support:
      'Los clientes publicados forman la fila de logotipos del sitio. Un cliente sin logotipo no se pinta ahí, pero igual sirve para agrupar sus trabajos.',
    empty: 'Todavía no hay clientes cargados.',
    columns: { name: 'Nombre', city: 'Ciudad', sector: 'Sector', status: 'Estado', order: 'Orden' },
  },
  workForm: {
    title: 'Trabajo',
    client: 'Nombre del cliente',
    clientHint: 'Como quiere que aparezca en la tarjeta. Pida autorización antes de publicarlo.',
    linked: 'Cliente vinculado',
    none: 'Sin vincular',
    kind: 'Tipo de trabajo',
    kindHint: 'Sitio + WhatsApp · Catálogo y pedidos · Agenda con Care…',
    year: 'Año',
    href: 'Enlace al sitio',
    hrefHint: 'Tiene que empezar por https://. Si se deja vacío, la tarjeta no es un enlace.',
    summary: 'Qué se resolvió',
    summaryHint: 'Una o dos líneas. Es lo que convence a quien está evaluando.',
    cover: 'Captura del sitio',
    coverHint: 'PNG, JPG, WebP o AVIF de hasta 4 MB. Sin captura, la portada es tipográfica.',
    coverAlt: 'Descripción de la captura',
    coverAltHint: 'Lo que oye quien usa lector de pantalla. Obligatorio si hay imagen.',
    tour: 'Recorrido en vídeo',
    tourHint:
      'MP4 de hasta 12 MB, sin sonido: la página entregada, recorrida de arriba abajo. Es lo que convierte una portada en una prueba.',
    order: 'Orden',
    orderHint: 'Menor primero.',
    status: 'Estado',
  },
  clientForm: {
    title: 'Cliente',
    name: 'Nombre',
    city: 'Ciudad',
    sector: 'Sector',
    logo: 'Logotipo',
    logoHint: 'PNG, JPG, WebP o AVIF de hasta 4 MB.',
    order: 'Orden',
    status: 'Estado',
  },
  errors: {
    invalid: 'Revise los campos marcados.',
    upload: 'Formato no admitido. Use PNG, JPG, WebP o AVIF de hasta 4 MB.',
  },
} as const;
