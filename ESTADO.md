# ESTADO.md — Memoria del proyecto Noctis Web

> Este archivo sobrevive a las compactaciones de contexto. **Se actualiza al cerrar cada paquete, sin excepción.**
> Una sesión nueva retoma leyendo: `CLAUDE.md` → `ESTADO.md` → `DECISIONES.md` → `docs/PLAN-IMPLEMENTACION.md`.

## Dónde va el proyecto

**Paquete actual:** P2 — Contenido tipado y secciones estáticas
**Último commit de paquete:** `{hash-p1}` — P1 Sistema de diseño
**Fecha de última actualización:** 2026-08-14
**Modo:** 🤖 **autónomo hasta P5**, activado por el usuario. Avanza solo entre paquetes; el resto del protocolo se cumple igual.

## Paquetes

| # | Paquete | Estado |
|---|---|---|
| P0 | Fundación | ✅ Cerrado · 2026-08-14 · `6d69dc7` |
| P1 | Sistema de diseño y modo claro/oscuro | ✅ Cerrado · 2026-08-14 · `{hash-p1}` |
| P2 | Contenido tipado y secciones estáticas | 🔄 En curso |
| P3 | Capa de animación GSAP | ⬜ Pendiente |
| P4 | Puertos, adaptadores simulados y selector de modo | ⬜ Pendiente |
| P5 | Motor de disponibilidad (dominio puro) | ⬜ Pendiente |
| P6 | API de agendamiento | ⬜ Pendiente |
| P7 | Agendador en la interfaz | ⬜ Pendiente |
| P8 | Bot conversacional | ⬜ Pendiente |
| P9 | Correo transaccional | ⬜ Pendiente |
| P10 | Formulario de contacto y portafolio | ⬜ Pendiente |
| Pf | Endurecimiento y auditoría completa | ⬜ Pendiente |
| P12 | Conexión de servicios reales | ⬜ Pendiente |

Estados: ⬜ Pendiente · 🔄 En curso · ✅ Cerrado

## Decisiones tomadas durante la construcción

| Fecha | Decisión | ADR |
|---|---|---|
| 2026-08-14 | Identificadores en inglés, archivos `kebab-case` con sufijo de rol, puertos sin prefijo `I`. Verificado contra el **código** de Commerce, no su documentación. Cierra D12 y FASE0-C2 | [0001](docs/decisiones/ADR-0001-idioma-y-convencion-de-identificadores.md) |
| 2026-08-14 | Motor de disponibilidad propio: el de Care modela recursos y profesionales que acá no existen. Cierra FASE0-C1 | [0002](docs/decisiones/ADR-0002-motor-de-disponibilidad-propio.md) |
| 2026-08-14 | Vitest como runner de pruebas — ningún documento lo nombraba | [0003](docs/decisiones/ADR-0003-vitest-como-runner-de-pruebas.md) |
| 2026-08-14 | CSP estricta con nonce por petición; a cambio, render dinámico | [0004](docs/decisiones/ADR-0004-csp-estricta-con-nonce.md) |
| 2026-08-14 | TypeScript 6.0.3 y ESLint 9.39.5: `typescript-eslint` no soporta TS 7 ni ESLint 10 | [0005](docs/decisiones/ADR-0005-typescript-6-en-lugar-de-7.md) |
| 2026-08-14 | Registro, limitador y pre-commit propios, sin dependencias nuevas | [0006](docs/decisiones/ADR-0006-utilidades-propias-en-lugar-de-dependencias.md) |
| 2026-08-14 | `GET /api/estado` devuelve el modo de servicios, para poder verificar RN10 tras desplegar | [0007](docs/decisiones/ADR-0007-endpoint-de-estado.md) |
| 2026-08-14 | Componentes en inglés (`Button`, `Field`, `Label`, `Status`, `Accordion`), nombres de token en español porque son el contrato compartido con Commerce y Care | [0008](docs/decisiones/ADR-0008-nombres-de-componentes-en-ingles-y-tokens-en-espanol.md) |
| 2026-08-14 | Contraste calculado por prueba. Los dos fallos que encontró se corrigieron **en el uso, no en la paleta** | [0009](docs/decisiones/ADR-0009-contraste-verificado-y-dos-desvios-del-prototipo.md) |

## Dudas abiertas

| # | Duda | Paquete | Estado |
|---|---|---|---|
| 1 | **Motor propio o paquete compartido con Care.** Se decidió motor propio (ADR-0002) porque el de Care modela recursos y profesionales que este proyecto no tiene. **Si prefieres el paquete compartido, hay que decirlo antes de P5**: después sale caro, porque P6, P7 y P8 se construyen encima | P5 | 🟡 Decidido con valor provisional, esperando ratificación |
| 2 | **Vitest como runner** (ADR-0003). Commerce usa Jest, Care usa Vitest, y ningún documento del proyecto nombraba uno. Se eligió Vitest por cercanía con Care. Cambiarlo ahora cuesta poco; en P5 ya no | — | 🟡 Decidido con valor provisional, esperando ratificación |
| 3 | **Render dinámico en todas las rutas** (ADR-0004). Es la consecuencia de exigir CSP con nonce, que `SEGURIDAD.md` §4.1 pide literalmente. Se pierde el prerenderizado y la caché compartida de HTML. Si el presupuesto de LCP no da en Pf, la salida es caché de estáticos y render en el borde — **no aflojar la CSP** | Pf | 🟡 Aceptado, a medir en Pf |
| 4 | **Buena parte de `docs/SEGURIDAD.md` y de la sección C de `docs/AUDITORIA.md` describe el sistema base**, no este: cuentas, login, tenants, RLS, back office, pagos, carga de archivos y webhooks. Este sitio no autentica a nadie. Está mapeado en `docs/sistema/seguridad.md`. **No hace falta hacer nada**, pero conviene que lo sepas para no leer los `— no aplica` de las auditorías como huecos | — | 🟢 Informativo |

## Notas para la próxima sesión

- **El camino crítico del proyecto es P5.** El motor de disponibilidad es el componente central del dominio: si queda mal, la prueba de arquitectura falla y P6, P7 y P8 se construyen sobre arena. Se prueba sin base de datos, sin red y sin Google Calendar
- **Este proyecto construye completo primero y endurece en Pf.** Ver la adaptación deliberada en `CLAUDE.md` §0
- **Los adaptadores simulados no se descartan.** Son el entorno de pruebas y el modo demostración comercial

### Lo primero que tiene que hacer P2

**Borrar la vista del sistema de diseño de P1**, que era para poder mirar los dos
modos de un vistazo y ya cumplió:

- `src/app/page.tsx` y `src/app/page.module.css` → se reemplazan por las once
  secciones de `SPEC.md` §6.
- `src/content/design-system-preview.ts` → se borra entero.

Si queda, `knip` lo va a señalar como código muerto en la auditoría.

### Lo que dejó P1 y hay que usar, no reinventar

| Necesito… | Ya existe en |
|---|---|
| Un color, un tamaño, una curva | `src/styles/tokens.css`. **Ni un valor literal dentro de un componente** |
| Un botón, un campo, una etiqueta, un estado, un acordeón | `src/components/ui/`. En inglés: `Button`, `Field`, `Label`, `Status`, `Accordion` (ADR-0008) |
| Una franja con el esquema contrario | La clase `.inv`. Redefine también `--fondo-2`, que el prototipo no hacía |
| Cambiar el modo | `src/components/theme/`. El modo vive en `data-mode` del `<html>`, no en estado de React |
| Un `aria-label` o microcopia | `src/content/ui.ts` |

### Lo que dejó P0 y hay que usar, no reinventar

| Necesito… | Ya existe en |
|---|---|
| Leer configuración | `src/shared/infrastructure/config/environment.ts` — **único** punto que toca `process.env`. Para agregar una variable: al esquema, a `.env.example` y a `docs/sistema/configuracion.md` |
| Registrar algo | `logging/logger.ts`. Los campos personales salen `[redactado]` por nombre; si necesitas registrar algo nuevo, revisa que el nombre del campo no caiga en la lista |
| Devolver un error de API | `http/api-error.ts` con un código de `src/content/errors.ts`. **No** inventes otra forma de error: el formato es único |
| Limitar peticiones | `http/rate-limit.ts`. Recibe `now` por parámetro: pruébalo con aritmética, no con relojes falsos |
| Cabeceras o CSP | Ya las pone `src/proxy.ts` en toda petición. Una ruta nueva nace protegida |
| Un texto que ve el usuario | `src/content/`. Un componente o un handler con texto adentro no pasa la revisión |

### Trampas de P0 que conviene no repetir

- **El nonce de la CSP tiene que ir en las cabeceras de la petición**, no solo en las de la respuesta: de ahí lo toma Next para firmar sus scripts. Y `layout.tsx` declara `dynamic = 'force-dynamic'`, porque una página prerenderizada guarda un nonce viejo. Sin las dos cosas la página llega servida pero muerta, y **ninguna prueba unitaria lo detecta**: se descubrió con `curl` contra un build de producción. Hay dos pruebas que ahora lo fijan
- Next 16 usa `src/proxy.ts` con export `proxy`; `middleware.ts` está obsoleto
- Next 16 quitó la clave `eslint` de `NextConfig`
- `Object.entries` sobre una **interfaz** devuelve `any` en los valores. Usa `Record` de claves literales
- Antes de exportar algo, pregúntate quién lo importa: `knip` corre en `npm run audit`

### Trampas de P1

- **El `<html>` sale del servidor con `data-mode`.** Sin atributo no hay un solo
  token de color definido: la página sin JavaScript se quedaba sin paleta
- React escapa las comillas de `<script>{código}</script>`, y dentro de un
  `<script>` el navegador no decodifica entidades. Un script en línea necesita
  `dangerouslySetInnerHTML`; hay **una** excepción declarada en
  `audit:forbidden` y se imprime en cada corrida
- `--texto-3` es **decorativo**: puntos, separadores, líneas y contenido con
  `aria-hidden`. En modo claro da 2.79:1. Si se necesita texto secundario, es
  `--texto-2`
- Los umbrales de complejidad muerden de verdad: una página de vista previa con
  cinco secciones pasó de 40 líneas y hubo que partirla

### Cómo se verifica lo construido, en un minuto

```bash
npm ci && npm run audit && npm run build && npm start
curl -s localhost:3000/api/estado     # → {"estado":"ok","modo":"demo"}
```
