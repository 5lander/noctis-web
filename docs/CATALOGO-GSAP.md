# CATALOGO-GSAP.md — Repertorio de técnicas

**Demostración funcionando:** `prototipo/laboratorio-gsap.html` — doce técnicas en vivo, con los tokens del sitio.
**Complemento de** `docs/ANIMACION.md`, que define lo que efectivamente se implementa.

---

> **Actualización de P3.1.** Este documento se escribió como catálogo de lo que
> *además se podría hacer*. Después de P3.1 describe, en su mayoría, **lo que hay**:
> están implementadas la 01, 05, 07, 08, 09, 10, 11 y 12. Siguen fuera la 02
> (decodificado, que sigue sin usarse en contenido), la 03 (cifras, faltan cifras
> reales), la 04 (scroll horizontal) y la 06 (trazo SVG genérico — el del proceso sí
> se dibuja, con `DrawSVGPlugin`). Y lo que decía sobre WebGL —"fuera de alcance"—
> dejó de valer: entró, acotado y con autorización explícita
> ([ADR-0014](decisiones/ADR-0014-three-js-para-el-cielo-de-la-portada.md)).

## Cómo leer esto

`ANIMACION.md` es conservador a propósito: define el movimiento mínimo que hace que el sitio se sienta fluido sin pelear con la identidad minimalista. **Este documento es el catálogo de lo que además se puede hacer**, con el costo y el riesgo de cada cosa, para elegir con criterio en vez de por entusiasmo.

Ninguna técnica de acá requiere plugin de pago. Las que normalmente lo usarían están resueltas a mano en el laboratorio, así que **la licencia de GSAP no bloquea nada de esta lista**.

---

## Las doce, ordenadas por cuánto ruido meten

### Nivel 1 — invisibles, siempre convienen

| # | Técnica | Cómo se hace | Riesgo |
|---|---|---|---|
| 01 | Revelado por líneas con máscara | `overflow` + `stagger` | Ninguno. Es el efecto más rentable que existe |
| 09 | Botón magnético | `quickTo` sobre distancia del puntero | Ninguno, si es solo en el botón principal |
| 12 | Inclinación por velocidad de scroll | `getVelocity()` → `skewY` acotado | Exagerado marea. Techo de 7 grados |
| 03 | Cifras que suben al entrar | Tween sobre objeto + `onUpdate` | Ninguno. Necesita cifras reales |

### Nivel 2 — se notan, y está bien

| # | Técnica | Cómo se hace | Riesgo |
|---|---|---|---|
| 07 | Marquesina reactiva al scroll | Bucle + `timeScale` por dirección y velocidad | Bajo. Mejora directa de la actual |
| 08 | Onda en grilla desde el centro | `stagger:{grid, from:'center'}` | Bajo. Es una propiedad, no un algoritmo |
| 10 | Cortina con `clip-path` | Animar `inset()` | Bajo. Ideal para capturas del portafolio |
| 06 | Trazo SVG que se dibuja | `stroke-dashoffset` con `scrub` | Bajo. Encaja con la sección Proceso |

### Nivel 3 — protagonistas, usar con decisión consciente

| # | Técnica | Cómo se hace | Riesgo |
|---|---|---|---|
| 11 | Panel fijo con cruce de contenido | `pin` + timeline con `scrub` | Medio. Alarga la página; en móvil hay que simplificar |
| 05 | Parallax por capas | `yPercent` distinto por capa | Medio. Mucho parallax pelea con el minimalismo |
| 04 | Scroll horizontal con anclaje | `pin` + `scrub` | **Alto.** En móvil confunde: desactivar con `matchMedia` |
| 02 | Texto que se decodifica | Interpolación de caracteres | **Alto** en accesibilidad: el texto es ilegible mientras dura. Solo en etiquetas cortas, nunca en contenido importante |

---

## Recomendación para el sitio de Noctis

**Agregar sin discusión:** 09 (botón magnético) y 07 (marquesina reactiva). Cuestan poco y suben mucho la percepción de terminación.

**Agregar cuando exista el contenido:** 10 (cortina) para las capturas reales del portafolio, 03 (cifras) cuando haya números que mostrar, 06 (trazo) en la sección Proceso.

**Evaluar con prototipo antes de comprometer:** 11 (panel fijo) para Proceso. Es el que más cambia la sensación del sitio, y también el que más lo alarga.

**Pensarlo dos veces:** 04 (scroll horizontal). Es el recurso más vistoso y el más gastado. Toda agencia lo tiene, y en un sitio que quiere leerse como sobrio puede sonar a disfraz.

**No usar en contenido:** 02 (decodificado). Un dueño de negocio que llega desde WhatsApp no espera que el texto se revuelva antes de poder leerlo.

---

## Reglas que aplican a todo lo de arriba

1. **`gsap.matchMedia()` obligatorio** en 04, 05 y 11: en móvil se simplifican o se apagan
2. **`prefers-reduced-motion` desactiva todo**, sin excepciones
3. **Sin GSAP la página sigue legible** — el estado inicial nunca deja contenido invisible sin salida
4. **`pin` y `scrub` solo con `invalidateOnRefresh`**, o se rompen al rotar el teléfono
5. **Todo dentro de `gsap.context()` con limpieza**, o el App Router deja triggers huérfanos
6. **Presupuesto:** cada técnica que se agregue no puede bajar el Lighthouse móvil de 90

---

## Lo que este catálogo no incluye

- **ScrollSmoother** — se lleva mal con varios navegadores móviles y suele sentirse artificial. Evaluar aparte
- **Transiciones entre páginas** — requieren decidir primero si hay páginas de detalle
- **Efectos con WebGL o shaders** — otro orden de complejidad y de peso; fuera de alcance
