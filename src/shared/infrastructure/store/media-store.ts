/**
 * Las imágenes que se suben desde el panel: capturas de trabajos y logotipos.
 *
 * Van a disco y no a la base: un binario dentro de SQLite hace que cada consulta
 * arrastre megabytes, y una carpeta de archivos se respalda con `cp -r`.
 *
 * Tres reglas que no son opcionales, porque una subida es la vía de entrada
 * favorita a un servidor (`SEGURIDAD.md` §6):
 *
 * 1. **El nombre lo pone el sistema, nunca el cliente.** Un nombre recibido
 *    puede contener `../` y escribir donde no debe.
 * 2. **La extensión sale del tipo declarado y de una lista blanca**, no de lo
 *    que venga en el nombre. Sin lista blanca, se sube un `.html` y el propio
 *    dominio sirve el script del atacante.
 * 3. **Tamaño máximo comprobado antes de escribir.**
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';

import { environment } from '@/shared/infrastructure/config/environment';

const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * KILOBYTE;

/**
 * Dos topes, porque son dos cosas distintas.
 *
 * Una captura de 4 MB es una captura mal exportada. Un recorrido de la página de
 * un cliente, en cambio, son veinte o treinta segundos de vídeo, y por debajo de
 * 12 MB no entra ninguno que se vea decente. El tope del vídeo es mayor **y
 * sigue siendo un tope**: sin él, cualquier archivo entraría por esta puerta.
 */
const MAX_IMAGE_MEGABYTES = 4;
const MAX_VIDEO_MEGABYTES = 12;

/**
 * SVG queda fuera a propósito aunque sea el formato natural de un logotipo: un
 * SVG es XML con capacidad de ejecutar script, y servirlo desde el propio
 * dominio lo pondría dentro del origen de confianza de la CSP.
 */
/**
 * MP4 y nada más en vídeo, por la misma razón que se admite un solo puñado de
 * formatos de imagen: cuantos menos decodificadores toque un archivo subido,
 * menos superficie hay. H.264 lo reproduce cualquier navegador vivo, así que un
 * segundo formato no compraría compatibilidad, solo añadiría puerta.
 */
const ALLOWED: Readonly<Record<string, { readonly extension: string; readonly maxBytes: number }>> = {
  'image/png': { extension: 'png', maxBytes: MAX_IMAGE_MEGABYTES * MEGABYTE },
  'image/jpeg': { extension: 'jpg', maxBytes: MAX_IMAGE_MEGABYTES * MEGABYTE },
  'image/webp': { extension: 'webp', maxBytes: MAX_IMAGE_MEGABYTES * MEGABYTE },
  'image/avif': { extension: 'avif', maxBytes: MAX_IMAGE_MEGABYTES * MEGABYTE },
  'video/mp4': { extension: 'mp4', maxBytes: MAX_VIDEO_MEGABYTES * MEGABYTE },
};

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  mp4: 'video/mp4',
};

class UnsupportedMediaError extends Error {
  constructor() {
    super(
      `Formato no admitido. Imágenes PNG, JPG, WebP o AVIF de hasta ${MAX_IMAGE_MEGABYTES} MB; ` +
        `vídeo MP4 de hasta ${MAX_VIDEO_MEGABYTES} MB.`,
    );
    this.name = 'UnsupportedMediaError';
  }
}

/** Devuelve la ruta pública, que es lo único que se guarda en la base. */
export async function storeMedia(file: File): Promise<string> {
  const kind = ALLOWED[file.type];
  if (kind === undefined || file.size > kind.maxBytes || file.size === 0) {
    throw new UnsupportedMediaError();
  }

  const name = `${randomUUID()}.${kind.extension}`;
  await mkdir(environment.MEDIOS_RUTA, { recursive: true });
  await writeFile(join(environment.MEDIOS_RUTA, name), Buffer.from(await file.arrayBuffer()));
  return `/media/${name}`;
}

export interface StoredMedia {
  readonly bytes: Buffer;
  readonly contentType: string;
}

/**
 * La lectura vuelve a validar el nombre en vez de confiar en que la ruta salió
 * de `storeMedia`: entre una y otra hay una petición HTTP, y ahí el nombre lo
 * escribe quien quiera.
 */
export async function readMedia(name: string): Promise<StoredMedia | null> {
  const safe = normalize(name);
  const extension = safe.split('.').pop() ?? '';
  const contentType = CONTENT_TYPES[extension];
  if (contentType === undefined || safe.includes('/') || safe.includes('..')) return null;

  try {
    const bytes = await readFile(join(environment.MEDIOS_RUTA, safe));
    return { bytes, contentType };
  } catch {
    return null;
  }
}
