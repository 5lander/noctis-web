import { WHATSAPP } from '@/content/site';
import { UI_TEXT } from '@/content/ui';

import styles from './whatsapp-link.module.css';

/**
 * El botón de WhatsApp.
 *
 * En Ecuador es el canal por el que un dueño de PYME escribe primero; el
 * formulario es la segunda opción, no la primera. La auditoría lo marcó como
 * hallazgo crítico: la palabra «WhatsApp» aparecía tres veces en la página y
 * ninguna era algo en lo que se pudiera tocar.
 *
 * **El número dejó de ser variable de entorno.** `WHATSAPP_NUMERO` existía
 * porque el dato era C3 de `DECISIONES.md` y no se podía incrustar; ya está
 * confirmado, y un número que se publica en un botón visible y en el pie es
 * contenido, no configuración. Con eso se va también el caso de «no hay número»:
 * el enlace existe siempre, porque el dato vive en el repositorio.
 *
 * El mensaje precargado se codifica acá y no en `content/`: el texto es
 * contenido, su forma de viajar en una URL es implementación.
 */

/*
 * Dejó de exportarse. El pie lo usaba para repetir el canal como texto y esa
 * línea se retiró: dos destinos idénticos a pocos píxeles obligan al visitante a
 * comprobar si son lo mismo. Ahora este botón es el único sitio del que cuelga
 * WhatsApp, así que la URL no tiene por qué salir del archivo.
 */
function whatsappHref(): string {
  return `https://wa.me/${WHATSAPP.digits}?text=${encodeURIComponent(WHATSAPP.greeting)}`;
}

export function WhatsAppFloating() {
  const href = whatsappHref();

  /*
   * Va dentro de un `<nav>` con nombre y no suelto en el cuerpo. Es lo que pidió
   * axe al medir después del cambio: un enlace fuera de toda región deja
   * contenido sin landmark, y quien navega por regiones con lector de pantalla
   * se lo salta entero. El nombre lo convierte además en un destino localizable
   * en vez de «navegación» a secas.
   */
  return (
    <nav className={styles['dock']} aria-label={UI_TEXT.whatsapp}>
      <a
        className={styles['floating']}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={UI_TEXT.whatsapp}
        data-whatsapp
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.25 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.21.89 2.39 1.01 2.55.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z"
          />
        </svg>
      </a>
    </nav>
  );
}
