import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SITE } from '@/content/site';
import '@/styles/base.css';

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
};

/**
 * Render por petición, a propósito.
 *
 * La CSP lleva un nonce distinto en cada petición (SEGURIDAD.md §4.1) y Next
 * firma con él sus propios scripts en línea. Una página prerenderizada guarda un
 * nonce viejo que no coincide con la cabecera, y el navegador bloquea el
 * arranque de la aplicación. Es el costo aceptado de la CSP estricta: está en
 * ADR-0004, junto con lo que se hace para que no se note.
 */
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
  // El atributo `data-mode` y el script en línea que lo fija antes del primer
  // pintado llegan en P1, junto con los tokens.
  return (
    <html lang={SITE.locale}>
      <body>{children}</body>
    </html>
  );
}
