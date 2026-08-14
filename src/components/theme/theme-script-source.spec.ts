import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import { THEME_SCRIPT } from './theme-script-source';

/**
 * El script del modo corre en el navegador de cada visitante, antes de que
 * exista React. No lo revisa el compilador ni lo cubre ningún tipo. Acá se
 * ejecuta de verdad, contra un documento falso, que es la única forma de saber
 * que hace lo que dice.
 */

interface Browser {
  readonly stored?: string | undefined;
  readonly prefersLight?: boolean;
  readonly storageFails?: boolean;
}

function runScript(browser: Browser): string {
  let applied = '';

  runInNewContext(THEME_SCRIPT, {
    localStorage: {
      getItem: (): string | null => {
        if (browser.storageFails === true) throw new Error('almacenamiento no disponible');
        return browser.stored ?? null;
      },
    },
    matchMedia: (query: string) => ({
      matches: browser.prefersLight === true && query.includes('light'),
    }),
    document: {
      documentElement: {
        setAttribute: (name: string, value: string): void => {
          if (name === 'data-mode') applied = value;
        },
      },
    },
  });

  return applied;
}

describe('script que fija el modo antes del primer pintado', () => {
  it('respeta lo que el visitante eligió, aunque el sistema pida lo contrario', () => {
    expect(runScript({ stored: 'light', prefersLight: false })).toBe('light');
    expect(runScript({ stored: 'dark', prefersLight: true })).toBe('dark');
  });

  it('en la primera visita sigue la preferencia del sistema', () => {
    expect(runScript({ prefersLight: true })).toBe('light');
    expect(runScript({ prefersLight: false })).toBe('dark');
  });

  it('ignora un valor guardado que no sea un modo válido', () => {
    expect(runScript({ stored: 'azul', prefersLight: true })).toBe('light');
  });

  it('si el almacenamiento falla, deja un modo puesto igual', () => {
    expect(runScript({ storageFails: true })).toBe('dark');
  });

  it('siempre deja el atributo puesto: nunca una página sin modo', () => {
    const outcomes = [
      runScript({ prefersLight: true }),
      runScript({ prefersLight: false }),
      runScript({ stored: 'light' }),
      runScript({ storageFails: true }),
    ];

    expect(outcomes.every((mode) => mode === 'dark' || mode === 'light')).toBe(true);
  });
});
