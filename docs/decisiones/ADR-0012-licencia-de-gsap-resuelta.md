# ADR-0012: GSAP es gratuito por completo — D15 se cierra y los plugins entran

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P3.1 |
| Decisores | Usuario / Claude Code |

## Contexto

D15 estaba en 🔴 y bloqueaba: *"verificar términos vigentes antes de instalar
SplitText o ScrollSmoother"*. `ANIMACION.md` §2 marcaba `SplitText` como
"recomendado" y `ScrollSmoother` como "opcional, fase 2", ambos condicionados a
esa verificación, y por eso P3 partió el titular de la portada con una función
propia en el servidor en vez de usar el plugin.

La verificación, hecha ahora:

- Webflow, que mantiene GSAP desde 2024, liberó la biblioteca **completa** en
  2025: `https://gsap.com/pricing/` dice literalmente *"GSAP is now 100% free for
  all users"*, e incluye en esa lista los plugins que antes eran de Club, con
  `SplitText` y `ScrollSmoother` entre ellos.
- No hay tramo pago ni restricción de uso comercial.
- El paquete `gsap` de npm que el proyecto ya tenía instalado (3.15.0) **trae los
  plugins en el propio tarball**: `SplitText.js`, `ScrollSmoother.js`, `Flip.js`,
  `Observer.js`, `DrawSVGPlugin.js`, `MorphSVGPlugin.js`, `ScrambleTextPlugin.js`,
  `CustomEase.js` y `Physics2DPlugin.js` están en `node_modules/gsap/`.

O sea: no hay dependencia nueva que instalar ni licencia que comprar. Lo único
que faltaba era mirar.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Dejar D15 abierto y seguir resolviendo todo a mano | Cero riesgo legal percibido | El riesgo no existe; el costo de reimplementar `SplitText` y `ScrollSmoother` a mano sí |
| Usar los plugins desde el CDN de GSAP | Instalación cero | Prohibido por `CLAUDE.md` §1 y detectado por `audit:forbidden` |
| Cerrar D15 y usar los plugins del paquete instalado | Sin dependencia nueva, sin CDN, sin costo | Ata el sitio a que GSAP siga siendo gratuito |

## Decisión

**D15 pasa a ✅.** Los plugins se usan desde el paquete `gsap` de npm, servidos
desde el propio dominio. Se registran en un único módulo,
`components/animation/gsap-plugins.ts`.

Entran cinco: `ScrollTrigger` (ya estaba), `SplitText`, `ScrollSmoother`,
`DrawSVGPlugin` y `Observer`.

## Consecuencias

- RA-01 se resuelve como `ANIMACION.md` §3 quería desde el principio: corte por
  **líneas**, no por palabras. `Hero` vuelve a ser HTML plano.
- RA-08 (suavizado) deja de ser "fase 2" y entra ahora.
- Si GSAP volviera a ser pago en una versión futura, la salida es **no
  actualizar**: la versión instalada seguiría siendo gratuita bajo los términos
  vigentes al instalarla. El riesgo real es quedarse sin actualizaciones, no
  perder el derecho de uso.
- `docs/CATALOGO-GSAP.md` decía que ninguna de sus doce técnicas requería plugin
  de pago y que por eso la licencia no bloqueaba nada. Sigue siendo cierto, pero
  ahora además las que se resolvían a mano pueden resolverse con el plugin.
