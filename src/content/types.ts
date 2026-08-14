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

/** Los cuatro estados posibles de un producto (`SPEC.md` §5.1). */
type ProductStage = 'disponible' | 'en-pruebas' | 'en-desarrollo' | 'proyecto-futuro';

export interface Product {
  readonly id: string;
  readonly scope: string;
  readonly name: string;
  readonly summary: string;
  readonly capabilities: readonly string[];
  readonly stage: ProductStage;
  readonly stageLabel: string;
  readonly audience: string;
}

/**
 * Un trabajo del portafolio.
 *
 * `cover` acepta una portada tipográfica o una imagen desde el primer día. El
 * criterio de aceptación de P10 es que el componente **no haya que reescribirlo**
 * cuando lleguen las capturas reales (C1), y eso se decide en el tipo, no
 * después.
 */
export type WorkCover =
  | { readonly kind: 'typographic'; readonly lines: readonly string[]; readonly treatment: WorkTreatment }
  | { readonly kind: 'image'; readonly src: string; readonly alt: string };

export type WorkTreatment = 'plain' | 'inverted' | 'italic' | 'uppercase';

export interface Work {
  readonly id: string;
  readonly client: string;
  readonly kind: string;
  readonly year: string;
  readonly href: string;
  readonly cover: WorkCover;
  /** Marcador de posición hasta que llegue el trabajo real autorizado (C1). */
  readonly placeholder: boolean;
}

export interface Service {
  readonly id: string;
  readonly number: string;
  readonly name: string;
  readonly description: string;
}

export interface ProcessStep {
  readonly id: string;
  readonly stage: string;
  readonly title: string;
  readonly description: string;
}

export interface Question {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface SectionHeading {
  readonly label: string;
  readonly title: string;
  readonly support?: string;
}
