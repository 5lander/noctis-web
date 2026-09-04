import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import type { SectionHeading } from '@/content/types';

import styles from './section.module.css';

/**
 * Sección con su encabezado.
 *
 * Recibe el encabezado ya armado desde `content/`: el componente no compone
 * texto, solo lo coloca. `inverted` aplica la clase `.inv`, que hace que la
 * franja use el esquema contrario al modo activo.
 *
 * El encabezado era de dos columnas: una angosta con el rótulo en versalita y
 * otra con el titular. Al quitar el rótulo (ver `content/types.ts`) la columna
 * angosta quedaba vacía, así que el titular pasa a ocupar el ancho y a alinearse
 * con el contenido de la sección en vez de estar sangrado 210 px respecto de él.
 */
interface SectionProps {
  readonly id: string;
  readonly heading: SectionHeading;
  readonly children: ReactNode;
  readonly inverted?: boolean;
}

export function Section({ id, heading, children, inverted = false }: SectionProps) {
  const className = inverted ? `inv ${styles['section']}` : `${styles['section']}`;

  return (
    <section id={id} className={className} data-reveal-root>
      <Container>
        <div className={styles['heading']} data-anim>
          <h2>{heading.title}</h2>
          {heading.support !== undefined && <p className={styles['support']}>{heading.support}</p>}
        </div>
        {children}
      </Container>
    </section>
  );
}
