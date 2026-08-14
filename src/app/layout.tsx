import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { InlineHeadScript } from '@/components/head/inline-head-script';
import { FALLBACK_MODE } from '@/components/theme/theme';
import { SITE } from '@/content/site';
import { NONCE_HEADER } from '@/shared/infrastructure/http/security-headers';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/animation.css';

/**
 * Las fuentes se descargan en el build y se sirven desde el propio dominio.
 * El spec de marca §2 las nombra en Google Fonts; acá no se enlazan desde ahí:
 * la CSP no admite orígenes externos, y una fuente de un tercero es un salto de
 * red antes de poder pintar texto.
 *
 * Solo los pesos que el sistema usa, que es lo que pide el spec §2: 600 de
 * Source Serif 4 para los títulos, 400/500/600 de Inter para texto e interfaz.
 * La cursiva de 600 entra porque el tratamiento `italic` de la grilla de
 * trabajos está vivo hoy: sin ella el navegador inclina la redonda por su
 * cuenta, y una serif falsamente cursiva es justo la deformación que el manual
 * de marca prohíbe.
 */
const displayFont = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--fuente-display',
});

const textFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--fuente-texto',
});

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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get(NONCE_HEADER) ?? '';

  return (
    // `data-mode` sale del servidor con el modo por defecto para que la página
    // se vea entera aunque JavaScript esté deshabilitado: sin atributo no habría
    // ni un token de color definido. El script del `<head>` lo corrige antes del
    // primer pintado si el visitante o su sistema piden otra cosa — y por eso
    // `suppressHydrationWarning`: el atributo cambia legítimamente antes de que
    // React hidrate, y no es una diferencia que haya que arreglar.
    <html
      lang={SITE.locale}
      data-mode={FALLBACK_MODE}
      suppressHydrationWarning
      className={`${displayFont.variable} ${textFont.variable}`}
    >
      <head>
        <InlineHeadScript nonce={nonce} />
      </head>
      <body>{children}</body>
    </html>
  );
}
