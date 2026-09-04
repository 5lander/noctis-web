/**
 * Sirve las capturas y logotipos subidos desde el panel.
 *
 * Existe porque los archivos viven fuera de `public/`: si estuvieran dentro, el
 * despliegue los borraría en cada publicación y el portafolio se vaciaría solo.
 * Están en una carpeta de datos persistente y esta ruta es la única puerta.
 *
 * `readMedia` valida el nombre otra vez acá dentro. No es redundancia: entre la
 * subida y esta petición hay una URL escrita por quien sea.
 */

import { readMedia } from '@/shared/infrastructure/store/media-store';

const NOT_FOUND = 404;
const ONE_YEAR = 31_536_000;

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
): Promise<Response> {
  const { name } = await context.params;
  const media = await readMedia(name);
  if (media === null) return new Response(null, { status: NOT_FOUND });

  // El nombre lleva un UUID, así que el contenido de una URL no cambia nunca:
  // se puede cachear para siempre sin arriesgar servir una captura vieja.
  return new Response(new Uint8Array(media.bytes), {
    headers: {
      'content-type': media.contentType,
      'cache-control': `public, max-age=${ONE_YEAR}, immutable`,
      'x-content-type-options': 'nosniff',
    },
  });
}
