# ADR-0004: CSP estricta con nonce, y el render dinámico que trae con ella

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P0 |
| Decisores | Claude Code |

## Contexto

`docs/SEGURIDAD.md` §4.1 exige "CSP estricta: `default-src 'self'`, sin
`unsafe-inline` ni `unsafe-eval`; **scripts con nonce**". `CLAUDE.md` §4 repite
la exigencia y agrega que toda duda se resuelve por la opción más restrictiva.

Next 16 emite scripts en línea propios para el arranque de la aplicación. Bajo
una CSP con `strict-dynamic`, esos scripts necesitan el nonce de la petición o el
navegador los bloquea y la página queda servida pero muerta.

Durante P0 se comprobó el fallo en un servidor real: con la política puesta solo
en la respuesta, la portada llegaba con **cero** scripts firmados.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| `unsafe-inline` | Todo estático, sin trabajo | Prohibido explícitamente. Anula la defensa contra XSS |
| Hashes `sha256` de los scripts de Next | Permite prerenderizar | Los hashes cambian en cada build; habría que recalcularlos automáticamente y aun así fallan ante cualquier cambio de Next |
| Nonce por petición + render dinámico | Cumple el estándar tal como está escrito | La página deja de prerenderizarse |

## Decisión

**Nonce por petición.** El proxy genera un nonce, construye la política y la
escribe en dos lugares:

1. en la **respuesta**, que es la que aplica el navegador;
2. en las **cabeceras reenviadas a la petición**, que es de donde Next lo toma
   para firmar sus propios scripts.

`src/app/layout.tsx` declara `export const dynamic = 'force-dynamic'`: sin eso,
una página prerenderizada guarda un nonce viejo que no coincide con la cabecera
de la petición y el navegador bloquea el arranque.

## Consecuencias

- **Se pierde el prerenderizado.** Todas las rutas se sirven por petición. Es el
  costo aceptado; está declarado y no escondido.
- La respuesta HTML no se puede compartir en una caché intermedia, porque cada
  una lleva su propio nonce. El presupuesto de LCP < 2.5 s de
  `docs/OPTIMIZACION.md` §2 pasa a depender del render en servidor, no de la
  caché. **Se mide en Pf**; si no alcanza, la salida es caché de los estáticos y
  render en el borde, no aflojar la CSP.
- En desarrollo la política abre `unsafe-eval` y `unsafe-inline` de estilos
  porque el recargado en caliente los necesita. El interruptor es `NODE_ENV`, no
  una variable de entorno que alguien pueda dejar mal puesta en producción.
- Hay pruebas que fijan las dos mitades: que la política de la respuesta no
  admita `unsafe-*` en producción, y que el nonce de la petición y el de la
  respuesta sean el mismo.
- P1 aprovecha el mismo nonce para el script en línea que fija el modo
  claro/oscuro antes del primer pintado.
