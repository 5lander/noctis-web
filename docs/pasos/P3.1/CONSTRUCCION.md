# P3.1 — Capa de movimiento expresiva

> Paquete fuera de la numeración, como el rebrand de identidad. No estaba en
> `docs/PLAN-IMPLEMENTACION.md`: nace de un pedido directo del usuario sobre P3,
> que ya estaba cerrado.

## Resumen

| Campo | Valor |
|---|---|
| Paquete | P3.1 — Capa de movimiento expresiva |
| Fecha inicio / fin | 2026-08-14 / 2026-08-14 |
| Secciones del SPEC implementadas | `ANIMACION.md` v2 RA-01 a RA-14 |
| Estado | ✅ completado |

## Objetivo del paquete

Llevar el movimiento del sitio al nivel del showcase de GSAP, con la identidad de
Noctis como marco. Criterio de aceptación: el sitio se siente como algo
construido con oficio, **y** sigue cumpliendo las cuatro condiciones no
negociables de accesibilidad y degradación.

## Plan aprobado

El usuario eligió, entre las opciones planteadas: **WebGL con three.js** para el
cielo de la portada (la más cara de las tres), **ScrollSmoother activado** con
corte en móvil, y **autonomía total hasta el commit**.

Antes de escribir código se levantaron los tres choques con la documentación del
proyecto, como pide `CLAUDE.md` §0:

1. `ANIMACION.md` v1 prohibía explícitamente lo que se pedía → ADR-0013, v2.0 del
   documento.
2. D15 (licencia de GSAP) estaba en 🔴 y ya no correspondía → ADR-0012.
3. `CATALOGO-GSAP.md` dejaba WebGL fuera de alcance y `CLAUDE.md` §8 prohíbe
   dependencias nuevas → autorización explícita del usuario, ADR-0014.

## Qué se construyó

### Capa de animación

`animation-layer.tsx` pasó de tener los efectos adentro a **solo componer**. Cada
efecto vive en `components/animation/effects/` con el requisito en su cabecera.

| Efecto | Archivo | Requisito |
|---|---|---|
| Titular por líneas + botón magnético | `effects/hero.ts` | RA-01, RA-09 |
| Revelado por sección + onda y cortina | `effects/reveal.ts` | RA-02, RA-11 |
| Marquesina reactiva al scroll | `effects/marquee.ts` | RA-03 |
| Barra que se esconde | `effects/nav-bar.ts` | RA-04 |
| Acordeón | `effects/accordion.ts` | RA-05 |
| Proceso anclado + trazo | `effects/process.ts` | RA-12 |
| Parallax por capas | `effects/parallax.ts` | RA-13 |
| Inclinación por velocidad | `effects/scroll-skew.ts` | RA-10 |
| Cursor sobre la grilla | `effects/cursor.ts` | RA-14 |
| Suavizado + enlaces internos | `effects/smooth-scroll.ts` | RA-08 |
| Barrido del cambio de modo | `theme/mode-sweep.ts` | RA-06 |
| Cielo WebGL | `animation/hero-sky.tsx` + `sky-shader.ts` | RA-07 |

Los parámetros, todos, en `animation-settings.ts`. Los plugins se registran en un
solo lugar, `gsap-plugins.ts`.

### Marcado de las secciones

Ningún componente ganó lógica: ganaron atributos.

| Atributo | Dónde | Para qué |
|---|---|---|
| `data-owns-anim` | grilla de trabajos, panel de proceso | "esta sección anima sus piezas ella misma": el revelado genérico las deja en paz |
| `data-grid-wave` | grilla de trabajos | onda desde el centro |
| `data-curtain` | portada de cada trabajo | cortina de `clip-path` |
| `data-cursor-grow` | tarjeta de trabajo | el cursor crece encima |
| `data-skew` | grilla de trabajos | inclinación por velocidad |
| `data-magnetic` | botón principal de la portada | imán |
| `data-parallax="0.06"` | registro nocturno | profundidad declarada por el elemento |
| `data-process-panel` / `data-process-step` / `data-process-line` | proceso | anclaje y trazo |
| `#smooth-wrapper` / `#smooth-content` | `page.tsx` | andamio del suavizado |

### Dos bugs encontrados y corregidos

**1. El script del `<head>` estaba roto desde P3 y nadie lo sabía.**
`THEME_SCRIPT + ANIMATION_READY_SCRIPT` se concatenaban sin separador. Las dos
constantes terminan y empiezan en `)`/`(`, así que el navegador leía
`})()(function(){…})()` como una llamada, tiraba
`TypeError: (intermediate value)(...) is not a function` y **el segundo script no
corría nunca**. Resultado: la clase `animation-ready` no se ponía, el estado
inicial de toda la animación no existía y el temporizador de rescate tampoco.

No lo vio nadie porque la página se ve bien sin animación y **cada script pasaba
su propia prueba por separado**. Ahora hay `head-script-source.ts`, que los une
con `;`, y `head-script-source.spec.ts`, que ejecuta el **texto unido** —que es lo
único que el navegador llega a ejecutar.

**2. La grilla se quedaba torcida.** La inclinación por velocidad (RA-10) se
actualiza en `onUpdate` del disparador, y el disparador solo avisa mientras hay
scroll: la última inclinación se quedaba puesta para siempre. Se agregó un
`delayedCall` que endereza 0.12s después del último aviso.

## Cómo probarlo

```bash
npm run dev
```

| Qué mirar | Dónde |
|---|---|
| El titular entra por líneas, el cielo se enciende detrás | portada, al cargar |
| El botón principal persigue al puntero | "Ver trabajos" |
| La marquesina acelera al bajar y se invierte al subir | banda de servicios |
| La grilla entra en onda y las portadas se descubren | Trabajos |
| La grilla se inclina al desplazarse rápido y se endereza sola | Trabajos |
| El círculo del cursor crece sobre una tarjeta | Trabajos |
| La sección se ancla y los pasos entran en orden con el trazo | Proceso |
| El cambio de modo entra en círculo desde el botón | barra superior |

Y las cuatro que importan más:

```
1. Sistema con "reducir movimiento" → no se mueve nada y se ve todo
2. JavaScript deshabilitado → la página se ve y se usa entera
3. Ventana a menos de 768px → sin anclaje, sin suavizado, sin cielo, sin cursor
4. Navegador sin WebGL → queda el degradado del CSS detrás del titular
```

## Problemas encontrados durante la construcción

- **`SplitText` con máscara recorta a la altura de la caja de línea.** Source Serif
  4 a 104px se sale de esa caja, y el titular entraba con las mayúsculas y los
  descendentes cortados. Se resolvió con relleno vertical en `.hero-line`. El
  primer intento compensaba ese relleno con margen negativo: eso encoge la máscara
  y la última línea se monta sobre el párrafo. No se compensa.
- **La View Transitions API rechaza la promesa si se aborta la transición.** Dos
  clics seguidos en el botón de modo dejaban un rechazo sin atender en la consola.
  Se atiende explícitamente: el modo ya cambió, no hay nada que reportar.
- **El cursor personalizado arrancaba en la esquina superior izquierda**, porque
  nadie lo había movido todavía. No existe hasta el primer movimiento del puntero.
- **`tsc` sobre el proyecto tarda minutos** desde que entró `@types/three`, que
  arrastra seis dependencias de desarrollo. Es el costo de ADR-0014.
