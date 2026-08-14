import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Label } from '@/components/ui/label';
import type { SectionHeading } from '@/content/types';

import styles from './section.module.css';

/**
 * Sección con su encabezado de dos columnas, tal como el prototipo.
 *
 * Recibe el encabezado ya armado desde `content/`: el componente no compone
 * texto, solo lo coloca. `inverted` aplica la clase `.inv`, que hace que la
 * franja use el esquema contrario al modo activo.
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
    <section id={id} className={className}>
      <Container>
        <div className={styles['heading']}>
          <Label>{heading.label}</Label>
          <div>
            <h2>{heading.title}</h2>
            {heading.support !== undefined && <p className={styles['support']}>{heading.support}</p>}
          </div>
        </div>
        {children}
      </Container>
    </section>
  );
}
