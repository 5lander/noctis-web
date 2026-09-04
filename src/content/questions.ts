import type { Question } from './types';

/**
 * Las siete preguntas del acordeón.
 *
 * **Eran cuatro y las cuatro contestaban objeciones técnicas.** Precio, plazo,
 * aislamiento de datos y salida. Las tres nuevas contestan las humanas, que son
 * las que de verdad frenan a un dueño de PYME antes de escribir: no sé quién es
 * usted, no sé si soy muy chico para usted, y no sé si me va a atender estando
 * lejos. Van en ese orden y arriba, porque son las que se piensan primero.
 *
 * **La primera ahora da cifras, y eso invierte una regla del sitio.** Hasta
 * ahora ningún texto podía llevar un monto: RN5 y una prueba lo fijaban. La
 * decisión D13 de `DECISIONES.md` pasó a verde el 3 de septiembre de 2026 con
 * los tres montos anotados, así que la prueba cambió con ella.
 *
 * Lo que **no** cambia es el fondo de RN5: estos son pisos y no precios
 * cerrados, la frase sigue derivando a proforma, y el bot sigue sin poder
 * inventar un número. Un piso filtra; un precio cerrado compromete.
 */
export const QUESTIONS: readonly Question[] = [
  {
    id: 'precio',
    question: '¿Cuánto cuesta?',
    answer:
      'Una página nueva arranca desde USD 890 y se cotiza por fases, con un valor cerrado por fase. Los productos van por suscripción mensual desde USD 39, más USD 90 de puesta en marcha por única vez, según el tamaño del negocio. Antes de comprometerse a nada recibe una proforma con el detalle, sin costo.',
  },
  {
    id: 'quienes',
    question: '¿Quiénes son ustedes?',
    answer:
      'Noctis es un estudio de desarrollo en Loja, a cargo de Lander Chicaiza. El que le contesta es el mismo que programa: no hay ejecutivo de cuenta ni nadie repitiendo el encargo por el camino.',
  },
  {
    id: 'tamano',
    /*
     * La segunda mitad de la respuesta solo funciona si es verdad.
     *
     * Decir a quién no le sirve es la señal de confianza más barata que existe y
     * filtra las consultas que hacen perder la mañana, pero únicamente si de
     * verdad se rechazan esos encargos. Publicada sin cumplirla, es la primera
     * promesa que un cliente descubre rota.
     */
    question: 'Mi negocio es chico. ¿Les interesa igual?',
    answer:
      'Sí. La mayoría de lo que hacemos es para locales de dos o tres personas. Donde no somos la mejor opción es en cadenas grandes que ya tienen sistema propio andando, y en esos casos se lo decimos en la primera llamada.',
  },
  {
    id: 'cobertura',
    question: '¿Trabajan fuera de Loja?',
    answer:
      'Sí. Casi todo el trabajo se hace por videollamada y funciona igual desde cualquier ciudad. En Loja podemos ir a su local; fuera de Loja, todo va en línea.',
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
