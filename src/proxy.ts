/**
 * Puerta de entrada de toda petición: cabeceras de seguridad, nonce de CSP e
 * identificador de correlación.
 *
 * Las tres cosas se resuelven acá y no en cada ruta para que no exista la
 * posibilidad de olvidarse en una: una ruta nueva nace protegida.
 *
 * Se llama `proxy` y no `middleware` porque Next 16 renombró la convención; el
 * nombre viejo funciona pero avisa que está obsoleto, y arrancar el proyecto
 * sobre algo que ya está marcado para morir no tiene sentido.
 */

import { NextResponse, type NextRequest } from 'next/server';

import {
  CSP_HEADER,
  NONCE_HEADER,
  buildSecurityHeaders,
  createNonce,
} from '@/shared/infrastructure/http/security-headers';
import {
  CORRELATION_HEADER,
  createCorrelationId,
} from '@/shared/infrastructure/logging/correlation-id';

export function proxy(request: NextRequest): NextResponse {
  const nonce = createNonce();
  const correlationId = createCorrelationId();
  const securityHeaders = buildSecurityHeaders({
    nonce,
    development: process.env.NODE_ENV !== 'production',
  });

  // Se sobrescriben, no se leen: lo que mande el cliente en estas cabeceras no
  // debe llegar jamás ni al registro ni a la política de seguridad.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set(NONCE_HEADER, nonce);
  forwardedHeaders.set(CORRELATION_HEADER, correlationId);
  // Next lee la política de la petición para firmar con el nonce sus propios
  // scripts en línea. Sin esta línea, `strict-dynamic` bloquea el arranque de la
  // propia aplicación y la página queda muda en el navegador.
  forwardedHeaders.set(CSP_HEADER, securityHeaders[CSP_HEADER]);

  const response = NextResponse.next({ request: { headers: forwardedHeaders } });

  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }
  response.headers.set(CORRELATION_HEADER, correlationId);

  return response;
}

export const config = {
  // Los estáticos de Next ya salen inmutables y sin HTML: pasarlos por acá solo
  // gastaría tiempo de borde en cada imagen.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
