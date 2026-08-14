# ADR-0010: El estado inicial de la animación cuelga de una clase, no del CSS a secas

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P3 |
| Decisores | Claude Code |

## Contexto

`ANIMACION.md` §3 RA-01 pide que el estado inicial de los elementos animados viva
en CSS y no en JavaScript: si lo pusiera JavaScript, habría un instante con el
contenido en su sitio antes de saltar al estado de partida.

El prototipo lo resuelve así:

```css
[data-anim]{opacity:0; transform:translateY(18px)}
.no-js [data-anim], .sin-anim [data-anim]{opacity:1; transform:none}
```

y JavaScript agrega `sin-anim` al `<body>` si GSAP no cargó.

**Tiene un agujero**: nadie agrega `no-js`. Con JavaScript deshabilitado del
todo, la clase de rescate nunca se pone y **la página queda en blanco**. RN11
dice que la página tiene que ser legible sin JavaScript, y `ANIMACION.md` §4
lo repite como condición no negociable.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Copiar el prototipo | Fidelidad literal | Deja el agujero: sin JavaScript, página en blanco |
| Animar con `gsap.from()`, sin estado inicial en CSS | Seguro por construcción | Destello del contenido antes de que hidrate y salte al estado de partida |
| Invertir: esconder **solo** si JavaScript lo pidió | Sin destello y sin agujero | Hace falta un script en el `<head>` y un rescate por si la capa no arranca |

## Decisión

**Invertir la condición.** El estado inicial cuelga de `html.animation-ready`, y
esa clase la pone un script en línea del `<head>` —el mismo que ya fija el modo,
para no gastar una segunda excepción de HTML crudo—.

Los tres escenarios quedan cubiertos:

| Escenario | Qué pasa |
|---|---|
| JavaScript deshabilitado | No hay clase, no hay estado inicial: se ve todo. Ni una línea de rescate |
| Todo normal | La clase está desde el primer byte: el estado inicial se aplica en el primer pintado, sin destello |
| La clase se pone pero la capa de animación no llega a ejecutarse | Un temporizador de tres segundos, dejado por el mismo script, quita la clase y se ve todo. La capa lo cancela apenas arranca |

## Consecuencias

- Es un desvío del CSS del prototipo. **Visualmente no cambia nada**: cambia
  quién decide esconder, no qué se ve.
- El temporizador de rescate es un mecanismo más, y por eso se prueba:
  `animation-ready-source.spec.ts` lo ejecuta con `node:vm` y comprueba que al
  dispararse la marca se quita.
- El corte de móvil no puede simplemente **no** animar: si no se anima, el estado
  inicial se queda puesto. Por debajo de 768 px la capa muestra los elementos de
  una vez, sin disparadores de scroll.
- Con `prefers-reduced-motion`, el CSS anula el estado inicial aunque la clase
  esté puesta, así que la página se ve entera aunque la capa nunca corra.
