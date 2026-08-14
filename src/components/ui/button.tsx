import type { ReactNode } from 'react';

import styles from './button.module.css';

/**
 * El botón del prototipo, en sus dos tratamientos: sólido y de línea.
 *
 * Se renderiza como `<a>` cuando lleva destino y como `<button>` cuando no. La
 * diferencia importa para el teclado y para el lector de pantalla: un enlace
 * navega, un botón actúa, y no son intercambiables aunque se vean igual.
 */

export type ButtonVariant = 'solid' | 'outline';

interface ButtonProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly href?: string;
  readonly type?: 'button' | 'submit';
}

function classNamesFor(variant: ButtonVariant): string {
  return variant === 'outline' ? `${styles['button']} ${styles['outline']}` : `${styles['button']}`;
}

export function Button({ children, variant = 'solid', href, type = 'button' }: ButtonProps) {
  const className = classNamesFor(variant);

  if (href !== undefined) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} type={type}>
      {children}
    </button>
  );
}
