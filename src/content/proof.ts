import { PRODUCTS } from './products';
import type { ProofFigure } from './types';

/**
 * La banda de cifras de la portada.
 *
 * **Todas las cifras de este archivo son trabajo entregado de verdad.** No es
 * una preferencia de estilo: es RN8 de `CLAUDE.md` §6 —el sitio no menciona lo
 * que todavía no existe— y es la misma decisión por la que en P11.2 se borró el
 * adaptador de portafolio con clientes de ejemplo en cuanto entró un trabajo
 * real. Una cifra inflada en esta banda es el mismo error en el sitio de la
 * página donde más se mira y donde más caro sale que lo pillen: el prospecto que
 * está por firmar es exactamente el que pide referencias.
 *
 * **De dónde salen los números.** Las tres primeras las confirmó Lander el 3 de
 * septiembre de 2026, contando trabajo entregado a clientes. La cuarta no se
 * escribe: se deriva de `content/products.ts`, así que no puede desincronizarse
 * del catálogo. `proof.spec.ts` fija esa derivación.
 *
 * **Las páginas son seis y el reparto importa**, porque es la única cifra que el
 * visitante puede intentar cuadrar con lo que ve. Son cinco encargos que el
 * cliente pidió no publicar, más Burnout, que también es un encargo y además
 * está abajo con su recorrido. **Care no cuenta**: es la página de un producto
 * propio, no un trabajo para un cliente, y meterla en esta cifra sería contar el
 * material comercial de uno mismo como obra entregada. Es justo la clase de
 * inflado que un prospecto detecta al abrir el enlace.
 *
 * **La banda cuenta más de lo que el portafolio enseña, y no lo explica.** Casi
 * todos los clientes pidieron no salir publicados, así que abajo hay dos
 * trabajos y acá arriba trece. Hubo una nota que decía justamente eso y se
 * retiró por decisión del usuario el 3 de septiembre de 2026: dicha así sonaba a
 * disculpa, y una página de venta no se disculpa.
 *
 * Si alguna vez se quiere volver a cerrar ese hueco, la forma es decirlo desde el
 * otro lado —una política propia, «no publicamos el nombre de un cliente sin su
 * permiso», en vez de un cliente que no quiso salir— y ese sitio es el
 * encabezado de Trabajos, no esta banda.
 *
 * **Si una cifra sube, sube contando.** No se redondea hacia arriba y no se
 * estima: ante la duda entre cinco y seis, va cinco.
 */
export const PROOF_FIGURES: readonly ProofFigure[] = [
  {
    id: 'paginas',
    value: 6,
    suffix: '',
    label: 'Páginas web',
    detail: 'Encargos entregados. Una de ellas, la de Burnout, está aquí abajo con su recorrido completo.',
  },
  {
    id: 'crm',
    value: 4,
    suffix: '',
    label: 'CRM entregados',
    detail: 'Clientes, seguimientos y ventas, montados sobre cómo ya trabaja cada negocio.',
  },
  {
    id: 'automatizaciones',
    value: 4,
    suffix: '',
    label: 'Automatizaciones',
    detail: 'Atención por WhatsApp y redes contestando sin que nadie tenga que estar despierto.',
  },
  {
    id: 'productos',
    /** Derivada: `content/products.ts`. Hoy Commerce, Care y Automatización. */
    value: PRODUCTS.length,
    suffix: '',
    label: 'Productos propios',
    /*
     * Dice el reparto y no solo el total, a propósito.
     *
     * «3 productos propios» a secas se lee como tres productos terminados, y dos
     * todavía no lo están. El estado de cada uno ya sale en su tarjeta unas
     * pantallas más abajo: una cifra que lo contradiga se cae sola en la misma
     * página.
     */
    detail: 'Construidos por nosotros, no revendidos. Dos en desarrollo y uno en producción, que se puede abrir.',
  },
];
