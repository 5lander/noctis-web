# P3 — Documento de construcción

## Resumen

| Campo | Valor |
|---|---|
| Paquete | P3 — Capa de animación GSAP |
| Fecha inicio / fin | 2026-08-14 / 2026-08-14 |
| Commit final | `{hash}` |
| Secciones implementadas | `ANIMACION.md` RA-01 a RA-05, §4 accesibilidad y corte de móvil |
| Estado | ✅ completado |

## Objetivo del paquete

RA-01 a RA-05 portados a React, dentro de `gsap.context()` con limpieza.

**Aceptación:** con `prefers-reduced-motion` todo visible y legible · si GSAP no
carga, la página sigue usable · navegar entre rutas no deja ScrollTriggers
huérfanos · CSP sin `unsafe-inline`.

## D15 — por qué no bloqueó

`DECISIONES.md` D15 está en 🔴 y bloquea "P3 **si se usan plugins**". No se usa
ninguno de los dos en cuestión:

- **SplitText** no hace falta: el titular se parte en palabras **en el servidor**,
  que además es mejor que hacerlo con JavaScript —el HTML sale ya partido, sin un
  instante con el titular entero reorganizándose—.
- **ScrollSmoother** está fuera de v1 por `SPEC.md` §13.

`CLAUDE.md` §1 autoriza GSAP core y ScrollTrigger como stack. Se instaló
`gsap@3.15.0`, cuya licencia declarada es la estándar "no charge". **D15 sigue
abierto** para el día que se quieran los plugins.

## Qué se construyó

| Archivo | Qué resuelve |
|---|---|
| `animation/animation-settings.ts` | Los parámetros de `ANIMACION.md` §1 y §3, en un solo lugar |
| `animation/animation-ready-source.ts` | El script que marca el documento y deja el temporizador de rescate (ADR-0010) |
| `animation/animation-layer.tsx` | RA-01 a RA-05 dentro de un `gsap.context()` |
| `head/inline-head-script.tsx` | El **único** script en línea: modo + marca de animación |
| `styles/animation.css` | Estados iniciales, todos bajo `html.animation-ready` |
| `sections/night-log.tsx` + `content/night-log.ts` | El registro nocturno de la portada |

### Cómo se anima sin volver la página un componente de cliente

`AnimationLayer` es **un solo** componente de cliente que anima el HTML que ya
renderizó el servidor, buscándolo por atributos `data-*`. Las once secciones
siguen siendo Server Components: el sitio entero tiene tres componentes de
cliente —el botón de modo, el registro nocturno y esta capa—.

| Requisito | Gancho | Cómo se implementó |
|---|---|---|
| RA-01 portada | `[data-hero-headline]`, `[data-hero-follow]` | Una timeline: palabras con máscara, luego bajada, botones y etiqueta con solapamiento negativo |
| RA-02 revelado | `[data-reveal-root]`, `[data-anim]` | Una timeline por sección, `start: 'top 78%'`, sin reversa |
| RA-03 marquesina | `[data-marquee-track]` | La pista se duplica y se corre `xPercent: -50` en bucle |
| RA-04 barra | `[data-nav-bar]` | Un ScrollTrigger global con umbral de 140 px |
| RA-05 acordeón | `[data-accordion-item]`, `[data-accordion-body]` | Altura animada, interceptando el clic del `summary` |

### Limpieza — el criterio de aceptación

Todo se crea dentro de `gsap.context()`. Al desmontar, `revert()` deshace los
estilos y mata los ScrollTrigger. Los `addEventListener` del acordeón no los
cubre el contexto, así que la capa devuelve su propia función de limpieza y los
quita a mano.

## Decisiones técnicas tomadas

| # | Decisión | Razón | ADR |
|---|---|---|---|
| 1 | El estado inicial cuelga de `html.animation-ready`, no del CSS a secas | El CSS del prototipo deja la página en blanco con JavaScript deshabilitado | [0010](../../decisiones/ADR-0010-estado-inicial-de-animacion-invertido.md) |
| 2 | Un solo script en línea para modo y animación | Cada script en línea es una excepción a la prohibición de HTML crudo; una sale más barata que dos | — |
| 3 | `gsap.context()` en `useLayoutEffect`, sin `@gsap/react` | `CLAUDE.md` §10 admite las dos formas y `useGSAP()` sería una dependencia para lo que hace `gsap.context()` | — |
| 4 | El titular se parte en el servidor | Evita `SplitText` (D15 🔴) y evita el instante con el titular entero antes de reorganizarse | — |
| 5 | En móvil, los elementos se muestran de una vez | No se puede "no animar" y ya: el estado inicial se quedaría puesto y la página quedaría en blanco por debajo de 768 px | — |

## Pruebas

| Tipo | Cantidad | Qué cubren |
|---|---|---|
| Script de animación, ejecutado | 4 | Marca el documento, deja el temporizador de rescate, al dispararse la marca se quita, y publica su identificador para poder cancelarlo |
| **Nuevas en P3** | **4** | Total del proyecto: **97** |

Las animaciones en sí no llevan prueba unitaria: requieren un navegador de
verdad y son 🟡 en `CLAUDE.md` §7. Lo que **sí** se prueba es lo que puede dejar
la página en blanco, que es el script del `<head>`. La degradación se verifica a
mano, en el navegador, con los pasos de más abajo.

## Problemas encontrados y cómo se resolvieron

| Problema | Solución | Tiempo perdido |
|---|---|---|
| El CSS del prototipo deja la página en blanco sin JavaScript: nadie agrega la clase `no-js` de rescate | Invertir la condición y agregar un temporizador de rescate (ADR-0010) | Medio |
| Saltarse la animación en móvil dejaba el estado inicial puesto, o sea la página en blanco por debajo de 768 px | En móvil se muestran los elementos de una vez, sin disparadores de scroll | Bajo |
| La primera versión de la prueba tomaba una foto del conjunto de clases antes de que el rescate corriera | Devolver una función en vez de un arreglo | Bajo |
| `no-magic-numbers` señaló el `-100` del desplazamiento de la barra | Pasó a `animation-settings.ts` con nombre | Bajo |

## Deuda y pendientes

Ninguna deuda. Lo que `ANIMACION.md` deja para más adelante:

- **Fase 2**: `SplitText` por líneas (D15), marquesina reactiva a la dirección
  del scroll, y RA-06 con una transición de modo más elaborada.
- **Fase 3**: `ScrollSmoother` (fuera de v1), cursor propio, transiciones entre
  páginas.
- **RA-07**: cuando lleguen las capturas reales, evaluar reemplazar el hover por
  video o scroll interno. Requiere decidir peso de assets.
- **Pf**: medir 60 fps en gama media y Lighthouse ≥ 90.

## Cómo probar manualmente lo construido

```bash
npm run build && npm start
```

1. **Portada.** Al cargar, el titular entra palabra por palabra desde abajo, y
   después bajada, botones y etiqueta.
2. **Revelado.** Bajar despacio: cada sección aparece en cascada al entrar, y no
   vuelve a esconderse al subir.
3. **Marquesina.** La banda corre sin salto ni corte.
4. **Barra.** Al bajar se esconde, al subir vuelve. Arriba de todo no parpadea.
5. **Acordeón.** Abre y cierra con altura animada, **y sigue funcionando con
   `Enter` desde el teclado**.
6. **Movimiento reducido.** Activarlo en el sistema y recargar: cero movimiento,
   todo visible, el registro nocturno deja de rotar.
7. **Sin JavaScript.** Deshabilitarlo y recargar: **la página se ve entera**.
8. **Móvil.** A menos de 768 px: la entrada de portada se conserva, el resto
   aparece directamente.
9. **Rutas.** Navegar fuera y volver: sin errores de ScrollTrigger en la consola.
