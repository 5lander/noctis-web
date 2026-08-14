import type { ReactNode } from 'react';

import styles from './container.module.css';

/**
 * El envoltorio de ancho máximo del prototipo (`.env`). Existe una vez para que
 * el ancho y el margen lateral no se repitan en once secciones y se separen a la
 * tercera edición.
 */
export function Container({ children }: { readonly children: ReactNode }) {
  return <div className={styles['container']}>{children}</div>;
}
