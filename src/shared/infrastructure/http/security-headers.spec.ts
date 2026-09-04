import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { buildContentSecurityPolicy, buildSecurityHeaders, createNonce } from './security-headers';

const PRODUCTION = { nonce: 'NONCE123', development: false } as const;
const DEVELOPMENT = { nonce: 'NONCE123', development: true } as const;

describe('política de seguridad de contenido', () => {
  it('lleva el nonce en scripts y estilos', () => {
    const policy = buildContentSecurityPolicy(PRODUCTION);

    expect(policy).toContain("script-src 'self' 'nonce-NONCE123' 'strict-dynamic'");
    expect(policy).toContain("style-src 'self' 'nonce-NONCE123'");
  });

  /*
   * El hash del `style="color:transparent"` que `next/image` pone en cada
   * imagen. Si Next cambia esa cadena, el hash deja de coincidir y las siete
   * imágenes de la portada vuelven a bloquearse en silencio: en el navegador
   * solo se vería el texto alternativo asomando y siete errores en consola.
   * Comprobar el hash contra la cadena, y no escribirlo a mano dos veces, es lo
   * que hace que este archivo se entere antes que nadie.
   */
  it('permite exactamente el atributo de estilo que emite next/image', () => {
    const policy = buildContentSecurityPolicy(PRODUCTION);
    const hash = createHash('sha256').update('color:transparent', 'utf8').digest('base64');

    expect(policy).toContain(`style-src-attr 'unsafe-hashes' 'sha256-${hash}'`);
  });

  it('el atributo de estilo no hereda las fuentes de style-src', () => {
    const policy = buildContentSecurityPolicy(PRODUCTION);
    const attr = policy.split('; ').find((d) => d.startsWith('style-src-attr')) ?? '';

    expect(attr).not.toContain('nonce');
    expect(attr).not.toContain("'self'");
    expect(attr).not.toContain("'unsafe-inline'");
  });

  it('en producción no admite unsafe-inline ni unsafe-eval', () => {
    const policy = buildContentSecurityPolicy(PRODUCTION);

    expect(policy).not.toContain('unsafe-inline');
    expect(policy).not.toContain('unsafe-eval');
  });

  it('en desarrollo abre lo justo para el recargado en caliente', () => {
    const policy = buildContentSecurityPolicy(DEVELOPMENT);

    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("'unsafe-inline'");
  });

  it('cierra los vectores que no dependen de scripts', () => {
    const policy = buildContentSecurityPolicy(PRODUCTION);

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
  });
});

describe('cabeceras de seguridad', () => {
  it('incluye todas las obligatorias de SEGURIDAD.md §4.4', () => {
    const headers = buildSecurityHeaders(PRODUCTION);

    expect(Object.keys(headers).sort()).toEqual([
      'content-security-policy',
      'permissions-policy',
      'referrer-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
    ]);
  });

  it('niega el enmarcado y el olfateo de tipo', () => {
    const headers = buildSecurityHeaders(PRODUCTION);

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  it('apaga cámara, micrófono y geolocalización', () => {
    expect(buildSecurityHeaders(PRODUCTION)['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
  });
});

describe('nonce', () => {
  it('es distinto en cada petición', () => {
    expect(createNonce()).not.toBe(createNonce());
  });

  it('tiene entropía suficiente para no adivinarse', () => {
    expect(createNonce().length).toBeGreaterThanOrEqual(22);
  });
});
