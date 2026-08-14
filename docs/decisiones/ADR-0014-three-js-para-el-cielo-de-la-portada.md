# ADR-0014: three.js para el cielo de la portada, con autorización explícita

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P3.1 |
| Decisores | Usuario |

## Contexto

RA-07 pide un cielo de medianoche vivo detrás de la portada: la imagen central
del moodboard del manual de marca (`identidad-de-marca-noctis`, §6 "La sensación
de la marca").

Dos reglas del proyecto aplican y tiran en contra:

- `CLAUDE.md` §8 prohíbe dependencias nuevas sin autorización explícita.
- `docs/CATALOGO-GSAP.md` deja los efectos con WebGL o shaders **fuera de
  alcance**: "otro orden de complejidad y de peso".

Se plantearon las tres alternativas al usuario con su costo, y eligió three.js
sabiendo que era la más cara de las tres.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Canvas 2D, sin dependencia | Cero peso añadido, cero regla rota | Techo visual bajo: sin shaders, la nebulosa es un degradado que se mueve |
| WebGL con `ogl` (~8 KB) | Shaders reales, peso mínimo | Dependencia nueva igual; biblioteca chica, con menos camino recorrido |
| **WebGL con `three` (~150 KB)** | Techo visual alto, API conocida, mantenida | La dependencia más pesada del proyecto; castiga LCP, que ya está tensionado por el render dinámico de ADR-0004 |

## Decisión

**`three` 0.185.1 como dependencia de producción**, autorizada explícitamente por
el usuario, más `@types/three` como dependencia de desarrollo.

El uso está deliberadamente acotado, y el acotamiento es la mitad de la decisión:

- **Un solo cuadrilátero** que cubre la portada. Sin geometría, sin luces, sin
  texturas, sin modelos. Todo lo que se ve sale de la función de fragmento.
- Densidad de píxeles limitada a 1.5, aunque la pantalla ofrezca más.
- Se deja de dibujar cuando la portada sale del viewport
  (`IntersectionObserver`): el resto del recorrido no paga nada.
- Se monta **solo** en un componente de cliente propio (`hero-sky.tsx`), así que
  el paquete se parte y no entra en el JavaScript inicial de las demás secciones.
- Los colores no están en el shader: se leen de `tokens.css` en tiempo de
  ejecución y se vuelven a leer al cambiar de modo. `CLAUDE.md` §10 se cumple.

## Consecuencias

- Es la dependencia más grande del proyecto. **Hay que medirla en Pf** contra el
  presupuesto de `docs/OPTIMIZACION.md`; si el LCP no da, la salida documentada
  es reemplazar el shader por el degradado de CSS que ya está debajo y sacar la
  dependencia. El cambio es un archivo.
- Tres caminos dejan el WebGL fuera sin romper nada, porque el degradado del CSS
  queda debajo: movimiento reducido, navegador sin contexto WebGL, y que el
  paquete no llegue a ejecutarse.
- `@types/three` arrastra seis dependencias de desarrollo
  (`@dimforge/rapier3d-compat`, `@tweenjs/tween.js`, `@types/stats.js`,
  `@types/webxr`, `fflate`, `meshoptimizer`). No entran en el paquete que se
  sirve, pero engordan `node_modules` y el tiempo de `tsc`.
- El shader no está probado: no hay forma barata de probar GLSL. Lo que sí está
  probado es el conversor de color que lo alimenta (`brand-colors.spec.ts`), que
  es donde puede haber un error silencioso.
