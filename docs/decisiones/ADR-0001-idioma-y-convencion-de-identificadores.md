# ADR-0001: Idioma y convención de identificadores

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P0 |
| Decisores | Usuario / Claude Code |

## Contexto

`DECISIONES.md` D12 y `docs/FASE0-CHECKLIST.md` C2 dejaban una tarea previa a P0:
confirmar la convención de identificadores **contra Commerce**, para que los tres
repositorios de Noctis no queden distintos. La documentación de Commerce
(`docs/clean-code.md`) da ejemplos en español heredados del dominio del SRI
(`Factura`, `ClaveAcceso`), lo que contradice el valor provisional 🟡 "inglés".

La duda no se resolvió leyendo la documentación de Commerce sino su código, que
es lo que realmente se mantiene.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Español, como los ejemplos del documento de Commerce | Coincide con el texto citado | El código real de Commerce no lo hace |
| Inglés, como el código real de Commerce | Los tres repos quedan iguales de verdad | Contradice los ejemplos de un documento desactualizado |

Evidencia en `Commerce/libs/commerce-sales/`:
`create-sale.use-case.ts`, `sale-item.entity.ts`, `line-amounts.ts`,
`sale.repository.ts`, `void-sale.use-case.spec.ts`.

## Decisión

**Identificadores y comentarios técnicos en inglés. Texto de cara al usuario en
español, y solo dentro de `src/content/`.**

Convención de archivos, tomada de Commerce:

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | `kebab-case` con sufijo de rol | `create-booking.use-case.ts` |
| Casos de uso | `PascalCase` + `UseCase` | `CreateBookingUseCase` |
| Puertos | Interfaz **sin** prefijo `I` | `CalendarPort` / `GoogleCalendarAdapter` |
| Entidades | `PascalCase` singular | `Booking`, `Lead` |
| Value objects | `PascalCase`, archivo `.vo.ts` | `TimeSlot`, `SlotId` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_MEETINGS_PER_DAY` |
| Pruebas | `.spec.ts` junto al archivo probado | `rate-limit.spec.ts` |

Dos excepciones deliberadas, porque son superficie pública en español:

- **Rutas de la API**: `/api/estado`, `/api/disponibilidad`, `/api/reservar`.
  Ya están así en `docs/apis/` y en el plan de implementación.
- **Códigos de error de la API** (`demasiadas_peticiones`): viajan junto a un
  mensaje en español y forman parte del mismo contrato.

## Consecuencias

- D12 pasa de 🟡 a ✅ y `FASE0-CHECKLIST.md` C2 queda cerrado.
- El mensaje de commit **no** sigue Conventional Commits de Commerce: manda el
  formato `P{n}: {nombre}` de `docs/PROTOCOLO.md`, que es un documento de
  cumplimiento obligatorio de este repositorio.
- Si algún día se comparte código con Commerce, los nombres ya encajan.
