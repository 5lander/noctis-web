# P3.1 — Resultado de auditoría

| Fecha | Auditor | Commit auditado |
|---|---|---|
| 2026-08-14 | Claude Code | el de este paquete |

> **Alcance.** Rige la adaptación de `CLAUDE.md` §0: en cada commit va la
> auditoría rápida, y la checklist completa de `docs/AUDITORIA.md` se corre entera
> en Pf. Acá está el resultado de `audit:fast` con evidencia, más las secciones
> que este paquete toca de verdad: **F. Frontend** y **G. Pruebas**.
>
> Un detalle que Pf tiene que mirar sí o sí: el **presupuesto de rendimiento**.
> Este paquete metió `three` y cinco plugins más de GSAP (ADR-0014).

---

## Auditoría rápida — `npm run audit:fast`

| Check | Resultado | Evidencia |
|---|---|---|
| `audit:types` | ✅ | `tsc --noEmit` sin salida. Dos errores durante la construcción, los dos arreglados sin `as` ni supresiones: la firma de índice que `ShaderMaterial` exige en los uniformes, y `startViewTransition`, que `lib.dom` declara siempre presente |
| `audit:lint` | ✅ | `eslint .` sin hallazgos. `no-magic-numbers` obligó a nombrar todo: los números del movimiento viven en `animation-settings.ts` y los del conversor de color en constantes propias |
| `audit:forbidden` | ✅ | Sin hallazgos. Una sola excepción declarada de `html-crudo`, la de siempre (`inline-head-script.tsx`), y **no** se agregó ninguna. Ni un `any`, ni una supresión, ni un script desde CDN: GSAP y three vienen del paquete |
| `audit:arch` | ✅ | `no dependency violations found (126 módulos, 209 dependencias)`. La capa de animación vive en `components/`, no toca dominio ni aplicación |
| `audit:secrets` | ✅ | Sin hallazgos |

Complementos corridos aunque no bloqueen en este paquete:

| Check | Resultado |
|---|---|
| `npm test` | ✅ 181 pruebas en 25 archivos |
| `next build` | ✅ compila y genera |

## A. Arquitectura

| # | Resultado | Evidencia |
|---|---|---|
| A1 · A2 | ✅ | Nada de este paquete toca `domain/` ni `application/`. Es todo `components/` y `styles/` |
| A3 | ✅ | Sin infraestructura nueva |
| Resto | — no aplica | El paquete es capa de presentación entera |

## B. Código

| # | Resultado | Evidencia |
|---|---|---|
| B1–B3 | ✅ | Un archivo por efecto, con el requisito que implementa en su cabecera. `animation-layer.tsx` **solo compone** |
| B4 · B5 | ✅ | `max-lines-per-function` (40) y `max-depth` (3) verificados por el linter. La función más larga es `startSky`, con 26 |
| B6 | ✅ | `max-params` 3, verificado. `renderWhileVisible` toma exactamente 3 |
| B7 | ✅ | Ni un número suelto: todo el movimiento sale de `animation-settings.ts`. Los del shader viven en el GLSL, que es una cadena y no código TypeScript |
| B9 · B10 | ✅ | Dos `catch`, los dos con su porqué escrito y ninguno silencioso por comodidad: el contexto WebGL que el navegador no da (queda el degradado), y la transición de modo abortada por dos clics seguidos (el modo ya cambió) |
| B11 · B12 | ✅ | Sin código comentado |

## C. Seguridad

| # | Resultado | Evidencia |
|---|---|---|
| C4 | ✅ | Sin `dangerouslySetInnerHTML` nuevo. El único que hay quedó **mejor** que antes: ahora su contenido está probado ejecutándose |
| C11 · C26 | ✅ | Sin secretos. Una dependencia nueva de producción (`three`) y una de desarrollo (`@types/three`), autorizadas y documentadas en ADR-0014 |
| CSP | ✅ | No hizo falta aflojarla. WebGL no necesita `unsafe-eval`, y GSAP escribe estilos por CSSOM, que `style-src` no gobierna. Verificado en el navegador: sin violaciones de CSP en consola |
| Resto | — no aplica | El paquete no toca API, datos ni el bot |

## F. Frontend

| # | Resultado | Evidencia |
|---|---|---|
| F1 · Sin estilos literales | ✅ | Ni un color en un componente. El shader **lee los colores de `tokens.css`** en tiempo de ejecución (`brand-colors.ts`) y los relee al cambiar de modo |
| F2 · Separación | ✅ | Las secciones siguen siendo Server Components y no ganaron lógica: ganaron atributos `data-*`. Los dos únicos componentes de cliente nuevos son la capa y el cielo |
| F3 · Modo claro/oscuro | ✅ | Sigue en `data-mode` y sigue fijándose antes del primer pintado — **y ahora de verdad**: el script del `<head>` estaba roto y no corría su segunda mitad |
| F4 · Limpieza de animaciones | ✅ | Todo dentro de `gsap.context()`. Además, cada efecto que pone escuchas devuelve su limpieza, porque `context` no sabe de `addEventListener`: `SplitText.revert()`, los imanes, el acordeón, el cursor, el puntero del cielo y los enlaces internos |
| F5 · Movimiento reducido | ✅ | Verificado en tres capas: la capa no arranca, el CSS anula el estado inicial aunque la clase esté puesta, y el cielo no se monta |
| F6 · Sin JavaScript | ✅ | Sin la clase `animation-ready` no hay estado inicial y se ve todo. El cielo deja su degradado de CSS. El temporizador de rescate de tres segundos sigue en pie |
| F7 · Foco de teclado | ✅ | Sin cambios en el foco. El acordeón sigue siendo `<details>` nativo; el cursor personalizado **no reemplaza** al del sistema y va con `aria-hidden` |
| F8 · Móvil | ✅ | `gsap.matchMedia()` con corte en 768px: sin anclaje, sin suavizado, sin cielo, sin cursor. La rama de móvil **muestra explícitamente** los elementos, porque no animar dejaría puesto el estado que esconde |
| F9 · Contenido decorativo | ✅ | Cielo, cursor y trazo del proceso van con `aria-hidden`. El trazo no dice nada que el orden de los pasos no diga |

## G. Pruebas

| # | Resultado | Evidencia |
|---|---|---|
| G1 | ✅ | 181 pasando, 24 más que en P5 |
| G2 · Lo nuevo que se probó | ✅ | `head-script-source.spec.ts` ejecuta el **texto unido** de los dos scripts del `<head>` — la prueba que faltaba y que habría cachado el bug. `brand-colors.spec.ts` cubre el conversor de color, que es lo único del WebGL que puede equivocarse en silencio |
| G3 · Lo que **no** se probó | ⚠️ | **El shader no tiene pruebas.** No hay forma barata de probar GLSL, y montar WebGL en un entorno de pruebas cuesta más de lo que aporta. Tampoco hay pruebas de las animaciones en sí: se verificaron en el navegador, contra el sitio corriendo, y eso está anotado como lo que es — verificación manual, no automatizada. Playwright sigue pendiente para Pf |

## Lo que Pf tiene que mirar de este paquete

1. **Lighthouse móvil ≥ 90.** Es el techo que fija `CATALOGO-GSAP.md`. Si no da, la
   salida documentada es sacar el WebGL y quedarse con el degradado del CSS: un
   archivo.
2. **Peso del paquete servido.** Medir cuánto pesa realmente el trozo del cielo,
   ahora que está partido en su propio componente de cliente.
3. **El anclaje del proceso con contenido real**, y en pantallas de 768 a 1000px,
   que es la franja donde hay anclaje pero poco alto.
4. **Playwright** para las tres degradaciones (movimiento reducido, sin JS, móvil),
   que hoy están verificadas a mano.
