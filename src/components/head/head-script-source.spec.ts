import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import { ANIMATION_READY_CLASS } from '@/components/animation/animation-ready-source';
import { THEME_ATTRIBUTE } from '@/components/theme/theme';

import { HEAD_SCRIPT } from './head-script-source';

/**
 * Los dos scripts del `<head>` van pegados en un solo `<script>`, y es ese texto
 * pegado —no cada mitad— lo que ejecuta el navegador.
 *
 * Esta prueba existe porque el texto pegado estuvo roto y nadie se enteró:
 * `theme-script-source.spec.ts` y `animation-ready-source.spec.ts` ejecutaban
 * cada script por su cuenta y los dos pasaban.
 */

function runHeadScript(): { classes: Set<string>; attributes: Map<string, string> } {
  const classes = new Set<string>();
  const attributes = new Map<string, string>();

  runInNewContext(HEAD_SCRIPT, {
    document: {
      documentElement: {
        classList: {
          add: (name: string): void => void classes.add(name),
          remove: (name: string): void => void classes.delete(name),
        },
        setAttribute: (name: string, value: string): void => void attributes.set(name, value),
      },
    },
    localStorage: { getItem: (): string | null => 'light' },
    matchMedia: () => ({ matches: false }),
    setTimeout: (): number => 0,
  });

  return { classes, attributes };
}

describe('HEAD_SCRIPT', () => {
  it('ejecuta las dos mitades: fija el modo y marca que va a haber animación', () => {
    const { classes, attributes } = runHeadScript();

    expect(attributes.get(THEME_ATTRIBUTE)).toBe('light');
    expect(classes.has(ANIMATION_READY_CLASS)).toBe(true);
  });

  it('separa los dos scripts, o el segundo no corre', () => {
    expect(HEAD_SCRIPT).not.toContain(')()(function');
  });
});
