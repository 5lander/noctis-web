import { ANIMATION_READY_SCRIPT } from '@/components/animation/animation-ready-source';
import { THEME_SCRIPT } from '@/components/theme/theme-script-source';

/**
 * Los dos scripts del `<head>`, unidos en uno.
 *
 * El separador **no es cosmético**. Las dos constantes terminan y empiezan en
 * `)`/`(`, así que concatenarlas a secas produce `})()(function(){…})()`: el
 * navegador lee eso como "llamá al resultado del primer paréntesis", tira
 * `TypeError: (intermediate value)(...) is not a function` y **el segundo script
 * no corre nunca**. Eso dejaba sin poner la clase `animation-ready`, y con ella
 * se caía el estado inicial de toda la animación y el temporizador de rescate.
 *
 * El error no se veía: la página se ve bien sin animación, y cada script pasaba
 * su propia prueba por separado. Por eso lo que se prueba acá es **el texto
 * unido**, que es lo único que el navegador llega a ejecutar.
 */
export const HEAD_SCRIPT = [THEME_SCRIPT, ANIMATION_READY_SCRIPT].join(';');
