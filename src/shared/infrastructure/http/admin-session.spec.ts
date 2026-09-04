import { describe, expect, it } from 'vitest';

import { isSecureRequest } from './admin-session';

/**
 * El fallo que originó esta prueba: la cookie se marcaba `Secure` según
 * `NODE_ENV`, así que un `next start` sobre `http://localhost` —que es
 * producción— emitía una cookie que el navegador descartaba, y el panel pedía la
 * clave una y otra vez sin decir por qué. No lo vio ninguna prueba unitaria: lo
 * vio el recorrido de extremo a extremo del panel.
 */
describe('cuándo la cookie de sesión lleva Secure', () => {
  it.each([
    ['localhost:3000', false],
    ['localhost', false],
    ['127.0.0.1:3100', false],
    ['[::1]:3000', false],
    ['noctis.ec', true],
    ['www.noctis.ec', true],
    ['panel.noctis.ec:8443', true],
    // Un anfitrión que empieza igual que localhost pero no lo es: sin el corte
    // por puerto, un `startsWith` lo daría por local y emitiría la cookie sin
    // proteger en un dominio de verdad.
    ['localhost.noctis.ec', true],
  ])('%s → %s', (host, expected) => {
    expect(isSecureRequest(host)).toBe(expected);
  });

  it('sin cabecera de anfitrión, se asume que hay que protegerla', () => {
    expect(isSecureRequest(null)).toBe(true);
  });
});
