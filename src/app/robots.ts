import type { MetadataRoute } from 'next';

import { environment } from '@/shared/infrastructure/config/environment';

/**
 * `robots.txt`.
 *
 * Junto con el sitemap y los metadatos sociales, es lo que `SPEC.md` §12 llamaba
 * «Fase 4 — cierre» y que al renumerar el plan a P0–P12 no quedó asignado a
 * ningún paquete. La auditoría lo encontró como hueco de plan, no de código.
 *
 * El panel y las rutas de datos quedan fuera del rastreo. No es seguridad —el
 * panel se protege con sesión, no con `robots.txt`— es evitar que aparezca en
 * una búsqueda de marca.
 */
export default function robots(): MetadataRoute.Robots {
  const site = environment.SITIO_URL;

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/media/', '/dev/'] },
    ...(site === undefined ? {} : { sitemap: `${site}/sitemap.xml`, host: site }),
  };
}
