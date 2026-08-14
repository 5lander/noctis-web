import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import {
  ANIMATION_READY_CLASS,
  ANIMATION_READY_SCRIPT,
  ANIMATION_WATCHDOG_KEY,
} from './animation-ready-source';

/**
 * El script decide si el contenido se ve o no antes de que exista React. Un
 * error acá deja la página en blanco, así que se ejecuta de verdad.
 */

interface Run {
  /** Función y no arreglo: el temporizador de rescate cambia las clases después. */
  classes: () => readonly string[];
  readonly watchdogDelay: number | null;
  runWatchdog: () => void;
}

function runScript(): Run {
  const classes = new Set<string>();
  let watchdog: (() => void) | null = null;
  let watchdogDelay: number | null = null;
  const globals: Record<string, unknown> = {};

  const context = {
    document: {
      documentElement: {
        classList: {
          add: (name: string): void => void classes.add(name),
          remove: (name: string): void => void classes.delete(name),
        },
      },
    },
    setTimeout: (callback: () => void, delay: number): number => {
      watchdog = callback;
      watchdogDelay = delay;
      return 7;
    },
    window: globals,
  };

  runInNewContext(ANIMATION_READY_SCRIPT, context);

  return {
    classes: () => [...classes],
    watchdogDelay,
    runWatchdog: () => watchdog?.(),
  };
}

describe('script que anuncia que va a haber animación', () => {
  it('marca el documento antes del primer pintado', () => {
    expect(runScript().classes()).toContain(ANIMATION_READY_CLASS);
  });

  it('deja un temporizador de rescate, para que un fallo de la capa no esconda la página', () => {
    const run = runScript();

    expect(run.watchdogDelay).toBeGreaterThan(0);
  });

  it('al dispararse el rescate, la marca se quita y todo vuelve a verse', () => {
    const run = runScript();
    run.runWatchdog();

    expect(run.classes()).not.toContain(ANIMATION_READY_CLASS);
  });

  it('publica el identificador del temporizador para que la capa pueda cancelarlo', () => {
    expect(ANIMATION_READY_SCRIPT).toContain(ANIMATION_WATCHDOG_KEY);
  });
});
