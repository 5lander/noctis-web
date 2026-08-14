# P5 — Resultado de auditoría

| Fecha | Auditor | Commit auditado |
|---|---|---|
| 2026-08-14 | Claude Code | `45987f7` |

---

## A. Arquitectura — el paquete que la valida

| # | Resultado | Evidencia |
|---|---|---|
| A1 | ✅ | El motor y sus cuatro archivos de dominio **no importan absolutamente nada** fuera de `domain/`: ni Next, ni React, ni SDKs, ni módulos de Node. Solo `Intl`, que es parte del lenguaje. `audit:arch` lo verifica sobre 102 módulos y 160 dependencias |
| A2 | ✅ | `config/scheduling.ts` importa **del** dominio, no al revés: la política entra por parámetro |
| A3 | ✅ | Sin infraestructura nueva |
| A4 | — no aplica | Los casos de uso llegan en P6. El motor ya recibe todo por parámetro, que es la misma disciplina |
| **A6** | ✅ | **Es el criterio de aceptación del paquete.** Las 159 pruebas corren sin base de datos, sin red y sin Google Calendar, en 1,5 s. Si hubiera hecho falta levantar algo, las capas estarían mal |

## B. Código

| # | Resultado | Evidencia |
|---|---|---|
| B1 · B2 · B3 | ✅ | Limpios |
| B4 · B5 | ✅ | La función más larga del motor son 12 líneas. `freeSlots` son 8 |
| B6 | ✅ | `availableOn` toma tres parámetros; el resto, dos |
| B7 | ✅ | `no-magic-numbers` señaló el archivo de configuración entero y se apagó **solo ahí**, porque es una tabla de valores. En el motor no queda un número suelto: `MINUTES_PER_HOUR`, `MINUTES_PER_DAY`, `MILLISECONDS_PER_MINUTE`, `NOON_HOUR` |
| **B8** | ✅ | `TimeRange`, `TimeSlot`, `SlotId` (cadena **marcada**), `SchedulingPolicy`, `DailyWindow`, `LocalDay`, `LocalMoment`. Ni un primitivo suelto en la interfaz del motor |
| B9 | ✅ | Sin errores nuevos: el motor no falla, filtra. Un motor que lanzara excepciones por un día lleno sería un motor mal diseñado |
| B10–B12 | ✅ | Sin `catch`, sin código comentado. La validación por esquema es de los bordes, y el motor no es un borde |

## C. Seguridad

| # | Resultado | Evidencia |
|---|---|---|
| C5 · C6 | ✅ | **El motor no puede filtrar detalle de agenda porque nunca lo recibe**: su entrada son `TimeRange`, que solo tienen `startsAt` y `endsAt`. RN1 no depende de que el motor se porte bien |
| C22 | ✅ | Ninguna llamada saliente. Es dominio puro |
| C11 · C26 | ✅ | Sin secretos, sin dependencias nuevas |
| Resto | — no aplica | Mismas razones que en P0 |

## D. Base de datos

| # | Resultado |
|---|---|
| D1–D13 | — no aplica: el motor **no toca base de datos**, y eso es el punto |

## E. Reglas de negocio

| # | Resultado | Evidencia |
|---|---|---|
| **E3** | ✅ | **Es el criterio de aceptación.** No se puede reservar con menos de 12 h de aviso, fuera de la ventana de 10 días hábiles ni fuera del horario. Cada una con sus pruebas, incluidos los bordes exactos |
| E4 | ⚠️ parcial | El tope diario se respeta: un día que llegó al tope no ofrece nada. **Con reservas concurrentes** es P6 |
| E1 | ✅ | Por la forma del dato de entrada |
| E8 · E10 · E11 | ✅ | Sin cambios |
| Resto | — no aplica | P6 y P8 |

### E3 — los bordes exactos, medidos

| Caso | Esperado | Resultado |
|---|---|---|
| Lunes 08:00, ¿se puede el lunes? | No: 08:00 + 12 h = 20:00, después del último tramo | ✅ |
| Lunes 21:00, ¿el martes 09:00? | Sí: son exactamente 12 h | ✅ |
| Lunes 21:01, ¿el martes 09:00? | No: falta un minuto | ✅ |
| Último espacio del tramo de mañana | 12:30–12:50, que termina justo en el borde | ✅ |
| El siguiente | No existe: empezaría a las 13:00 | ✅ |
| Margen: espacio que deja 10 minutos exactos | Entra: el margen es un mínimo | ✅ |
| Margen: espacio pegado al final de lo ocupado | No entra | ✅ |

## F. Frontend

| # | Resultado |
|---|---|
| F1–F9 | — no aplica: P5 no toca interfaz |

## G. Pruebas

| # | Resultado | Evidencia |
|---|---|---|
| G1 | ✅ | `Tests 159 passed (159)` |
| **G2** | ✅ | El dominio del paquete es lo único que tiene, y tiene 24 pruebas |
| **G3** | ✅ | **Sin base de datos.** Sin red. Sin servidor |
| G5 | ✅ | La entrada del motor no admite datos protegidos |
| **G6** | ✅ | `docs/pruebas/casos-conocidos.md` con M1–M21, **escritos a mano antes de ejecutar**. Más C1–C6 y B1–B4 de los adaptadores de P4 |
| G7 | ✅ | Sin datos de personas: el motor no los toca |
| G4 | — no aplica | Sin multi-tenencia |

### Lo que encontraron los casos conocidos

**Cuatro de las veintiuna expectativas escritas a mano estaban mal, y el motor
tenía razón.** Es exactamente para lo que sirve escribirlas antes:

1. Un espacio que deja **exactamente** los diez minutos de margen sí cumple: el
   margen es un mínimo, no algo que haya que superar (M8).
2. La ventana de diez días hábiles cuenta **desde hoy**, y hoy queda fuera por el
   aviso mínimo, así que se ofrecen nueve días (M5).
3. Por lo mismo, el último día ofrecido es el viernes 28 y no el lunes 31.
4. Y el total son 126 espacios, no 140.

Las dos lecturas quedaron **registradas como decisión** en `casos-conocidos.md`,
con la nota de qué habría que cambiar si el usuario las prefiere al revés.

## H. Documentación

| # | Resultado |
|---|---|
| H1 · H3 · H8 · H10 · H11 | ✅ |
| **H9** | ✅ | `docs/pruebas/casos-conocidos.md` completo: motor, calendario simulado y bot |
| H6 | ✅ — las decisiones del paquete son lecturas del SPEC y están registradas en los casos conocidos, que es donde se van a mirar |
| H2 · H4 · H5 · H7 | — no aplica |

## I. Optimización

| # | Resultado | Evidencia |
|---|---|---|
| I1–I3 | ✅ | `knip` señaló `SlotId` y `slotIdOf` sin consumidor y dejaron de exportarse. 0 clones |
| I4 | ✅ | Sin abstracciones de más. El motor es una función |
| I5 | ✅ | El cálculo es en memoria y acotado: 10 días × 14 candidatos. `OPTIMIZACION.md` §2 pide justamente que el cálculo de espacios sea puro y en memoria |
| I6 | ✅ | Los días hábiles se buscan con un `Set`, no con `includes` dentro de un bucle |
| I7 | ✅ | Sin cachés |
| I8 | ⚠️ diferido | El presupuesto de `GET /api/disponibilidad` se mide en P6, cuando exista el endpoint. El motor es la parte barata: no sale a ningún lado |

---

## Resumen

```
AUDITORÍA P5

A. Arquitectura      ✅ A1-A3, A6 · — A4, A5
B. Código            ✅ B1-B12
C. Seguridad         ✅ C5, C6, C11, C22, C26 · — resto
D. Base de datos     — no aplica: el motor no la toca, y ese es el punto
E. Reglas de negocio ✅ E1, E3, E8, E10, E11 · ⚠️ E4 parcial (concurrencia en P6)
F. Frontend          — no aplica
G. Pruebas           ✅ G1, G2, G3, G5, G6, G7 · 159 pruebas en verde · — G4
H. Documentación     ✅ H1, H3, H6, H8, H9, H10, H11 · — H2, H4, H5, H7
I. Optimización      ✅ I1-I7 · ⚠️ I8 diferido a P6 · — I9

npm run audit → salida 0 · 102 módulos, 160 dependencias, 0 clones, 0 vulnerabilidades
```

## Correcciones hechas durante la auditoría

| Check que falló | Qué se corrigió |
|---|---|
| G6 | Cuatro expectativas escritas a mano estaban mal y el motor tenía razón. Se corrigieron las expectativas y **las dos lecturas quedaron registradas** en `casos-conocidos.md` M5 y M8 |
| B7 | `no-magic-numbers` sobre el archivo de configuración → la regla se apagó solo en `src/config/**`, que es tabla de valores. En el motor se nombraron `MINUTES_PER_HOUR`, `MINUTES_PER_DAY`, `MILLISECONDS_PER_MINUTE` y `NOON_HOUR` |
| I1 | `SlotId` y `slotIdOf` exportados sin consumidor → dejaron de exportarse |
