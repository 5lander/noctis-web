# P4 — Resultado de auditoría

| Fecha | Auditor | Commit auditado |
|---|---|---|
| 2026-08-14 | Claude Code | `b0a4789` |

---

## A. Arquitectura — el paquete que la pone a prueba

| # | Resultado | Evidencia |
|---|---|---|
| A1 | ✅ | `modules/availability/domain/time-range.ts` es el primer archivo de dominio del proyecto y no importa **nada**: ni `shared`, ni módulos de Node. `audit:arch` lo verifica sobre 97 módulos y 153 dependencias |
| A2 | ✅ | Los cuatro puertos viven en `application/ports/` y no importan una sola implementación. La regla `aplicacion-sin-infraestructura` está en `error` |
| A3 | ✅ | Los adaptadores no contienen regla de negocio. `FakeCalendar` rechaza el solape porque es lo que hace un calendario, no porque decida nada del negocio |
| A4 | — no aplica | Los casos de uso llegan en P6. Los adaptadores reciben su comportamiento por constructor, que es la misma disciplina |
| A6 | ✅ | Las 135 pruebas corren sin base de datos, sin red y sin servidor |

## B. Código

| # | Resultado | Evidencia |
|---|---|---|
| B1 · B2 · B3 | ✅ | Limpios. Sigue habiendo **una sola** excepción de HTML crudo, impresa en cada corrida |
| B4 · B5 | ✅ | `max-depth` saltó a 4 generando bloques sembrados; se extrajo `blocksOfDay` |
| B6 | ✅ | `guardReal` toma tres parámetros; ninguna función pasa de ahí |
| B7 | ✅ | Las horas ocupadas del calendario simulado pasaron a constantes con nombre |
| B8 | ✅ | **`TimeRange` es el primer tipo de dominio del sistema**: los puertos hablan de intervalos, no de pares de `Date` |
| B9 | ✅ | Tres errores tipados nuevos: `MissingCredentialsError`, `RealAdapterNotBuiltError`, `SlotAlreadyTakenError`. Cada uno dice qué pasó y qué hacer |
| B10–B12 | ✅ | Sin `catch` nuevos, sin código comentado. El entorno sigue validado por esquema |

## C. Seguridad

| # | Resultado | Evidencia |
|---|---|---|
| C5 · C6 | ✅ | **RN1 está en la forma del puerto.** `busyRanges` devuelve `TimeRange`, y una prueba comprueba que las únicas claves de cada bloque son `startsAt` y `endsAt`. Un adaptador no puede filtrar título ni asistentes porque no hay dónde ponerlos |
| C11 | ✅ | `audit:secrets` limpio. Las credenciales están por **nombre**, nunca por valor |
| C12 | — no aplica | No se persiste nada en v1 |
| C14 | ✅ | **Probado**: el registro del correo simulado no contiene destinatario, asunto ni cuerpo |
| C13 · C19 · C22 · C24 · C26 · C27 | ✅ | Sin cambios |
| Resto | — no aplica | Mismas razones que en P0 |

**`/dev/bandeja` en producción**: verificado sobre el build de producción, **404**.
Es donde se ven correos enteros, y por eso no existe fuera de desarrollo.

## D. Base de datos

| # | Resultado |
|---|---|
| D1–D13 | — no aplica: v1 usa `MemoryStore`. Si se decide persistir (D5), entra un adaptador de PostgreSQL detrás del mismo puerto **sin tocar dominio ni casos de uso**, y esta sección vuelve a regir entera |

## E. Reglas de negocio

| # | Resultado | Evidencia |
|---|---|---|
| **E10** | ✅ | **Es el criterio de aceptación del paquete.** Verificado en el build real, no solo en pruebas. Ver abajo |
| E2 | ⚠️ parcial | `FakeCalendar` rechaza el segundo intento sobre el mismo espacio, con prueba. La concurrencia real del lado del caso de uso es P6 |
| E1 | ✅ | Adelantado: la forma del puerto lo impide (C5) |
| E5 · E6 · E13 | ✅ | Adelantados por el bot simulado: no da cifras ni preguntándoselo cuatro veces, y **un mensaje con instrucciones incrustadas no cambia su respuesta** — no porque las resista, sino porque no lee instrucciones |
| E8 · E11 | ✅ | Sin cambios |
| E12 | ✅ | El registro del correo no lleva dato personal |
| Resto | — no aplica | P5, P6 y P8 |

### E10 — verificado contra el build, no contra una prueba

```
$ npm run build                                   → salida 0, arranca en demo
$ curl -s localhost:3000/api/estado               → {"estado":"ok","modo":"demo"}

$ MODO_SERVICIOS=real npx next build              → salida 1
El servicio "calendar" está configurado en modo real y faltan estas variables:
GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY.
La aplicación no arranca en simulado sin avisar (RN10).
```

Y con las credenciales puestas **también** se detiene, porque el adaptador real
llega en P12: seguir sería usar el simulado sin avisar, que es justo lo prohibido.
Los dos caminos tienen prueba.

## F. Frontend

| # | Resultado | Evidencia |
|---|---|---|
| F1 · F2 | ✅ | La bandeja de desarrollo usa tokens, sin un valor literal |
| F6 | ⚠️ parcial | La bandeja tiene estado vacío. Carga y error llegan con las vistas que consuman la API (P7) |
| Resto | — no aplica | Sin cambios respecto a P2 |

## G. Pruebas

| # | Resultado | Evidencia |
|---|---|---|
| G1 | ✅ | `Tests 135 passed (135)` |
| G2 | ✅ | `TimeRange`, el único dominio del paquete, tiene sus pruebas |
| G3 | ✅ | **Sin base de datos, sin red y sin servidor** — que es exactamente lo que estos adaptadores existen para permitir |
| G5 | ✅ | La prueba de RN1 inspecciona las claves del dato, no su contenido |
| G7 | ✅ | Datos sintéticos: `ana@ejemplo.ec`, `luis@ejemplo.ec`, `agenda@noctis.test` |
| G4 · G6 | — no aplica | Sin multi-tenencia; los casos conocidos llegan con el motor en P5 |

## H. Documentación

| # | Resultado |
|---|---|
| H1 · H3 · H5 · H8 · H10 · H11 | ✅ — `configuracion.md` y `.env.example` con la sección de credenciales |
| H6 | ✅ — sin decisiones que ameriten ADR: todas salen directo de `BUILD.md` §2 y §3, y están en `CONSTRUCCION.md` |
| H2 · H4 · H7 · H9 | — no aplica |

## I. Optimización

| # | Resultado | Evidencia |
|---|---|---|
| I1–I3 | ✅ | `knip` señaló ocho exports sin consumidor fuera de su módulo y dejaron de exportarse. 0 clones |
| I4 | ✅ | Las cuatro interfaces con una sola implementación **son los puertos**, que es la excepción explícita de `OPTIMIZACION.md` §1. Y no son especulativos: el segundo implementador llega en P12 |
| I5 | ✅ | La latencia simulada es un `setTimeout`, no trabajo de CPU |
| I6 · I7 | ✅ | Sin concurrencia ni cachés |
| I8 | ⚠️ diferido | Los presupuestos p95 se miden sobre endpoints, que llegan en P6 |

---

## Resumen

```
AUDITORÍA P4

A. Arquitectura      ✅ A1-A3, A6 · — A4, A5
B. Código            ✅ B1-B12  (B9 pasa a verde: hay errores tipados de dominio)
C. Seguridad         ✅ C5, C6, C11, C13, C14, C19, C22, C24, C26, C27 · — resto
D. Base de datos     — no aplica
E. Reglas de negocio ✅ E1, E5, E6, E8, E10, E11, E12, E13 · ⚠️ E2 parcial · — resto
F. Frontend          ✅ F1, F2 · ⚠️ F6 parcial · — resto
G. Pruebas           ✅ G1, G2, G3, G5, G7 · 135 pruebas en verde · — G4, G6
H. Documentación     ✅ H1, H3, H5, H6, H8, H10, H11 · — H2, H4, H7, H9
I. Optimización      ✅ I1-I7 · ⚠️ I8 diferido · — I9

npm run audit → salida 0 · 97 módulos, 153 dependencias, 0 clones, 0 vulnerabilidades
```

## Verificación en servidor de producción

```
$ npm run build && npx next start
$ curl -s localhost:3000/api/estado               → {"estado":"ok","modo":"demo"}
$ curl -o /dev/null -w "%{http_code}" /dev/bandeja → 404   (solo en desarrollo)
$ curl -o /dev/null -w "%{http_code}" /            → 200
```

## Correcciones hechas durante la auditoría

| Check que falló | Qué se corrigió |
|---|---|
| G / determinismo | `guardReal` leía `process.env` directamente: la prueba de RN10 dependía del entorno de quien la corriera. La fuente entra por parámetro |
| I1 | Ocho exports sin consumidor fuera de su módulo → dejaron de exportarse |
| B5 | `max-depth` en 4 generando los bloques sembrados → se extrajo `blocksOfDay` |
| B7 | Las horas ocupadas estaban sueltas → constantes con nombre |
