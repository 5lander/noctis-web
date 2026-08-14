# ADR-0003: Vitest como runner de pruebas

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P0 |
| Decisores | Claude Code · **pendiente de ratificación del usuario** |

## Contexto

`CLAUDE.md` §7 hace obligatorias las pruebas desde la primera línea y nombra
Playwright para la interfaz, pero **ningún documento del proyecto nombra el
runner de pruebas unitarias y de integración**. Sin uno, P0 no puede cumplir su
propia definición de terminado.

Los dos repos hermanos difieren: Commerce usa Jest (monorepo Nx), Care usa Vitest.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Vitest | Igual que Care, que es el repo más cercano a este problema; ESM y TypeScript sin configuración de transpilado; arranque rápido, que importa en pre-commit | Distinto de Commerce |
| Jest | Igual que Commerce | Configuración de ESM y TypeScript costosa fuera de Nx; más lento |

## Decisión

**Vitest**, con las pruebas en archivos `.spec.ts` junto al archivo que prueban.

## Consecuencias

- Los tres repos no quedan idénticos en runner. Se acepta: la convención que
  importa compartir es la de nombres (ADR-0001), no la herramienta.
- `npm run test` corre en `npm run audit`, y por lo tanto en CI.
- Las pruebas del dominio corren sin base de datos, sin red y sin servidor, que
  es la exigencia real de `CLAUDE.md` §7 — eso lo da la arquitectura, no el
  runner.
- Playwright llega cuando llegue la interfaz que lo justifique (P7 y Pf). No se
  instala antes: sería una dependencia sin usuario.
