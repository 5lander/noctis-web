# ADR-0006: Registro, limitador y pre-commit propios, sin dependencias

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P0 |
| Decisores | Claude Code |

## Contexto

P0 pide tres cosas que suelen resolverse con un paquete: registro estructurado
con identificador de correlación, limitador de peticiones y pre-commit.

`docs/OPTIMIZACION.md` §1 lo prohíbe expresamente: *"no traer una dependencia
para 10 líneas que se escriben a mano"*. `CLAUDE.md` §8 pide autorización
explícita para cada dependencia nueva. Y `docs/SEGURIDAD.md` §9 recuerda que cada
paquete es superficie de cadena de suministro.

## Opciones consideradas

| Necesidad | Paquete habitual | Qué cuesta escribirlo | Qué se gana escribiéndolo |
|---|---|---|---|
| Registro | Pino | ~60 líneas | Redacción de campos personales por nombre (RN12) y saneado de saltos de línea, que un logger genérico no trae |
| Limitador | `rate-limiter-flexible` + Redis | ~60 líneas | No hay Redis en v1 (`CLAUDE.md` §5); el paquete traería un almacén que no existe |
| Pre-commit | husky | 6 líneas de shell | Sin dependencia y sin carpeta generada |

## Decisión

Los tres, propios:

- `src/shared/infrastructure/logging/logger.ts` — JSON por línea a la salida
  estándar, con lista de campos personales prohibidos y saneado de control.
- `src/shared/infrastructure/http/rate-limit.ts` — ventana fija en memoria, con
  `now` inyectado para poder probar los bordes sin relojes falsos.
- `.githooks/pre-commit` + `npm run prepare`, que apunta `core.hooksPath`.

## Consecuencias

- **Limitación real del limitador**: el conteo es por instancia. Con varias
  réplicas el límite efectivo se multiplica por el número de réplicas. Está
  anotado en el runbook de despliegue y se decide con el hosting (D9). Si un día
  hay Redis, el reemplazo es un archivo.
- El registro cumple RN12 por construcción y no por disciplina de quien escribe:
  un `{ email }` accidental sale `[redactado]`, y hay prueba que lo fija.
- El pre-commit se activa solo con `npm install`. Quien clone y no instale no
  tiene compuerta local — por eso la misma auditoría corre en CI, que es la que
  no se puede saltar.
