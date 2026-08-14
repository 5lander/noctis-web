# ADR-0002: Motor de disponibilidad propio, sin extraer el de Care

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P0 |
| Decisores | Claude Code · **pendiente de ratificación del usuario** |

## Contexto

`docs/FASE0-CHECKLIST.md` C1 es la fila marcada como más importante de esa lista:
decidir **qué se extrae de Care como paquete compartido** antes de definir la
estructura del proyecto. El argumento del checklist es bueno: decidirlo después
de P5 significa mantener dos motores de disponibilidad con los mismos errores.

Se revisó el motor real de Care en
`Care/Carebot/apps/api/src/domain/availability/`: `engine.ts`, `compatibility.ts`,
`tie-breakers.ts`, `types.ts`.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Extraer el motor de Care a un paquete compartido | Un solo motor, un solo lugar donde corregir | Resuelve un problema que Noctis Web no tiene; obliga a un monorepo o a un registro de paquetes que hoy no existen |
| Motor propio en `src/modules/availability/domain/` | Cabe en el problema real; puro y probado sin nada levantado | Dos motores en la empresa |
| Copiar el archivo de Care | Rápido | Copia sin dueño: lo peor de las dos opciones |

**Lo que hace el motor de Care y Noctis Web no necesita:** múltiples recursos
(sillones), compatibilidad servicio↔recurso, qué profesional atiende en qué sala,
y desempates entre profesionales. Su tipo central se define alrededor de
`ResourceRef`.

**Lo que necesita Noctis Web:** un solo calendario de equipo, una reunión a la
vez, tope diario, margen entre reuniones, aviso mínimo y ventana de días hábiles
(D1–D3). No hay recursos que asignar ni profesional que elegir.

## Decisión

**Motor propio.** Noctis Web construye su propio motor de disponibilidad en P5,
dentro de `src/modules/availability/domain/`, sin dependencia de Care.

## Consecuencias

- Se evita traer un modelo de dominio ajeno —recursos y profesionales— para no
  usarlo, que es exactamente lo que prohíbe `docs/OPTIMIZACION.md` §1.
- Se acepta que existan dos motores en la empresa. El de Noctis Web es
  sustancialmente más chico: reglas de calendario único.
- **La decisión es barata de revertir** justamente por la regla de dependencia:
  el motor es dominio puro, sin red ni base de datos, así que extraerlo más
  adelante a un paquete compartido es mover archivos, no reescribir.
- Si el usuario prefiere el paquete compartido, esto se decide **antes de P5** y
  se escribe un ADR que reemplace a este. Después de P5 sale caro.
- Queda registrado como duda abierta en `ESTADO.md` para ratificación.
