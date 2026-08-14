'use client';

import type { MouseEvent } from 'react';

import { sweepFrom } from './mode-sweep';
import { FALLBACK_MODE, THEME_ATTRIBUTE, THEME_STORAGE_KEY, isThemeMode, oppositeOf } from './theme';

import styles from './mode-toggle.module.css';

/**
 * Botón de cambio de modo.
 *
 * No guarda estado ni lo lee al montar: el modo vive en el atributo del `<html>`
 * y qué icono se ve lo decide el CSS. Así no hay diferencia entre lo que
 * renderiza el servidor y lo que espera el cliente, que es de donde salen los
 * parpadeos al hidratar.
 *
 * El cambio entra con un barrido circular desde el propio botón (RA-06). Quien
 * decide si el barrido ocurre es `mode-sweep.ts`: sin soporte del navegador o
 * con movimiento reducido, el modo cambia igual y sin barrido.
 *
 * Es el único uso de `localStorage` del sitio, y guarda una preferencia de
 * presentación: nada sensible (`CLAUDE.md` §10).
 */
export function ModeToggle({ label }: { readonly label: string }) {
  function applyNextMode(): void {
    const root = document.documentElement;
    const current = root.getAttribute(THEME_ATTRIBUTE);
    const next = oppositeOf(isThemeMode(current) ? current : FALLBACK_MODE);

    root.setAttribute(THEME_ATTRIBUTE, next);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // El modo ya cambió en la página: lo único que se pierde es que se
      // recuerde para la próxima visita (navegación privada, almacenamiento
      // lleno). No hay nada que decirle al visitante ni dónde registrarlo.
    }
  }

  function toggleMode(event: MouseEvent<HTMLButtonElement>): void {
    sweepFrom(event.currentTarget.getBoundingClientRect(), applyNextMode);
  }

  return (
    <button className={styles['toggle']} type="button" onClick={toggleMode} aria-label={label}>
      <svg
        className={styles['sun']}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
      <svg
        className={styles['moon']}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />
      </svg>
    </button>
  );
}
