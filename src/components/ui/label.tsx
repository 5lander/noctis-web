import type { ReactNode } from 'react';

import styles from './label.module.css';

/**
 * La etiqueta en versalitas del prototipo: el rótulo pequeño que precede a cada
 * sección y a cada producto. Es texto, no encabezado: no entra en la jerarquía
 * de `h1`–`h4` y por eso no usa una de esas etiquetas (`SPEC.md` §8.6).
 */
export function Label({ children }: { readonly children: ReactNode }) {
  return <span className={styles['label']}>{children}</span>;
}
