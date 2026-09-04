import { IDENTITY } from './site';
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

/*
 * Un solo rótulo por intención.
 *
 * La barra decía «Hablemos» y la portada «Conversemos», y los dos iban al mismo
 * ancla y hacían exactamente lo mismo. Dos nombres para una acción obligan al
 * visitante a comprobar si son la misma cosa. Se queda «Conversemos», que es el
 * verbo que el resto del copy ya usa, y se repite igual en la barra, la portada
 * y el pie.
 */
const CONTACT_ACTION = {
  /*
   * «Conversemos» no decía qué recibe quien lo toca. «Pedir propuesta» sí, y
   * nombra el resultado en vez de la acción.
   */
  label: 'Pedir propuesta',
  href: '#contacto',
  /*
   * La línea de debajo del botón principal, y no es adorno: quita las dos
   * objeciones que frenan el clic, cuánto cuesta preguntar y cuándo contestan.
   *
   * **Solo se publica si se cumple.** Una promesa de respuesta incumplida hace
   * más daño que no prometer nada: el visitante la usa para medir si el resto de
   * lo que dice la página también es verdad.
   */
  note: 'No cuesta nada y no lo compromete a nada. Le contestamos el mismo día hábil.',
} as const;

export const NAV_CTA = CONTACT_ACTION;

/*
 * La portada dejó de vender un beneficio y pasa a decir qué es Noctis.
 *
 * Las versiones anteriores abrían por la pérdida —«Cada tarea repetida le cuesta
 * horas y ventas»— y por eso `content.spec.ts` exigía las palabras «horas» y
 * «ventas» en el titular. Esta abre por la categoría: primero qué se compra,
 * después qué se gana. Es un cambio de posicionamiento, no de redacción, así que
 * la prueba cambió con él en vez de borrarse.
 *
 * **Ojo con lo que promete «a la medida».** Es lo más grande que dice la página,
 * y la lista de servicios no vende software a medida: quedó fuera del alcance
 * comercial en `SPEC.md` §5.2 y hay una prueba que lo vigila sobre `SERVICES`.
 * Hoy conviven porque el titular habla de cómo se construye y la lista de qué se
 * contrata, pero es una tensión real y está anotada para resolverla: o se abre
 * el alcance, o el titular baja a lo que sí se vende.
 */
export const HERO = {
  /*
   * El rótulo de encima del titular dice quién habla antes de decir qué ofrece.
   * Es el segundo en versalitas de toda la página, después del de lugar, y no
   * repite ningún enlace del menú: por eso puede quedarse sin volver al ruido de
   * los diecisiete que se retiraron.
   */
  eyebrow: 'Noctis · Desarrollo de software',
  headline: 'Software hecho a la medida de cómo trabaja su negocio.',
  /*
   * Catorce palabras, tope veinte.
   *
   * Nombra las tres cosas que se contratan y cierra con la única frase que una
   * agencia de afuera no puede copiar: que se construye acá y no se revende
   * hecho. «No comprados hechos» es la objeción al producto enlatado, dicha en
   * cuatro palabras.
   */
  support:
    'Páginas web, sistemas de gestión y atención automatizada. Construidos en Loja, no comprados hechos.',
  /*
   * La acción principal es contactar, no mirar el portafolio.
   *
   * Estaba al revés: el botón sólido llevaba a la grilla de trabajos. Mientras
   * el portafolio se llena desde el panel —y aunque se llene— el resultado que
   * el sitio tiene que producir es una conversación, y el elemento más visible
   * de la portada es lo que decide a dónde va la mayoría.
   */
  primary: CONTACT_ACTION,
  secondary: { label: 'Ver trabajos', href: '#trabajos' },
  place: 'Loja, Ecuador',
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
    title: 'Tres problemas que un negocio arrastra todos los días.',
    support:
      'Cada uno resuelve uno solo, completo. Le decimos en qué punto está cada producto para que sepa qué puede usar hoy.',
  },
  /*
   * El titular ya no afirma que todo lo listado esté publicado, y ya no presenta
   * dos tarjetas como si fueran el currículum entero.
   *
   * «Lo que hemos entregado» con dos piezas se lee como escasez. El titular
   * nuevo cambia el tema de **cuántos** a **cuánto se enseña**, que es donde
   * Noctis gana: casi ningún estudio publica el recorrido completo de lo que
   * hizo, porque casi ninguno puede. «Sin capturas escogidas» es la frase que
   * sostiene esa diferencia, y es comprobable en la misma pantalla.
   */
  works: {
    title: 'Vea el trabajo completo antes de contratarlo.',
    support:
      'Cada uno va en video y de arriba abajo, sin capturas escogidas. Los que ya están publicados se abren desde su tarjeta.',
  },
  /*
   * El titular hace la afirmación que la sección tiene que sostener: que la
   * elección visual responde al negocio del cliente y no al gusto del estudio.
   * Sin esa frase, cuatro tableros seguidos son un muestrario de estilos.
   */
  languages: {
    title: 'El diseño se elige según el negocio, no según nuestro gusto.',
    support:
      'Cuatro lenguajes que sabemos ejecutar de punta a punta. El de esta página es uno; el de Burnout, que está aquí arriba, es otro.',
  },
  services: {
    title: 'Trabajo puntual, cuando no hace falta un producto entero.',
    /*
     * La sección no tenía línea de apoyo y era la que más falta le hacía: seis
     * servicios sin precio y sin forma de comprarlos dejan al visitante sin
     * saber cómo se empieza. Esta frase contesta las dos preguntas que siguen a
     * «me interesa»: cuánto me comprometo y cuándo puedo parar.
     */
    support: 'Cada fase se cotiza con un valor cerrado y no empieza hasta que usted la apruebe.',
  },
  process: {
    title: 'Primero entendemos el negocio. Después escribimos código.',
  },
  questions: {
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
  /*
   * La línea de debajo del botón. El botón se queda como está: es claro y hace
   * lo que dice.
   *
   * Va exactamente donde aparece el último miedo, que es al terminar de escribir
   * y antes de tocar enviar. Dice las tres cosas que decide ahí: cuándo
   * contestan, qué se hace con lo que escribió y cómo se deshace. Lo del borrado
   * no es cortesía: es la vía de supresión que exige la LOPDP y que ya está
   * detallada en `/privacidad`.
   */
  note: 'Le contestamos el mismo día hábil. Lo que escriba aquí no sale de nosotros, y si quiere que lo borremos, lo borramos.',
} as const;

/*
 * El pie deja de ser una firma y pasa a ser identidad verificable.
 *
 * Un dueño de PYME que no conoce a la empresa mira exactamente esto para decidir
 * si existe: dónde está, cómo se le escribe y a qué hora contesta. Estuvo vacío
 * hasta hoy, y era el freno más caro que tenía el sitio: una empresa de software
 * que vende a distancia y no dice quién es se parece demasiado a nadie.
 *
 * Los datos de identidad viven en `content/site.ts` y no acá, porque los usa más
 * de un sitio: el pie los pinta, y el número de WhatsApp lo consumen además el
 * botón flotante y su mensaje precargado.
 *
 * El componente sigue omitiendo la línea que esté vacía. La regla no era del
 * momento en que faltaban datos: es la que impide que se publique un marcador de
 * posición donde va un dato de identidad.
 */
export const FOOTER = {
  /*
   * El cierre ya no repite el titular, y es deliberado.
   *
   * `SPEC.md` §6.11 pedía que la página abriera y cerrara con la misma frase, y
   * con el titular anterior funcionaba. Con este no: el titular nombra una
   * pérdida, y terminar una página de venta recordándole al visitante lo que
   * pierde es cerrar en el punto más bajo. Abre con el problema, cierra con el
   * estado al que se llega. Es el mismo recurso —una frase que enmarca— con el
   * arco completo en vez de a la mitad.
   */
  phrase: 'Su negocio, sin el trabajo repetido.',
  company: 'Noctis',
  city: 'Loja, Ecuador',
  hours: 'Lunes a viernes, 09:00 a 17:30',
  rights: '© 2026',
  taxId: IDENTITY.taxId,
  credit: IDENTITY.credit,
  address: IDENTITY.address,
  email: IDENTITY.email,
  /*
   * No hay teléfono en el pie. El botón flotante es el único sitio del que cuelga
   * WhatsApp: dos destinos idénticos a pocos píxeles obligan a comprobar si son
   * lo mismo. El número sigue viviendo en `content/site.ts`, que es de donde lo
   * toma ese botón.
   */
  privacyLabel: 'Aviso de privacidad',
  privacyHref: '/privacidad',
} as const;
