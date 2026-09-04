/**
 * Formas del contenido del sitio.
 *
 * `content/` es la fuente única de los textos (`CLAUDE.md` §2): ningún otro
 * módulo escribe acá y ningún texto de cara al usuario vive fuera. Tipar las
 * formas hace que agregar un producto sin su estado, o un trabajo sin su año,
 * no compile.
 *
 * El módulo no importa nada: `contenido-es-hoja` en dependency-cruiser falla si
 * alguna vez lo hace.
 */

/*
 * Los trabajos ya no viven acá. Dejaron de ser contenido escrito a mano y pasaron
 * a ser datos del portafolio (`modules/portfolio`), que se cargan desde `/admin`.
 * Sus tipos están en el dominio de ese módulo, que es donde pueden llevar
 * reglas: un trabajo tiene estado de publicación y validación, y `content/` es
 * una hoja sin lógica por diseño.
 */

/** Los cuatro estados posibles de un producto (`SPEC.md` §5.1). */
type ProductStage = 'disponible' | 'en-pruebas' | 'en-desarrollo' | 'proyecto-futuro';

/**
 * Una imagen del sitio con su texto alternativo.
 *
 * El alternativo va acá y no en el componente porque es texto de cara al
 * usuario: lo lee un lector de pantalla y lo lee el buscador. `src` es siempre
 * una ruta del propio dominio — la CSP declara `img-src 'self' data:`, así que
 * una imagen de un tercero no cargaría y el hueco aparecería en producción.
 */
interface SiteImage {
  readonly src: string;
  readonly alt: string;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly shot: SiteImage;
  /**
   * El sitio vivo del producto, o `null` si todavía no hay ninguno que abrir.
   *
   * No es opcional a propósito: obliga a decidirlo producto por producto. Un
   * enlace que promete una demostración y no lleva a ninguna parte hace más daño
   * que no tener enlace, y esa es exactamente la trampa en la que ya cayó el
   * botón «Ver trabajos» de la portada.
   */
  readonly href: string | null;
  readonly summary: string;
  readonly capabilities: readonly string[];
  readonly stage: ProductStage;
  readonly stageLabel: string;
  readonly audience: string;
}

export interface Service {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface ProcessStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Un lenguaje de diseño que el estudio sabe ejecutar.
 *
 * `fit` es lo que lo salva de ser un catálogo de estilos: no dice cómo se ve
 * —eso lo dice la imagen— sino a qué negocio le sirve. Un estudio que enseña
 * cuatro estéticas sin decir cuándo usa cada una está enseñando gusto; uno que
 * dice cuándo, está enseñando criterio.
 */
export interface DesignLanguage {
  readonly id: string;
  readonly name: string;
  readonly fit: string;
  readonly board: SiteImage;
}

export interface Question {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/*
 * El encabezado ya no lleva rótulo en versalita.
 *
 * Tenía uno por sección, y los cuatro repetían palabra por palabra el enlace del
 * menú que acababa de traer al visitante hasta ahí. Sumados a los de producto,
 * servicio y paso eran diecisiete rótulos idénticos en seis secciones, y ese
 * ritmo repetido es lo que hacía que la página se leyera como plantilla. El
 * titular solo alcanza para saber dónde está uno.
 */
export interface SectionHeading {
  readonly title: string;
  readonly support?: string;
}

/**
 * Una cifra de la banda de prueba de la portada.
 *
 * `value` es un número y no una cadena porque el contador de la capa de
 * animación lo anima subiendo hasta él; `suffix` es lo que va pegado y no se
 * cuenta, como el «/7» de «24/7».
 *
 * `detail` no es decoración: una cifra suelta no significa nada, y la frase de
 * abajo es lo que la convierte en un argumento. Sin ella, cuatro números
 * grandes en fila son ruido de plantilla.
 */
export interface ProofFigure {
  readonly id: string;
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
  readonly detail: string;
}
