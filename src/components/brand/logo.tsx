import { SITE } from '@/content/site';

import styles from './logo.module.css';

/**
 * El logotipo de Noctis en su versión horizontal.
 *
 * Los dos archivos salen tal cual del paquete de marca
 * (`docs/identidad-de-marca-noctis/logo-final.svg` y `-modo-oscuro.svg`), sin
 * una sola coordenada tocada. Se sirven como imagen de fondo y no como `<img>`
 * por dos razones: el modo lo conmuta una regla de CSS, así que el navegador
 * descarga solo el archivo del modo activo; y el SVG no se copia dentro de un
 * componente, que es donde una segunda versión acabaría divergiendo del
 * original. El spec §3 prohíbe deformarlo, rotarlo y recolorearlo, y la forma
 * de garantizarlo es no tener una segunda copia que mantener.
 *
 * El área de seguridad que pide el spec §3 —el alto de la "N"— ya viene dentro
 * del `viewBox`: el trazo ocupa el centro y deja ese aire alrededor. Recortar
 * el `viewBox` para "ajustarlo" sería violarla.
 */
export function Logo() {
  return <span className={styles['logo']} role="img" aria-label={SITE.name} />;
}
