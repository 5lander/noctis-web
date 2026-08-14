# ADR-0005: TypeScript 6.0.3, no 7.0.2

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P0 |
| Decisores | Claude Code |

## Contexto

`CLAUDE.md` §1 exige TypeScript en modo estricto completo y fijar versiones,
nunca `latest`. Al arrancar P0, la etiqueta `latest` de TypeScript era **7.0.2**.

`typescript-eslint` 8.67.0 —la única línea estable disponible— declara como par
`typescript: ">=4.8.4 <6.1.0"`. Con TypeScript 7 el linting con información de
tipos, que es lo que hace cumplir la prohibición de `any`, no funciona.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| TypeScript 7.0.2 | Compilador más rápido | Deja sin linting tipado: se pierde `no-unsafe-*`, que es justo lo que sostiene "`any` prohibido" |
| TypeScript 6.0.3 | Compatible con toda la cadena, incluido `eslint-config-next` 16 | Un ciclo mayor por detrás |
| Esperar | — | Bloquea el proyecto por una versión de compilador |

## Decisión

**TypeScript 6.0.3**, fijado exacto en `package.json`.

También se fijó **ESLint 9.39.5** en lugar de 10.8.1: con ESLint 10,
`typescript-eslint` 8.67 falla al arrancar (`scopeManager.addGlobals is not a
function`). Es el mismo problema, en el otro extremo de la cadena.

## Consecuencias

- La compuerta de tipos funciona completa: `no-explicit-any`, `no-unsafe-*`,
  `no-floating-promises`, `no-misused-promises`.
- Se revisa cuando `typescript-eslint` publique soporte para TypeScript 7 y para
  ESLint 10. La subida es un cambio de versión, sin código que tocar.
- Todas las dependencias quedan fijadas exactas, sin `^`, para que dos
  instalaciones den el mismo árbol.
