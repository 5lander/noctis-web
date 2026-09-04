import Image from 'next/image';

import { Section } from '@/components/layout/section';
import { Status } from '@/components/ui/status';
import { PRODUCTS } from '@/content/products';
import { HEADINGS } from '@/content/site-copy';
import type { Product } from '@/content/types';

import styles from './products.module.css';

/**
 * Los cuatro productos, cada uno con su estado real y su pantalla.
 *
 * El resaltado del estado sale de comparar con `'disponible'` **aquí y no en el
 * contenido**, para que el dato guardado sea el estado y no una decisión de
 * presentación. Lo que RN6 protege es que el estado venga de `content/`, y viene.
 *
 * La pantalla es lo que convierte la tarjeta en prueba. Un sitio que dice vender
 * software y no enseña ni una interfaz está describiendo, no demostrando, que es
 * justo lo contrario de lo que este proyecto declara vender. Las imágenes salen
 * de `content/products.ts` con su texto alternativo, porque el alternativo es
 * texto de cara al usuario y vive donde vive el resto (`CLAUDE.md` §2).
 */

const SHOT_WIDTH = 720;
const SHOT_HEIGHT = 480;
const SHOT_SIZES = '(max-width: 1000px) 100vw, 340px';
/**
 * El nombre, que es enlace cuando el producto tiene un sitio que abrir.
 *
 * Va aparte de la tarjeta y no en línea porque `ProductRow` se pasaba de las
 * cuarenta líneas que permite la regla de complejidad, y porque la decisión
 * —enlazar o no— merece leerse de un vistazo.
 */
function ProductName({ product }: { readonly product: Product }) {
  if (product.href === null) return <>{product.name}</>;

  return (
    <a className={styles['live']} href={product.href} target="_blank" rel="noreferrer noopener">
      {product.name}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function ProductRow({ product }: { readonly product: Product }) {
  return (
    <article className={styles['product']} data-anim>
      <div className={styles['shot']}>
        <Image
          src={product.shot.src}
          alt={product.shot.alt}
          width={SHOT_WIDTH}
          height={SHOT_HEIGHT}
          sizes={SHOT_SIZES}
        />
      </div>
      <div>
        <h3>
          <ProductName product={product} />
        </h3>
        <p className={styles['summary']}>{product.summary}</p>
        <ul className={styles['capabilities']}>
          {product.capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      </div>
      <div className={styles['aside']}>
        <Status available={product.stage === 'disponible'}>{product.stageLabel}</Status>
        <p className={styles['audience']}>{product.audience}</p>
      </div>
    </article>
  );
}

export function Products() {
  return (
    <Section id="productos" heading={HEADINGS.products}>
      {PRODUCTS.map((product) => (
        <ProductRow key={product.id} product={product} />
      ))}
    </Section>
  );
}
