import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Observer } from 'gsap/Observer';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Registro de los plugins, en un módulo aparte y una sola vez.
 *
 * Todos vienen del paquete `gsap` de npm y se empaquetan con la aplicación:
 * **nunca desde un CDN** (`CLAUDE.md` §1, verificado por `audit:forbidden`).
 *
 * Los cinco eran de Club hasta 2025. Desde que Webflow liberó GSAP por completo
 * son gratuitos, incluido el uso comercial, y el propio paquete los trae: eso es
 * lo que cierra D15 (ADR-0012) y lo que permite que RA-01 se resuelva con
 * `SplitText` en vez de partir el titular a mano.
 *
 * `registerPlugin` es idempotente, pero se hace en la carga del módulo para que
 * no dependa de que cada efecto se acuerde de llamarlo.
 */

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, Observer);

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, Observer };
