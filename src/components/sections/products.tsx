import { Section } from '@/components/layout/section';
import { Label } from '@/components/ui/label';
import { Status } from '@/components/ui/status';
import { PRODUCTS } from '@/content/products';
import { HEADINGS } from '@/content/site-copy';
import type { Product } from '@/content/types';

import styles from './products.module.css';

/**
 * Los cuatro productos, cada uno con su estado real.
 *
 * El resaltado del estado sale de comparar con `'disponible'` **aquí y no en el
 * contenido**, para que el dato guardado sea el estado y no una decisión de
 * presentación. Lo que RN6 protege es que el estado venga de `content/`, y viene.
 */
function ProductRow({ product }: { readonly product: Product }) {
  return (
    <article className={styles['product']} data-anim>
      <Label>{product.scope}</Label>
      <div>
        <h3>{product.name}</h3>
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
