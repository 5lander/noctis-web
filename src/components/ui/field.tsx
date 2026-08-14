import type { ReactNode } from 'react';

import styles from './field.module.css';

/**
 * Etiqueta y control de un formulario.
 *
 * El control entra como hijo en lugar de generarse desde una lista de props:
 * un campo puede ser `input`, `select` o `textarea`, y una prop `type` que
 * decidiera cuál termina siendo un componente que hace tres cosas. Acá el
 * componente hace una: poner la etiqueta, atarla al control y darle forma.
 *
 * `htmlFor` es obligatorio y no opcional a propósito: una etiqueta suelta se ve
 * igual y deja el campo sin nombre para el lector de pantalla.
 */
interface FieldProps {
  readonly htmlFor: string;
  readonly label: string;
  readonly children: ReactNode;
  readonly wide?: boolean;
}

export function Field({ htmlFor, label, children, wide = false }: FieldProps) {
  const className = wide ? `${styles['field']} ${styles['wide']}` : `${styles['field']}`;

  return (
    <div className={className}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
