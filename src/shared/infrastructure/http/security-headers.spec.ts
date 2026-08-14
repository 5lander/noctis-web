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
