# ESTADO.md — Memoria del proyecto Noctis Web

> Este archivo sobrevive a las compactaciones de contexto. **Se actualiza al cerrar cada paquete, sin excepción.**
> Una sesión nueva retoma leyendo: `CLAUDE.md` → `ESTADO.md` → `DECISIONES.md` → `docs/PLAN-IMPLEMENTACION.md`.

## Dónde va el proyecto

**Paquete actual:** P6 — API de agendamiento (siguiente)
**Último commit de paquete:** P3.1 — Capa de movimiento expresiva (fuera de la numeración, después de P5)
**Fecha de última actualización:** 2026-08-14
**Modo:** ⏸️ P3.1 se construyó en autonomía hasta el commit, a pedido. P6 en adelante espera confirmación del usuario.

## Paquetes

| # | Paquete | Estado |
|---|---|---|
| P0 | Fundación | ✅ Cerrado · 2026-08-14 · `6d69dc7` |
| P1 | Sistema de diseño y modo claro/oscuro | ✅ Cerrado · 2026-08-14 · `e8466b9` |
| P2 | Contenido tipado y secciones estáticas | ✅ Cerrado · 2026-08-14 · `65eb06d` |
| P3 | Capa de animación GSAP | ✅ Cerrado · 2026-08-14 · `c4fc55f` |
| P3.1 | Capa de movimiento expresiva (fuera de numeración) | ✅ Cerrado · 2026-08-14 |
| P4 | Puertos, adaptadores simulados y selector de modo | ✅ Cerrado · 2026-08-14 · `b0a4789` |
| P5 | Motor de disponibilidad (dominio puro) | ✅ Cerrado · 2026-08-14 · `45987f7` |
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
| 2026-08-14 | El estado inicial de la animación cuelga de `html.animation-ready`: el CSS del prototipo dejaba la página en blanco sin JavaScript | [0010](docs/decisiones/ADR-0010-estado-inicial-de-animacion-invertido.md) |
| 2026-08-14 | **D15 cerrado**: GSAP es gratuito por completo desde 2025, plugins incluidos. El paquete de npm ya los traía: no hubo nada que instalar | [0012](docs/decisiones/ADR-0012-licencia-de-gsap-resuelta.md) |
| 2026-08-14 | El criterio de animación gira: de "que no se note" a "que se note". `ANIMACION.md` pasa a v2.0 con nueve requisitos nuevos. **Decisión del usuario** | [0013](docs/decisiones/ADR-0013-criterio-de-animacion-expresivo.md) |
| 2026-08-14 | `three` como dependencia de producción para el cielo de la portada, autorizada explícitamente, con el uso acotado y la salida escrita si el presupuesto de Pf no da | [0014](docs/decisiones/ADR-0014-three-js-para-el-cielo-de-la-portada.md) |
| 2026-08-14 | Rebrand: la paleta vive en dos capas (los siete `--color-*` del spec de marca + los alias cortos que consumen los componentes) y el logotipo se sirve como imagen de fondo, no como SVG copiado en un componente | [0011](docs/decisiones/ADR-0011-paleta-de-marca-en-dos-capas-y-logo-como-imagen.md) |

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

### Lo que dejó P5 y hay que usar, no reinventar

| Necesito… | Ya existe en |
|---|---|
| Espacios libres | `freeSlots({ policy, busy, now })` de `modules/availability/domain/availability-engine.ts`. **Recibe todo por parámetro**: no lee reloj, ni zona, ni configuración |
| Las reglas de negocio | `config/scheduling.ts`. Cambiar el horario real (B4) es editar ese archivo; el motor no se toca |
| Hora de pared de una zona | `domain/local-time.ts`. **Nunca uses la zona del servidor** |
| Identificar un espacio | `slotOf(range)`. El identificador sale del instante de inicio, así que es estable entre peticiones — que es lo que P6 necesita para verificar que el espacio elegido es el que se reserva |

### Trampas de P5

- **El margen es un mínimo.** Un espacio que deja exactamente diez minutos
  cumple. Está en `casos-conocidos.md` M8 porque es lo que se lee al revés
- **La ventana de diez días hábiles cuenta desde hoy**, no desde el primer día
  agendable: con el aviso mínimo, el visitante ve nueve días. M5. Si el usuario
  lo quiere al revés, es una línea en `workdaysFrom` y hay que actualizar M5 y M6
- El tope diario cuenta **todo bloque ocupado del día**, no solo reuniones con
  prospectos: es lo único que el motor puede saber, y se equivoca ofreciendo de
  menos
- `docs/pruebas/casos-conocidos.md` se actualiza **antes** de tocar el motor, no
  después. Ya encontró cuatro errores míos

### Lo que dejó P4 y hay que usar, no reinventar

| Necesito… | Ya existe en |
|---|---|
| Hablar con el calendario, el correo, el bot o el almacén | `services` de `shared/infrastructure/config/service-registry.ts`. **Nunca instancies un adaptador dentro de una regla de negocio** |
| Un intervalo de tiempo | `modules/availability/domain/time-range.ts`. `overlaps` ya está escrito y probado |
| Agregar una credencial | `shared/infrastructure/config/credentials.ts`, a `.env.example` y a `docs/sistema/configuracion.md` |
| Que un adaptador simulado falle, para construir un estado de error | `new FakeCalendar({ latencyMs: 0, fault: 'unavailable' })` |

### Trampas de P4

- **El registro de servicios se compone al cargar el módulo.** Importarlo con una
  configuración mala tumba el arranque, que es lo que se busca. Si una prueba
  necesita otra configuración, usa `createServices(entorno, credenciales)` en vez
  del singleton
- Un `next build` con `MODO_SERVICIOS=real` **falla a propósito** y deja la salida
  a medias: hay que reconstruir en demo antes de `next start`
- La bandeja `/dev/bandeja` no existe en producción. No es un permiso: es que ahí
  se ven correos enteros
- El bot simulado **ignora lo que escribe el visitante** al decidir qué responder.
  No es una limitación, es la propiedad que hace que RN13 sea cierta

### Lo que dejó P3.1 y hay que usar, no reinventar

**Reemplaza a lo que dice P3 más abajo, que quedó viejo.** El criterio de
animación **cambió**: `docs/ANIMACION.md` es v2.0 y pide lo contrario que la v1.
Si lees la v1 en algún lado, es una cita histórica dentro del propio documento.

| Necesito… | Ya existe en |
|---|---|
| Animar algo nuevo | Un archivo en `components/animation/effects/`, y su llamada en `animation-layer.tsx`, que **solo compone**. No metas la animación dentro de la capa |
| Un número del movimiento | `animation-settings.ts`. Ni uno suelto: `no-magic-numbers` bloquea el commit |
| Un plugin de GSAP | `gsap-plugins.ts`, que los registra todos. Están **todos** disponibles y son gratuitos (D15 ✅) |
| Que una sección se revele al entrar | `data-reveal-root` en la sección y `data-anim` en cada pieza. Ya lo hace `layout/section.tsx` |
| Que una sección se anime **a su manera** | `data-owns-anim` en el contenedor: el revelado genérico la deja en paz. Si te lo olvidas, la pieza tiene dos dueños y gana el que corra último |
| Un color dentro de un shader o de un canvas | `brand-colors.ts`, que lo lee de `tokens.css`. **No escribas un color en el shader** |
| Un script en línea en el `<head>` | `head-script-source.ts`, que une los que ya están. **No agregues otro `<script>`** |

### Trampas de P3.1

- **Al unir scripts en línea, el separador importa.** Concatenar dos IIFE sin `;`
  produce `})()(function(){…})()`, que el navegador lee como una llamada. Estuvo
  roto desde P3 y **ninguna prueba lo vio**, porque cada script pasaba la suya por
  separado. Si agregas un tercero, va a `HEAD_SCRIPT` y la prueba del texto unido
  lo cubre solo.
- **Un efecto que se actualiza en `onUpdate` de un disparador se queda pegado.** El
  disparador solo avisa mientras hay scroll: el último valor se queda puesto. Si
  tu efecto tiene que volver a un reposo, necesita su propio temporizador — mira
  `straighten` en `scroll-skew.ts`.
- **`gsap.context()` no limpia escuchas.** Todo efecto que haga
  `addEventListener`, cree un elemento o parta un titular devuelve **su propia**
  función de limpieza, y la capa las junta.
- **La rama de móvil tiene que mostrar, no simplemente no animar.** Si no anima,
  el estado inicial —que esconde— se queda puesto. Es la misma trampa de P3, y
  ahora aplica también al proceso anclado y a las cortinas.
- **`SplitText` con máscara recorta a la caja de línea**, y una serif grande se
  sale de ella. El relleno de `.hero-line` es lo que lo arregla, y **no se
  compensa con margen negativo**: eso encoge la máscara y la última línea se monta
  sobre el párrafo.
- **`tsc` ahora tarda minutos.** `@types/three` arrastra seis dependencias de
  desarrollo. Es el costo de ADR-0014 y hay que contarlo al estimar.
- **Nada del movimiento tiene prueba automatizada.** Se verificó a mano contra el
  sitio corriendo. Playwright es de Pf, y las tres degradaciones (movimiento
  reducido, sin JS, móvil) son lo primero que hay que cubrir ahí.

### Lo que dejó P3 y hay que usar, no reinventar

| Necesito… | Ya existe en |
|---|---|
| Animar algo nuevo | `components/animation/animation-layer.tsx`, dentro del `gsap.context()` que ya está. Los parámetros van a `animation-settings.ts`, no sueltos |
| Que una sección se revele al entrar | `data-reveal-root` en la sección y `data-anim` en cada pieza. Ya lo hace `layout/section.tsx` |
| Un script en línea en el `<head>` | `components/head/inline-head-script.tsx`. **No crees otro**: cada uno es una excepción a la prohibición de HTML crudo. Agrega el tuyo a los que ya están |

### Trampas de P3

- **El estado inicial de la animación cuelga de `html.animation-ready`.** Si
  agregas un `[data-anim]` y no se anima nunca, queda invisible. En móvil por eso
  se muestran de una vez en vez de simplemente no animar
- Hay un temporizador de rescate de tres segundos en el script del `<head>`; la
  capa lo cancela al arrancar. Si escribes otra capa, cancélalo también
- D15 (licencia de GSAP) **sigue en 🔴**. No se usaron `SplitText` ni
  `ScrollSmoother`; si alguien los quiere, hay que resolver D15 antes
- La altura del acordeón es la **única** excepción autorizada a animar solo
  `transform` y `opacity`

### Lo que dejó P2 y hay que usar, no reinventar

| Necesito… | Ya existe en |
|---|---|
| Un texto del sitio | `src/content/`. **Hay una prueba** que recorre `src/components` y `src/app` buscando texto suelto en JSX: si escribes una palabra en un componente, falla |
| Una sección con encabezado | `components/layout/section.tsx`. Recibe el encabezado de `content/site-copy.ts` y `inverted` para la franja `.inv` |
| El ancho máximo del prototipo | `components/layout/container.tsx` |
| Poner un trabajo real (C1) | Cambiar `content/works.ts`: `cover` pasa a `{ kind: 'image', src, alt }`. **El componente no se toca** |
| Publicar el testimonio (C2) | `QUOTE.pending` a `false` en `content/site-copy.ts`. El componente no se toca |

### Rebrand de identidad visual — aplicado sobre P1, fuera de la numeración

Paleta, tipografía y logotipo salen desde ahora de
`docs/identidad-de-marca-noctis/spec-rebrand-noctis.md`. **Para color y
tipografía ese spec reemplaza al prototipo como fuente de verdad**; el prototipo
sigue mandando en composición, espaciado y comportamiento.

| Necesito… | Ya existe en |
|---|---|
| Un color de marca | `--color-accion` (interactivo) y `--color-acento` (decorativo) de `tokens.css`. **`--color-marca` no es texto en modo oscuro**: `#4338CA` sobre el fondo da 2.49:1, sirve de relleno con texto claro encima |
| El logotipo | `components/brand/logo.tsx`. **Solo se coloca sobre `--color-fondo`**: el recorte de la luna es un círculo opaco del color del fondo, no un recorte real (ADR-0011) |
| Verificar que un tono es el que dice la marca | `styles/contrast.spec.ts` lee el spec y `tokens.css` y compara los siete colores de cada modo. Cambiar uno sin el otro falla |

Lo que **no** entró en este pase, porque el pedido fue paleta, tipografía y
logo: el vidrio esmerilado en superficies flotantes más allá de la barra
(spec §5), el copy con el mensaje *"todo bajo una sola relación"* (spec §6 y
§7.5) y los archivos apilado y monocromo, que siguen en `docs/`.

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

### Trampas de P2

- **El registro nocturno de la portada no existe todavía.** En el prototipo lo
  genera JavaScript; entra en P3 con la capa de animación. No se dejó un
  contenedor vacío esperándolo
- **El formulario de contacto apunta a `/api/contacto` y responde 404** hasta
  P10. Es deliberado: un `<form>` sin destino envía por `GET` y deja lo que
  escribió el visitante en la barra de direcciones
- Los atributos `data-anim` del prototipo **no se portaron**: P3 decide cómo
  marca los elementos que anima, y copiarlos antes sería adivinar
- `content/` no puede importar nada. Si necesitas derivar algo del contenido,
  se deriva en el componente que lo usa

### Cómo se verifica lo construido, en un minuto

```bash
npm ci && npm run audit && npm run build && npm start
curl -s localhost:3000/api/estado     # → {"estado":"ok","modo":"demo"}
```
