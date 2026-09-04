import { Container } from '@/components/layout/container';
import { PROOF_FIGURES } from '@/content/proof';

import styles from './proof-band.module.css';

/**
 * La banda de cifras, entre la marquesina y los productos.
 *
 * **Qué hace acá.** Un visitante que acaba de leer el titular está decidiendo si
 * seguir bajando, y lo que decide eso es si cree que hay alguien detrás. Cuatro
 * cifras concretas hacen ese trabajo mejor que un párrafo, porque se leen sin
 * leerlas.
 *
 * **Qué cifras.** Trabajo entregado de verdad: la cuenta está en
 * `content/proof.ts` con su procedencia. La de productos propios no se escribe,
 * se deriva del catálogo.
 *
 * **La banda no explica por qué el portafolio enseña menos.** Tuvo una nota que
 * lo hacía y se retiró a pedido: sonaba a disculpa. Ver `content/proof.ts`.
 *
 * **El número está en el HTML del servidor, ya en su valor final.** El contador
 * de la capa de animación solo lo hace subir cuando la banda entra en pantalla.
 * Sin JavaScript, con movimiento reducido o en móvil, la cifra está y es la
 * correcta: RN11.
 *
 * No lleva titular, igual que el registro nocturno. No es una sección de las que
 * el menú nombra: es el respaldo de lo que dice la portada.
 */
export function ProofBand() {
  return (
    // `data-reveal-root` o las piezas se quedan en opacidad cero para siempre:
    // el revelado genérico solo recorre las raíces marcadas.
    <section className={styles['band']} data-reveal-root>
      <Container>
        <dl className={styles['figures']}>
          {PROOF_FIGURES.map((figure) => (
            <div key={figure.id} className={styles['figure']} data-anim>
              <dt className={styles['value']}>
                {/*
                 * El número y el sufijo van en dos nodos porque el contador
                 * reescribe el contenido del suyo en cada fotograma. Con los dos
                 * juntos, animar «24/7» borraría el «/7» en el primer paso.
                 */}
                <span data-count={figure.value}>{figure.value}</span>
                {figure.suffix !== '' && <span className={styles['suffix']}>{figure.suffix}</span>}
              </dt>
              <dd className={styles['meaning']}>
                <span className={styles['label']}>{figure.label}</span>
                <span className={styles['detail']}>{figure.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
