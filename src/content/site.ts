/**
 * Identidad y metadatos del sitio. Único lugar donde vive este texto.
 *
 * Ningún texto de acá anuncia algo que todavía no existe (regla de negocio 8 de
 * CLAUDE.md §6).
 */

export const SITE = {
  name: 'Noctis',
  /*
   * «Páginas web» primero, y no es un capricho de orden.
   *
   * Es lo que la gente escribe en el buscador; «software» es lo que escribe
   * quien ya sabe lo que quiere. Van los dos y el que más se busca va delante.
   * Se cae «Ecuador» del final: el título ya se estaba yendo largo y la ciudad
   * es la señal que importa para una búsqueda local.
   *
   * Dos puntos y no raya larga, como en todo el sitio.
   */
  title: 'Noctis: páginas web y software para negocios en Loja',
  description:
    'Construimos software y páginas web para negocios pequeños y medianos de Loja y todo el Ecuador: comercio, salud, automatización de ventas e infraestructura.',
  locale: 'es-EC',
  /** Loja. La zona horaria sigue siendo `America/Guayaquil`: es la de todo el Ecuador continental. */
  city: 'Loja',
  region: 'Loja',
  country: 'Ecuador',
} as const;

/**
 * El canal por el que un dueño de PYME escribe primero en Ecuador.
 *
 * **Dejó de ser variable de entorno.** `WHATSAPP_NUMERO` existía porque el
 * número era C3 de `DECISIONES.md`, un dato pendiente que no se podía incrustar.
 * Ya está confirmado, y un número de contacto que se publica en el pie y en un
 * botón visible es contenido, no configuración: su sitio es `content/`
 * (`CLAUDE.md` §2). Tenerlo en dos lados era la única forma de que se
 * desincronizara.
 *
 * `digits` es lo que consume `wa.me`: formato internacional y solo dígitos.
 *
 * **El número no se pinta en ninguna parte, y por eso no hay versión legible.**
 * El botón flotante es el único sitio del que cuelga este canal; el pie llegó a
 * repetirlo como texto y se quitó, porque dos destinos idénticos a pocos píxeles
 * obligan al visitante a comprobar si son lo mismo. El día que haga falta
 * enseñarlo escrito, la forma en que se lee en Ecuador es `098 010 5699`.
 */
export const WHATSAPP = {
  digits: '593980105699',
  /*
   * El mensaje precargado dice a qué viene y nada más.
   *
   * Va sin punto final: lo que llega al chat es el arranque de algo que el
   * visitante va a seguir escribiendo, no un mensaje terminado que solo hay que
   * enviar. Y declara intención de contratar, que es lo que separa una consulta
   * de una curiosidad antes de que nadie conteste.
   */
  greeting: 'Hola, estoy interesado en contratar sus servicios',
} as const;

/**
 * Quién es la empresa, en los términos en los que se puede verificar.
 *
 * Un dueño de negocio que va a entregar su inventario o su agenda de pacientes
 * mira exactamente esto para decidir si existe alguien detrás. Mientras estos
 * campos estuvieron vacíos, el sitio era anónimo, y era el freno más caro que
 * tenía.
 *
 * Son datos públicos de una actividad comercial, publicados a propósito.
 */
export const IDENTITY = {
  /*
   * **No lleva razón social.** Es el nombre personal del dueño y se retiró a
   * pedido suyo: el RUC ya identifica la actividad comercial, que es lo que un
   * cliente necesita para comprobar que existe alguien detrás, y hace ese
   * trabajo sin publicar el nombre de una persona en la portada de internet.
   *
   * La dirección va por esquina y no por numeración. Es como se ubica un sitio en
   * Loja, y basta para llegar sin publicar el número exacto de la puerta.
   */
  taxId: 'RUC 1105704116001',
  address: 'Azuay y Olmedo, San Sebastián, Loja, Ecuador',
  email: 'slander@noctisdev.online',
  /*
   * La firma del estudio, debajo del RUC. Es crédito de autoría, no un dato de
   * identidad: dice quién construyó la página que el visitante está mirando, que
   * es en sí mismo la demostración que este sitio vende.
   */
  credit: 'dev by Noctis',
} as const;
