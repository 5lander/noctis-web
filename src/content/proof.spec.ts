import { describe, expect, it } from 'vitest';

import { PRODUCTS } from './products';
import { PROOF_FIGURES } from './proof';

/**
 * La banda de cifras es el sitio de la página donde más barato sale mentir y
 * más caro sale que lo pillen.
 *
 * Un número grande no se lee como una afirmación: se lee como un hecho, y por
 * eso nadie lo comprueba hasta que decide comprar. Ahí sí lo comprueba, y ahí es
 * donde se pierde el trabajo.
 *
 * No se puede probar desde acá que se hayan entregado seis páginas: eso lo
 * sabe quien las hizo. Lo que sí se puede probar es todo lo demás: que la cifra
 * del catálogo salga del catálogo, que ninguna cifra escrita a mano se dispare,
 * que todas sean cuentas de cosas enteras y que cada número venga con la frase
 * que lo explica.
 *
 * Hubo un cuarto grupo que exigía una nota reconociendo que el portafolio enseña
 * menos de lo que la banda cuenta. Se retiró junto con la nota, por decisión del
 * usuario del 3 de septiembre de 2026. Queda anotado acá y no borrado en
 * silencio: la distancia entre las dos secciones sigue existiendo, y lo que
 * cambió es que la página ya no la nombra.
 */

function figure(id: string): { readonly value: number; readonly detail: string } {
  const found = PROOF_FIGURES.find((item) => item.id === id);
  if (found === undefined) throw new Error(`No existe la cifra ${id}`);
  return found;
}

/**
 * El techo no es un número mágico: es el orden de magnitud de un estudio de tres
 * personas que lleva menos de un año. Cualquier cifra que lo pase necesita venir
 * derivada de una lista real, no escrita a mano.
 */
const TECHO_DE_CIFRA_ESCRITA_A_MANO = 30;

describe('las cifras derivadas salen del contenido real', () => {
  it('los productos propios se cuentan del catálogo, no se escriben', () => {
    expect(figure('productos').value).toBe(PRODUCTS.length);
  });

  /*
   * Dos de los tres productos siguen sin terminarse, y la tarjeta de cada uno lo
   * dice unas pantallas más abajo. Si la banda insinuara tres productos listos,
   * la propia página la desmentiría.
   */
  it('la cifra de productos no insinúa que los tres estén terminados', () => {
    const enProduccion = PRODUCTS.filter((product) => product.stage === 'disponible');

    expect(enProduccion).toHaveLength(1);
    expect(figure('productos').detail).toContain('desarrollo');
    expect(figure('productos').detail).toContain('producción');
  });
});

describe('las cifras escritas a mano se mantienen dentro de lo comprobable', () => {
  it('ninguna se dispara', () => {
    for (const item of PROOF_FIGURES) {
      expect(item.value).toBeLessThanOrEqual(TECHO_DE_CIFRA_ESCRITA_A_MANO);
    }
  });

  it('todas son cuentas de cosas enteras', () => {
    for (const item of PROOF_FIGURES) {
      expect(Number.isInteger(item.value)).toBe(true);
      expect(item.value).toBeGreaterThan(0);
    }
  });

  it('cada cifra viene con la frase que la explica', () => {
    for (const item of PROOF_FIGURES) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.detail.length).toBeGreaterThan(0);
    }
  });
});
