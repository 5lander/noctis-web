# P0 — Resultado de auditoría

| Fecha | Auditor | Commit auditado |
|---|---|---|
| 2026-08-14 | Claude Code | `{hash}` |

> Se corrió la checklist **completa** de `docs/AUDITORIA.md`, no solo la rápida. En
> P0 sale barato porque el paquete es la fundación: correrla entera ahora deja el
> punto de partida medido y le quita trabajo a Pf.
>
> Buena parte de la checklist describe el sistema base —cuentas, tenants, RLS,
> pagos, uploads, webhooks— que **este proyecto no tiene**. Esas filas van
> marcadas `— no aplica` con su razón, como manda el propio documento. El
> resumen de qué secciones de `SEGURIDAD.md` quedan fuera y por qué está en
> `docs/sistema/seguridad.md`.

---

## A. Arquitectura

| # | Resultado | Evidencia |
|---|---|---|
| A1 | ✅ | Regla `dominio-solo-dominio` en `.dependency-cruiser.cjs` prohíbe **todo** import fuera de `domain/`: framework, SDKs, HTTP y módulos de Node. `audit:forbidden` añade `process.env`. Comprobado con archivo de prueba: `audit:fast` salió `1` |
| A2 | ✅ | Regla `aplicacion-sin-infraestructura`, severidad `error`. Sin `application/` todavía; la regla ya vigila la ruta |
| A3 | ✅ | Revisión de los nueve archivos de `shared/infrastructure/`: ninguno contiene regla de negocio. El limitador aplica una política que recibe; el registro no decide nada |
| A4 | — no aplica | No hay casos de uso todavía. Llegan en P4 |
| A5 | — no aplica | La fila habla del módulo `catalog` del sistema base, que no existe acá |
| A6 | ✅ | Las 56 pruebas corren sin base de datos, sin red y sin servidor: `vitest run` en 1,38 s |

## B. Código

| # | Resultado | Evidencia |
|---|---|---|
| B1 | ✅ | `audit:forbidden — sin hallazgos`. Cubre `any` en cinco formas, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` y `eslint-disable` |
| B2 | ✅ | `tsc --noEmit` limpio, con `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` |
| B3 | ✅ | `eslint .` limpio, con linting **tipado** (`recommendedTypeChecked` + `no-unsafe-*`) |
| B4 | ✅ | Función más larga: `GET` en `route.ts`, 26 líneas contando el `try`/`catch`. `max-lines-per-function` en 40 bloquea el commit |
| B5 | ✅ | `max-depth: 3` como error en ESLint, en cada commit |
| B6 | ✅ | `max-params: 3` como error. Ninguna función pasa de dos: donde había más, entra un objeto (`LogEntry`, `ApiErrorInput`, `CspOptions`) |
| B7 | ✅ | `no-magic-numbers` como error en todo `src/`. Apagado a propósito en archivos de configuración y pruebas, donde el número **es** el dato |
| B8 | — no aplica | No hay tipos de dominio todavía. `TimeSlot`, `SlotId`, `BookingId` y `LeadId` llegan con su dominio en P5 |
| B9 | ⚠️ parcial | Hay un error tipado (`ConfigurationError`). Los errores **de dominio** llegan con el dominio; no se inventaron antes de tener quién los lance |
| B10 | ✅ | Un solo `catch`, en `route.ts`: registra con correlación y devuelve el formato único. `no-empty` con `allowEmptyCatch: false` |
| B11 | ✅ | Revisión archivo por archivo. Los comentarios explican el *porqué*: por qué el registro redacta por nombre, por qué el nonce va también en la petición, por qué `DescribedError` es alias y no interfaz |
| B12 | ✅ | Zod en el único límite externo que existe hoy: el entorno. Los límites de red llegan con sus endpoints |

## C. Seguridad

| # | Resultado | Evidencia |
|---|---|---|
| C1–C4 | — no aplica | No hay base de datos, ni tenants, ni sesiones. El sitio no autentica a nadie |
| C5 | ✅ | `route.spec.ts`: `Object.keys(body).sort()` es exactamente `['estado','modo']`. Verificado sobre la respuesta cruda |
| C6 | ✅ | Lo que nunca sale (detalle de agenda, datos de otro prospecto, claves) no existe todavía; la única respuesta del sistema está fijada campo por campo |
| C7 · C15 | — no aplica | Sin SQL. El detector de SQL interpolado ya está puesto en `audit:forbidden` para el día que lo haya |
| C8 | — no aplica | Sin contraseñas |
| C9 | — no aplica | Sin webhooks entrantes |
| C10 | ✅ | Límite por origen aplicado en `/api/estado`. Verificado en servidor real: 30 × `200`, luego `429` con `retry-after` |
| C11 | ✅ | `audit:secrets — sin hallazgos`. `.env*` en `.gitignore` desde el primer commit y `audit:forbidden` falla si alguno queda rastreado |
| C12 | — no aplica | No se persiste ningún dato |
| C13 | ✅ | `api-error.spec.ts` fija que el cuerpo no contiene `at `, `node_modules`, `.ts:` ni `Error:` |
| C14 | ✅ | `logger.spec.ts`: campos personales → `[redactado]`. La IP no se registra en ningún punto (`client-ip.ts`) |
| C16 · C17 · C20 | — no aplica | Sin login ni recuperación de cuenta |
| C18 | — no aplica | No hay cuerpos de petición todavía. `.strict()` es obligatorio desde P6 |
| C19 | ✅ | Las seis cabeceras verificadas por `curl` sobre el build de producción, y fijadas por prueba. `Cache-Control: no-store` en la respuesta de estado y en toda respuesta de error |
| C21 | — no aplica | Sin carga de archivos |
| C22 | ✅ | Ninguna llamada saliente. El sistema no hace `fetch` a nada |
| C23 | — no aplica | Sin comparación de secretos todavía. Obligatorio en P6 con el token de cancelación |
| C24 | ✅ | La respuesta se construye campo por campo, nunca serializando una entidad |
| C25 | ⚠️ parcial | No hay llamadas salientes ni SQL que acotar. Los tiempos de espera se fijan con los adaptadores, en P4 |
| C26 | ✅ | `npm audit --audit-level=high` → `found 0 vulnerabilities` |
| C27 | ✅ | Pruebas de seguridad del paquete: cabeceras y CSP, límite, no filtración de campos, no registro de datos personales, correlación no forjable |
| C28–C30 | — no aplica | El catálogo de auditoría de `SEGURIDAD.md` §10 enumera eventos de cuentas, vacantes y pagos del sistema base. Acá el registro cubre lo que existe: errores de API con código, estado y correlación |

## D. Base de datos

| # | Resultado | Evidencia |
|---|---|---|
| D1–D13 | — no aplica | **No hay base de datos en v1** (`CLAUDE.md` §5, D5 🟡). Si se decide persistir, entra un adaptador de PostgreSQL sin tocar dominio ni casos de uso, y esta sección vuelve a regir completa |

## E. Reglas de negocio

| # | Resultado | Evidencia |
|---|---|---|
| E1–E7 · E9 · E12–E14 | — no aplica | Corresponden a P5, P6 y P8 |
| E8 | ✅ | `grep -ri "SRI\|facturación electrónica"` sobre `src/` → sin coincidencias. El contenido de cara al usuario son dos archivos y ninguno lo menciona |
| E10 | ⚠️ parcial | El entorno se valida por esquema al arrancar y una configuración mala impide el arranque nombrando la variable. **La exigencia de credenciales en `MODO_SERVICIOS=real` llega en P4**, cuando existan credenciales que exigir. Hoy no hay forma de caer a simulado en silencio porque no hay nada real que simular |
| E11 | ✅ | Sin JavaScript la página se lee: es HTML renderizado en servidor. No hay animación todavía (P3) |

## F. Frontend

| # | Resultado | Evidencia |
|---|---|---|
| F1 · F2 | ✅ | `src/styles/base.css` contiene solo un reset (`box-sizing`, `margin: 0`). Ningún color, tamaño, radio ni fuente en ninguna parte. Los tokens llegan en P1 |
| F3–F9 | — no aplica | No hay componentes de dominio, ni vistas que consuman la API, ni formularios. P1, P2 y P7 |

## G. Pruebas

| # | Resultado | Evidencia |
|---|---|---|
| G1 | ✅ | `Test Files 10 passed (10)` · `Tests 56 passed (56)` · 1,38 s |
| G2 | — no aplica | Sin dominio en este paquete |
| G3 | ✅ | Ninguna prueba levanta base de datos, red ni servidor |
| G4 | — no aplica | Sin multi-tenencia |
| G5 | ✅ | `route.spec.ts` fija las claves exactas de la respuesta; `logger.spec.ts` fija la redacción de campos personales |
| G6 | — no aplica | Los casos conocidos son del motor de disponibilidad (P5) y del bot (P8) |
| G7 | ✅ | Datos sintéticos: `190.0.0.1`, `ana@ejemplo.ec`, `203.0.113.7` (rango de documentación RFC 5737) |

## H. Documentación

| # | Resultado | Evidencia |
|---|---|---|
| H1 | ✅ | `docs/pasos/P0/CONSTRUCCION.md`, todas las secciones completas |
| H2 | ✅ | `docs/apis/estado.md` con la plantilla, y `docs/apis/FUNCIONAMIENTO.md` actualizado |
| H3 | ✅ | `docs/sistema/FUNCIONAMIENTO.md` con el apartado de P0 y tres diagramas Mermaid nuevos, verificados sintácticamente |
| H4 | — no aplica | Sin migraciones |
| H5 | ✅ | `docs/sistema/configuracion.md` reescrito contra `.env.example` y los scripts reales |
| H6 | ✅ | Siete ADRs, `ADR-0001` a `ADR-0007`, con el índice de `docs/decisiones/README.md` al día |
| H7 | ✅ | `docs/runbooks/despliegue.md` con comandos, verificación y tabla de fallos |
| H8 | ✅ | Entrada de P0 en `docs/CHANGELOG.md` |
| H9 | — no aplica | Los casos conocidos llegan con el motor de disponibilidad (P5) |
| H10 | ✅ | La documentación describe lo construido. Lo pendiente está marcado con su paquete |
| H11 | ✅ | Este archivo |

## I. Optimización y eficiencia

| # | Resultado | Evidencia |
|---|---|---|
| I1 | ✅ | `knip` limpio. Se dejaron de exportar seis símbolos sin consumidor en vez de justificarlos |
| I2 | ✅ | `audit:complexity` limpio, y los mismos umbrales corren dentro de `audit:lint`, o sea **en cada commit** |
| I3 | ✅ | `jscpd`: 0 clones sobre 28 archivos y 8111 tokens. Umbral 3 % |
| I4 | ✅ | Ninguna interfaz con una sola implementación. `RateLimiter` es el tipo de retorno de su fábrica, no una abstracción especulativa |
| I5 | ✅ | Nada pesado en el proceso HTTP: el saneado del registro opera sobre 512 caracteres como máximo |
| I6 | ✅ | Ningún `Promise.all`. Ninguna E/S concurrente todavía |
| I7 | ✅ | Ningún caché nuevo |
| I8 | ⚠️ diferido | Los presupuestos p95 de `OPTIMIZACION.md` §2 se miden sobre superficies que aún no existen. **Pf mide LCP con render dinámico**, que es la consecuencia declarada de ADR-0004 |
| I9 | — no aplica | El presupuesto de bundle aplica desde P6b/P7b |
| I10 | ✅ | No hubo optimizaciones no triviales |

---

## Resumen

```
AUDITORÍA P0

A. Arquitectura      ✅ A1, A2, A3, A6   · — A4, A5
B. Código            ✅ B1-B7, B10-B12   · ⚠️ B9   · — B8
C. Seguridad         ✅ C5, C6, C10, C11, C13, C14, C19, C22, C24, C26, C27
                     ⚠️ C25 · — C1-C4, C7-C9, C12, C15-C18, C20, C21, C23, C28-C30
D. Base de datos     — no aplica: sin base de datos en v1
E. Reglas de negocio ✅ E8, E11 · ⚠️ E10 · — el resto (P5, P6, P8)
F. Frontend          ✅ F1, F2 · — F3-F9 (P1, P2, P7)
G. Pruebas           ✅ G1, G3, G5, G7 · 56 pruebas en verde · — G2, G4, G6
H. Documentación     ✅ H1-H3, H5-H8, H10, H11 · — H4, H9
I. Optimización      ✅ I1-I7, I10 · ⚠️ I8 diferido a Pf · — I9

npm run audit → salida 0
```

Los tres `⚠️` no son deuda ni atajo: son verificaciones cuyo objeto todavía no
existe (credenciales en P4, tiempos de espera de servicios en P4, presupuestos
de rendimiento en Pf). Ninguna se resuelve escribiendo código de más ahora.

## Salida de `npm run audit`

```
> audit:types  · tsc --noEmit
> audit:lint   · eslint .
> audit:forbidden — sin hallazgos
> audit:arch   · ✔ no dependency violations found (19 modules, 19 dependencies cruised)
> audit:secrets — sin hallazgos (archivos versionados)
> audit:complexity · eslint . --config eslint.complexity.config.mjs
> audit:deadcode   · knip
> audit:duplication · jscpd
  ┌────────────┬────────────────┬─────────────┬──────────────┬──────────────┐
  │ Format     │ Files analyzed │ Total lines │ Total tokens │ Clones found │
  ├────────────┼────────────────┼─────────────┼──────────────┼──────────────┤
  │ javascript │ 6              │ 396         │ 1904         │ 0            │
  │ tsx        │ 1              │ 31          │ 100          │ 0            │
  │ typescript │ 21             │ 1153        │ 6107         │ 0            │
  │ Total:     │ 28             │ 1580        │ 8111         │ 0 (0.00%)    │
  └────────────┴────────────────┴─────────────┴──────────────┴──────────────┘
> audit:deps · found 0 vulnerabilities
> test · Test Files 10 passed (10) · Tests 56 passed (56) · 1.38s

salida = 0
```

## Prueba de que la compuerta muerde

```bash
$ cat > src/modules/availability/domain/probe.ts <<'EOF'
import { environment } from '@/shared/infrastructure/config/environment';
export const probe = environment.MODO_SERVICIOS === 'demo' && process.env['X'] !== undefined;
EOF

$ npm run audit:arch
  error dominio-solo-dominio: src/modules/availability/domain/probe.ts
      → src/shared/infrastructure/config/environment.ts
x 1 dependency violations (1 errors, 0 warnings). 20 modules, 20 dependencies cruised.
  salida = 1

$ npm run audit:forbidden
audit:forbidden — 1 hallazgo(s)
  src\modules\availability\domain\probe.ts:3  [entorno-en-el-dominio]
      El dominio no lee variables de entorno (CLAUDE.md §2).
  salida = 1

$ npm run audit:fast
  salida = 1        ← el commit queda bloqueado

$ rm src/modules/availability/domain/probe.ts && npm run audit:fast
  salida = 0
```

## Verificación en servidor de producción

```
$ npm run build && npx next start
$ curl -sD - localhost:3000/api/estado

HTTP/1.1 200 OK
content-security-policy: script-src 'self' 'nonce-CPudUtnl1Sxg4vxsTZP51Q==' 'strict-dynamic';
  style-src 'self' 'nonce-CPudUtnl1Sxg4vxsTZP51Q=='; default-src 'self'; img-src 'self' data:;
  font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self';
  frame-ancestors 'none'; upgrade-insecure-requests
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-correlation-id: 668545bb-c2c6-4135-86ef-98432d2a0a63
x-frame-options: DENY
cache-control: no-store

{"estado":"ok","modo":"demo"}

$ # 35 peticiones desde el mismo origen
200 ×30 · 429 ×5
{"error":{"code":"demasiadas_peticiones","message":"Recibimos demasiadas peticiones
 desde su conexión. Espere un momento y vuelva a intentar.",
 "correlationId":"63014730-de6a-4d54-825e-728b8a2ee2cb"}}

$ # el registro del 429, sin un solo dato de quien la hizo
{"at":"2026-08-14T14:54:50.518Z","level":"warn","event":"api.error",
 "correlationId":"ef484d46-71cc-4f9e-8bcf-88f3f471fe96",
 "fields":{"code":"demasiadas_peticiones","status":429}}

$ # nonce de la cabecera vs. nonce del HTML, en la misma respuesta
nonce cabecera: kOAYvcqBMbYCSVB2CbxOyA==
nonce HTML    : kOAYvcqBMbYCSVB2CbxOyA==   COINCIDEN
scripts sin nonce: 0

$ curl -sI localhost:3000/ | grep -ci x-powered-by
0
```

## Correcciones hechas durante la auditoría

| Check que falló | Qué se corrigió |
|---|---|
| C19 / verificación en servidor | La CSP con `strict-dynamic` dejaba sin firmar los scripts en línea de Next: la página llegaba servida pero muerta. El proxy pasó a reenviar la política en las cabeceras de la petición y `layout.tsx` a declarar `dynamic = 'force-dynamic'`. Se añadieron dos pruebas que fijan la coincidencia de nonces |
| B3 | `eslint .` falló con `no-unsafe-argument`: `Object.entries` sobre una interfaz devuelve `any`. `SecurityHeaders` pasó a ser un `Record` de claves literales |
| I1 | `knip` señaló seis exports sin consumidor. Se dejaron de exportar |
| B2 | Next 16 quitó la clave `eslint` de `NextConfig`. Retirada |
| — | `middleware.ts` está obsoleto en Next 16: migrado a `proxy.ts` antes del primer commit |
