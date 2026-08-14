import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { proxy } from './proxy';

const NONCE_IN_POLICY = /'nonce-([^']+)'/;

function visit(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('https://noctis.test/', { headers });
}

function nonceOf(policy: string | null): string {
  const match = NONCE_IN_POLICY.exec(policy ?? '');
  return match === null ? '' : (match[1] ?? '');
}

describe('proxy de entrada', () => {
  it('pone las cabeceras de seguridad obligatorias en la respuesta', () => {
    const { headers } = proxy(visit());

    expect(headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(headers.get('strict-transport-security')).toContain('max-age=63072000');
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('permissions-policy')).toContain('camera=()');
  });

  it('devuelve el identificador de correlación de la petición', () => {
    expect(proxy(visit()).headers.get('x-correlation-id')).not.toBeNull();
  });

  it('descarta el identificador que mande el cliente, para que nadie ensucie el registro', () => {
    const response = proxy(visit({ 'x-correlation-id': 'forjado-por-el-cliente' }));

    expect(response.headers.get('x-correlation-id')).not.toBe('forjado-por-el-cliente');
  });

  it('reenvía la política a la petición, que es lo que permite a Next firmar sus scripts', () => {
    const { headers } = proxy(visit());

    expect(headers.get('x-middleware-request-content-security-policy')).toContain("'nonce-");
    expect(headers.get('x-middleware-request-x-nonce')).not.toBeNull();
  });

  it('el nonce de la política es el mismo en la petición y en la respuesta', () => {
    const { headers } = proxy(visit());
    const inResponse = nonceOf(headers.get('content-security-policy'));
    const inRequest = nonceOf(headers.get('x-middleware-request-content-security-policy'));

    expect(inResponse).not.toBe('');
    expect(inRequest).toBe(inResponse);
    expect(headers.get('x-middleware-request-x-nonce')).toBe(inResponse);
  });

  it('usa un nonce distinto en cada petición', () => {
    const first = proxy(visit()).headers.get('content-security-policy');
    const second = proxy(visit()).headers.get('content-security-policy');

    expect(first).not.toBe(second);
  });
});
