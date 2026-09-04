import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { InlineHeadScript } from '@/components/head/inline-head-script';
import { SITE } from '@/content/site';
import { environment } from '@/shared/infrastructure/config/environment';
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
const displayFont = localFont({
  src: [
    { path: './fonts/source-serif-4-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/source-serif-4-latin-600-italic.woff2', weight: '600', style: 'italic' },
  ],
  display: 'swap',
  variable: '--fuente-display',
});

const textFont = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--fuente-texto',
});

/**
 * Metadatos completos, incluidos los sociales.
 *
 * El enlace de este sitio se va a repartir por WhatsApp, que es como se pasa un
 * contacto en Ecuador. Sin `openGraph` ahí aparece como texto pelado: sin
 * imagen, sin título, indistinguible de un enlace roto. La tarjeta es la
 * diferencia entre parecer una empresa y parecer un archivo suelto.
 *
 * `metadataBase` sale de `SITIO_URL` porque el dominio todavía es D9 y no se
 * puede incrustar. Sin esa variable, Next omite las URLs absolutas en vez de
 * generarlas contra `localhost`, que es justo el error que termina publicado.
 */
export const metadata: Metadata = {
  ...(environment.SITIO_URL === undefined
    ? {}
    : { metadataBase: new URL(environment.SITIO_URL), alternates: { canonical: '/' } }),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true },
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
    // Ya no sale ningún `data-mode`: el sitio tiene un solo esquema y el color
    // vive entero en `tokens.css`, sin nada que corregir en el arranque.
    // `suppressHydrationWarning` se queda igual, y no por inercia: el script del
    // `<head>` sigue añadiendo la clase `animation-ready` al `<html>` antes de que
    // React hidrate. Es una diferencia servidor/cliente legítima y deliberada
    // —es lo que evita que la página se quede en blanco sin JavaScript— y sin
    // esta línea React la reporta como error de hidratación en cada carga.
    // `data-scroll-behavior` le dice a Next que el `scroll-behavior: smooth` de
    // `base.css` es deliberado. Sin el atributo avisa por consola en cada
    // navegación, porque un desplazamiento suave durante un cambio de ruta
    // normalmente es un descuido: la página nueva llega animando hacia arriba.
    <html
      lang={SITE.locale}
      data-scroll-behavior="smooth"
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
