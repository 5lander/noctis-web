# P3 — Resultado de auditoría

| Fecha | Auditor | Commit auditado |
|---|---|---|
| 2026-08-14 | Claude Code | `c4fc55f` |

> Checklist completa de `docs/AUDITORIA.md`. Las filas del sistema base siguen
> sin aplicar por la razón mapeada en `docs/sistema/seguridad.md`.

---

## A. Arquitectura

| # | Resultado | Evidencia |
|---|---|---|
| A1–A3 · A6 | ✅ | `audit:arch` limpio sobre **81 módulos y 126 dependencias**. La capa de animación es infraestructura de presentación: no contiene ni consulta regla de negocio alguna |
| A4 · A5 | — no aplica | Sin casos de uso |

## B. Código

| # | Resultado | Evidencia |
|---|---|---|
| B1 | ✅ | Sin hallazgos. La excepción de HTML crudo sigue siendo **una sola**: se fusionaron los dos scripts en línea en `inline-head-script.tsx` en vez de declarar una segunda |
| B2 · B3 | ✅ | Limpios |
| B4 · B5 | ✅ | La capa está partida en seis funciones cortas, una por requisito |
| B6 | ✅ | `toggleAccordionItem` toma dos parámetros |
| B7 | ✅ | `no-magic-numbers` señaló el `-100` del desplazamiento de la barra; pasó a `animation-settings.ts` con nombre. **Todos** los parámetros de animación viven ahí |
| B8–B12 | ✅ / ⚠️ | Sin `any`, sin `catch` silenciados, sin código comentado. B9 sigue parcial: los errores de dominio llegan con el dominio |

**Sobre `any` en el borde con el navegador**: `window[clave]` se lee con
`Reflect.get` y se estrecha con `typeof`, no con una conversión.

## C. Seguridad

| # | Resultado | Evidencia |
|---|---|---|
| C19 | ✅ | **CSP intacta y verificada sobre el build de producción**: `unsafe` aparece 0 veces en la cabecera. El script en línea del `<head>` lleva el nonce de la petición |
| C11 · C13 · C14 · C22 · C24 · C26 · C27 | ✅ | Sin cambios. `npm audit` en verde con GSAP instalado |
| Resto | — no aplica | Mismas razones que en P0 |

**GSAP no viene de un CDN.** Es una dependencia del paquete y se empaqueta con
la aplicación (`CLAUDE.md` §1). Verificado sobre el HTML servido: 0 referencias
a `cdnjs`, `jsdelivr` o `unpkg`. `audit:forbidden` lo vigila desde P0.

## D. Base de datos

| # | Resultado |
|---|---|
| D1–D13 | — no aplica: sin base de datos en v1 |

## E. Reglas de negocio

| # | Resultado | Evidencia |
|---|---|---|
| E11 | ✅ | **Es el criterio de aceptación del paquete y se verificó en las tres formas.** Ver abajo |
| E8 | ✅ | Los textos del registro nocturno pasan por la prueba de contenido: sin cifras, sin SRI |
| Resto | — no aplica | P5, P6 y P8 |

### E11 — la página nunca depende de JavaScript

Las tres condiciones no negociables de `ANIMACION.md` §4:

| Condición | Cómo queda cubierta |
|---|---|
| `prefers-reduced-motion: reduce` | En **CSS**: el estado inicial se anula aunque la clase esté puesta. Y en la capa: si la consulta coincide, no se crea ni una animación. Vale aunque el paquete de animación no llegue a ejecutarse |
| JavaScript deshabilitado | No se pone `animation-ready`, no hay estado inicial: se ve todo. **Sin ninguna línea de rescate**, por construcción (ADR-0010) |
| La capa no llega a ejecutarse | Temporizador de tres segundos dejado por el script del `<head>`, que quita la clase. Probado con `node:vm` |

El CSS del prototipo **no** cubría la segunda: nadie agregaba la clase `no-js`
que su hoja de estilos esperaba. Está en ADR-0010.

## F. Frontend

| # | Resultado | Evidencia |
|---|---|---|
| F1 · F2 | ✅ | Los parámetros de animación no son valores visuales sueltos: viven en `animation-settings.ts`, que es su tabla |
| F3 · F4 | ✅ | Los ganchos son atributos `data-*`, no clases visuales: la capa no depende de cómo se ve nada |
| F7 | ✅ | Corte de móvil con `gsap.matchMedia()` a 768 px. Por debajo se muestra sin disparadores de scroll |
| F9 | ✅ | **El acordeón sigue operable con teclado pese a interceptar el clic** (`SPEC.md` §8.4): sigue siendo `<details>` nativo, y `preventDefault` solo afecta al clic del ratón. El registro nocturno va con `aria-hidden` |
| F5 · F6 · F8 | — no aplica | Sin datos bloqueados, sin vistas de API, sin validación de formulario |

## G. Pruebas

| # | Resultado | Evidencia |
|---|---|---|
| G1 | ✅ | `Test Files 15 passed (15)` · `Tests 97 passed (97)` |
| G3 · G5 · G7 | ✅ | Sin base de datos ni red; el registro nocturno son datos inventados |
| G2 · G4 · G6 | — no aplica | Sin dominio |

Las animaciones no llevan prueba unitaria: necesitan un navegador y son 🟡 en
`CLAUDE.md` §7. **Lo que sí se prueba es lo que puede dejar la página en blanco**,
que es el script del `<head>`, ejecutado de verdad con `node:vm`.

## H. Documentación

| # | Resultado |
|---|---|
| H1 · H3 · H6 · H8 · H10 · H11 | ✅ — ADR-0010 con el índice al día |
| H2 · H4 · H5 · H7 · H9 | — no aplica |

## I. Optimización

| # | Resultado | Evidencia |
|---|---|---|
| I1–I3 | ✅ | `knip` limpio, complejidad limpia, 0 clones |
| I4 | ✅ | Una función por requisito de animación, ninguna abstracción de más |
| I5 | ✅ | Solo se anima `transform` y `opacity`, **con la única excepción autorizada** de la altura del acordeón (`ANIMACION.md` §1), que no tiene equivalente con `transform` |
| I6 · I7 | ✅ | Sin concurrencia ni cachés |
| I8 | ⚠️ diferido | 60 fps en gama media y Lighthouse ≥ 90 se miden en Pf, con un navegador de verdad |
| I9 | — no aplica | Desde P6b/P7b |

**Peso del cliente**: tres componentes de cliente en todo el sitio — botón de
modo, registro nocturno y capa de animación. Las once secciones siguen siendo
Server Components.

---

## Resumen

```
AUDITORÍA P3

A. Arquitectura      ✅ A1-A3, A6 · — A4, A5
B. Código            ✅ B1-B8, B10-B12 · ⚠️ B9
C. Seguridad         ✅ C11, C13, C14, C19, C22, C24, C26, C27 · — resto
D. Base de datos     — no aplica
E. Reglas de negocio ✅ E8, E11 · — resto
F. Frontend          ✅ F1-F4, F7, F9 · — F5, F6, F8
G. Pruebas           ✅ G1, G3, G5, G7 · 97 pruebas en verde · — G2, G4, G6
I. Optimización      ✅ I1-I7 · ⚠️ I8 diferido a Pf · — I9

npm run audit → salida 0 · 81 módulos, 126 dependencias, 0 clones, 0 vulnerabilidades
```

## Verificación sobre el HTML servido

```
$ npm run build && npx next start

$ grep -o 'animation-ready'                    → presente en el script del <head>
$ grep -o 'class="word"' | wc -l               → 7   (el titular, partido en el servidor)
$ ganchos: data-reveal-root · data-anim · data-marquee-track · data-nav-bar
           data-accordion-item · data-hero-headline · data-hero-follow   → todos presentes
$ grep -c "cdnjs|jsdelivr|unpkg"               → 0   (GSAP no viene de un CDN)
$ scripts sin nonce                            → 0
$ registro nocturno renderizado en servidor    → 22:41, 23:12 presentes
$ CSP con "unsafe" en producción               → 0
```

## Correcciones hechas durante la auditoría

| Check que falló | Qué se corrigió |
|---|---|
| E11 | El CSS del prototipo deja la página en blanco sin JavaScript. Se invirtió la condición del estado inicial y se agregó un temporizador de rescate (ADR-0010) |
| E11 / F7 | Saltarse la animación por debajo de 768 px dejaba el estado inicial puesto, o sea la página en blanco en móvil. Ahora se muestra de una vez |
| B7 | El `-100` del desplazamiento de la barra estaba suelto → `animation-settings.ts` |
| G | La prueba del script tomaba una foto de las clases antes de que corriera el rescate |
