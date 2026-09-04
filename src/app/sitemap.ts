import type { MetadataRoute } from 'next';

import { environment } from '@/shared/infrastructure/config/environment';

/**
 * El mapa del sitio.
 *
 * Hoy es una sola URL porque el sitio es una sola página. Existe igual por dos
 * razones: le da a Google una fecha de última modificación fiable, y el día que
 * Commerce y Care tengan página propia el archivo ya está y solo se le suman
 * entradas.
 *
 * Sin `SITIO_URL` configurada devuelve una lista vacía en vez de inventar un
 * dominio: un sitemap con URLs equivocadas es peor que no tenerlo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = environment.SITIO_URL;
  if (site === undefined) return [];

  return [{ url: site, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
