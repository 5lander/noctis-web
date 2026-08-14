import styles from './status.module.css';

/**
 * El estado de un producto: en desarrollo, en pruebas, disponible.
 *
 * Recibe el texto y el resaltado ya decididos. **No los deduce**: RN6 dice que
 * el estado de un producto sale de `content/` y jamás de otra parte, así que
 * este componente pinta lo que le dan y no interpreta nada.
 *
 * El punto es decorativo y va oculto al lector de pantalla: la información ya
 * está en el texto, y repetirla como "viñeta" solo estorba.
 */
interface StatusProps {
  readonly children: string;
  readonly available?: boolean;
}

export function Status({ children, available = false }: StatusProps) {
  const className = available
    ? `${styles['status']} ${styles['available']}`
    : `${styles['status']}`;

  return (
    <span className={className}>
      <span className={styles['dot']} aria-hidden="true" />
      {children}
    </span>
  );
}
