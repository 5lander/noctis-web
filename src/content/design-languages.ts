import type { DesignLanguage } from './types';

/**
 * Los cuatro lenguajes de diseño que Noctis ejecuta.
 *
 * **Por qué existe esta sección.** Un dueño de negocio que llega buscando quién
 * le haga la página no sabe si el estudio sabe hacer algo distinto de lo que
 * tiene delante. Y esta página es deliberadamente una sola cosa: serif
 * editorial, índigo, mucho blanco. Sin enseñar el rango, el visitante concluye
 * que es el único registro que hay.
 *
 * **Por qué no se resuelve mezclando estilos en la propia página.** Una página
 * que es minimalista arriba y brutalista abajo no se lee como versátil: se lee
 * como que nadie decidió. El rango se demuestra enseñando piezas terminadas,
 * cada una coherente consigo misma, no rompiendo la coherencia de esta.
 *
 * **Qué son y qué no son estas imágenes.** Son tableros de dirección: cada uno
 * enseña cómo se ve un lenguaje resuelto de punta a punta. No son trabajos
 * entregados y no llevan nombre de cliente — para eso está la sección de
 * trabajos, que sale de la base y solo muestra lo que alguien autorizó.
 *
 * El primero es el lenguaje de esta misma página y el último es el de Burnout,
 * que además está entregado. Los dos extremos del rango están respaldados.
 */
export const DESIGN_LANGUAGES: readonly DesignLanguage[] = [
  {
    id: 'minimalista',
    name: 'Minimalista',
    fit: 'Producto técnico o servicio profesional, donde la confianza se gana quitando ruido y no añadiendo adornos.',
    board: {
      src: '/lenguaje/minimalista.png',
      alt: 'Tablero minimalista: fondo blanco, un titular grande de peso medio, mucho espacio y una sola línea de acento.',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    fit: 'Contenido largo que se lee de verdad: publicaciones, informes, estudios de caso, cualquier cosa con más de tres párrafos.',
    board: {
      src: '/lenguaje/editorial.png',
      alt: 'Tablero editorial: cabecera con filete grueso, titular en serif y tres columnas de texto justificado con capitular.',
    },
  },
  {
    id: 'brutalista',
    name: 'Brutalista',
    fit: 'Marcas jóvenes que compiten por atención y prefieren incomodar a pasar desapercibidas.',
    board: {
      src: '/lenguaje/brutalista.png',
      alt: 'Tablero brutalista: amarillo saturado y negro, bordes gruesos a la vista, tipografía de palo pesada y monoespaciada.',
    },
  },
  {
    id: 'cinematografico',
    name: 'Oscuro cinematográfico',
    fit: 'Audiovisual, eventos y todo lo que se vende por la sensación antes que por la ficha técnica.',
    board: {
      src: '/lenguaje/cinematografico.png',
      alt: 'Tablero oscuro: negro profundo con halo violeta, titular pesado en dos pesos de color y botones redondeados.',
    },
  },
];
