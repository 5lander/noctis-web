# Spec de animación — Sitio web de Noctis

**Versión** 2.0 · agosto 2026 — reemplaza la 1.0, que pedía lo contrario. El giro
de criterio y su porqué están en [ADR-0013](decisiones/ADR-0013-criterio-de-animacion-expresivo.md).
**Alcance** Capa de movimiento del sitio de productos y trabajos de Noctis
**Base visual** `noctis-v4.html`
**Referencia de terminación** es.squarespace.com (analizada con capturas, agosto 2026)

---

## 1. Criterio general

**El movimiento es parte de lo que el sitio vende. Puede notarse, y debería.**

Este sitio existe para que un dueño de negocio crea que Noctis sabe construir
software. Un sitio que se mueve bien es la demostración más barata que hay de
eso, y por eso el movimiento dejó de ser acompañamiento y pasó a ser argumento.
La referencia es el showcase de GSAP.

Lo que el movimiento **no** puede hacer: estorbar. Nada que retrase la lectura,
esconda contenido, secuestre el scroll ni deje la página inservible si falla.

> La v1 de este documento decía lo contrario —"si el usuario la nota como efecto
> en vez de notarla como fluidez, se descarta"— y prohibía `pin`, `scrub` y
> parallax. Ese criterio se abandonó a pedido del usuario. Queda escrito acá
> porque el código lo contradice a propósito, no por descuido.

Del showcase se extrajo el patrón a replicar:

| Buscado | Parámetro |
|---|---|
| Titulares que entran por líneas, con máscara | `SplitText` `type: 'lines'`, `mask: 'lines'` |
| El scroll con inercia, sin secuestrarlo | `ScrollSmoother`, `smooth: 1.15`, apagado en táctil |
| Una sección que se ancla y cruza | `pin` + `scrub` — **solo en Proceso** |
| Grillas que responden al scroll | onda desde el centro, cortina, inclinación por velocidad |
| Profundidad sin ruido | parallax declarado por elemento, nunca sobre texto que se está leyendo |
| Terminación en el detalle | botón magnético, cursor sobre la grilla, barrido al cambiar de modo |

**Curvas.** `power3.out` para entradas, `power2.inOut` para cambios de estado, `none` para bucles continuos.

**Presupuesto.** Todo el movimiento debe sostener 60 fps en un equipo de gama media. Solo se anima `transform` y `opacity`. Nunca `width`, `height`, `top` o `left`, con la única excepción documentada del acordeón.

---

## 2. Librerías

| Paquete | Uso | Estado |
|---|---|---|
| `gsap` (core) | Motor base | Requerido |
| `ScrollTrigger` | Disparo por scroll | Requerido |
| `SplitText` | Partir titulares en líneas | **En uso** (RA-01) |
| `ScrollSmoother` | Suavizado de scroll | **En uso** (RA-08) |
| `DrawSVGPlugin` | Dibujar el trazo del proceso | **En uso** (RA-12) |
| `Observer` | Registrado, sin uso propio todavía | Disponible |
| `Flip` | Transiciones de layout | No, todavía |
| `three` | El cielo de la portada | **En uso** (RA-07) · [ADR-0014](decisiones/ADR-0014-three-js-para-el-cielo-de-la-portada.md) |

> **Licencia: resuelta.** D15 está cerrado. Webflow liberó GSAP por completo en
> 2025, plugins incluidos y sin restricción de uso comercial, y el paquete de npm
> los trae. Detalle en [ADR-0012](decisiones/ADR-0012-licencia-de-gsap-resuelta.md).
> Todo se sirve **desde el propio dominio**, nunca desde un CDN.

El titular ya no se parte a mano: eso era el rodeo mientras la licencia estaba sin
confirmar. `Hero` volvió a ser HTML plano y el corte lo hace `SplitText`.

---

## 3. Requisitos de implementación

### RA-01 · Entrada de portada
Al cargar, secuencia orquestada en una sola timeline: el titular entra **línea por
línea** desde abajo con máscara de recorte, y luego se encadenan bajada, botones y
etiqueta de ubicación con solapamiento negativo.

- Titular: `yPercent: 105 → 0`, `duration: 1.05`, `stagger: 0.075`
- Cada elemento siguiente arranca ~0.65s antes de que termine el anterior
- El corte por líneas lo hace `SplitText` con `mask: 'lines'`
- Cada línea lleva relleno vertical (`.hero-line` en `animation.css`): la máscara
  recorta a la altura de la caja de línea y una serif de 104px se sale de ella
- **Sin FOUC**: el estado inicial se define en CSS, no en JS

### RA-02 · Revelado por sección
Cada sección tiene una timeline propia disparada al entrar al viewport. Las piezas marcadas con `data-anim` entran en cascada.

- `start: 'top 78%'`, sin `toggleActions` de reversa: entra una vez y se queda
- `stagger: 0.09`

### RA-03 · Marquesina de servicios
Banda de texto en bucle infinito horizontal. La pista se duplica por JS y se anima `xPercent: -50` en bucle, lo que da continuidad perfecta sin salto.

- `duration: 26`, `ease: 'none'`, `repeat: -1`
- **Reactiva al scroll**: al bajar acelera hacia adelante, al subir se invierte, y
  vuelve sola a su ritmo cuando el scroll para. Techo de `timeScale` 5 — sin él,
  un golpe de rueda manda la pista a una velocidad en la que no se lee

### RA-04 · Barra que se esconde
Al bajar se oculta con `yPercent: -100`; al subir vuelve. Umbral de 140px para que no parpadee arriba de todo.

### RA-05 · Acordeón
Apertura y cierre con altura animada (`height: 0 → auto`). Es la excepción autorizada a la regla de no animar propiedades de layout, porque no hay alternativa con `transform`. Se intercepta el click del `summary` para controlar el tiempo.

### RA-06 · Cambio de modo claro/oscuro
**Barrido circular desde el botón**, con la View Transitions API. El navegador
captura el antes y el después; el CSS descubre la captura nueva en círculo desde
el punto donde está el botón, con radio hasta la esquina más lejana.

- Duración 620ms · la animación vive en `animation.css`, no en JS
- Sin soporte de la API, con movimiento reducido o con dos clics seguidos, el modo
  cambia igual y queda la transición de 0.5s del CSS

### RA-07 · Cielo de la portada (WebGL)
Un cuadrilátero a pantalla completa detrás del titular, con nebulosa y polvo de
estrellas en índigo y lavanda: la imagen central del moodboard de marca. Sin
geometría, sin luces, sin texturas — todo sale de la función de fragmento.

- Densidad de píxeles limitada a 1.5 · deja de dibujar fuera del viewport
- Los colores se leen de `tokens.css` y se releen al cambiar de modo
- Sin WebGL, con movimiento reducido o si el paquete no llega: queda el degradado
  de CSS que está debajo, que es el mismo cielo quieto

### RA-08 · Suavizado de scroll
`ScrollSmoother` con `smooth: 1.15`. **No secuestra la rueda**: la página se
desplaza de verdad y el contenido se desfasa con un `transform`, así que la barra
del navegador, el teclado y buscar en la página siguen funcionando. Apagado en
táctil. Los enlaces internos se atienden a mano.

### RA-09 · Botón magnético
El botón principal de la portada —y solo ese— persigue al puntero una fracción de
la distancia y vuelve con rebote al salir. `quickTo`, un tween por propiedad.

### RA-10 · Inclinación por velocidad de scroll
La grilla de trabajos se inclina con la velocidad, con techo de **7 grados**, y se
endereza sola 0.12s después de que el scroll para.

### RA-11 · Grilla de trabajos
Entrada en **onda desde el centro** (`stagger.grid`), con la portada de cada
proyecto descubriéndose por una cortina de `clip-path`. En hover, la portada
escala a 1.04 y aparece la flecha.

- **Pendiente**: cuando existan las capturas reales, evaluar reemplazar el hover por un video en bucle o por un scroll interno de la captura completa del sitio, que es lo que hace toda agencia. Requiere decidir peso de assets.

### RA-12 · Proceso anclado
La sección se queda fija mientras el visitante baja y los pasos entran en orden,
con un trazo SVG que se dibuja uniéndolos (`DrawSVGPlugin`).

- `pin` + `scrub: 1` + `invalidateOnRefresh` — lo último no es opcional: sin eso,
  rotar el teléfono deja el anclaje calculado con la altura vieja
- Solo en escritorio. Es la única sección anclada del sitio

### RA-13 · Parallax por capas
Cada elemento declara su profundidad en `data-parallax`. Se aplica a piezas
decorativas y **nunca** a un bloque de texto que el visitante esté leyendo.

### RA-14 · Cursor sobre la grilla
Un círculo acompaña al puntero y crece sobre las tarjetas de trabajos. **No
reemplaza al cursor del sistema**: lo acompaña. Solo con puntero fino, y no
aparece hasta el primer movimiento.

---

## 4. Accesibilidad y degradación

Tres condiciones que el código ya contempla y que no son negociables:

1. **`prefers-reduced-motion: reduce`** → no se ejecuta ninguna animación y todo el contenido queda visible. Verificado en el CSS y en el JS.
2. **GSAP no carga** (CDN caído, red del cliente bloqueando) → se agrega la clase `sin-anim` al body y todo el contenido queda visible. La página nunca depende de JS para ser legible.
3. **Foco de teclado** visible en todo elemento interactivo, y el acordeón sigue siendo operable con teclado pese a interceptar el click.

**Móvil.** Todo lo de scroll va dentro de `gsap.matchMedia()`. Por debajo de
768px **no hay** anclaje, ni suavizado, ni cielo, ni cursor, ni parallax: los
elementos marcados se muestran de una vez. La entrada de portada y el acordeón se
conservan.

**El corte de móvil no puede ser "no animar".** Si no se anima, el estado inicial
—que esconde— se queda puesto. Por eso la rama de móvil muestra explícitamente.

---

## 5. Fases

**Fase 1 — cerrada en P3.** RA-01 a RA-05 y la degradación completa.

**Fase 2 — cerrada en P3.1.** RA-06 a RA-14: cielo WebGL, suavizado, botón
magnético, inclinación por velocidad, onda y cortina en la grilla, proceso
anclado con trazo, parallax, cursor, marquesina reactiva y barrido de modo. Más
el corte de móvil con `matchMedia` y `SplitText` por líneas.

**Fase 3 — evaluar, no comprometer**
- Transición entre páginas al abrir el detalle de un proyecto (requiere que
  existan páginas de detalle)
- `Flip` para mover una portada de la grilla a su página de detalle
- Video en bucle en las portadas, cuando existan las capturas reales (C1)

---

## 6. Puntos abiertos

| Tema | Decisión pendiente |
|---|---|
| Trabajos reales | Capturas, nombres autorizados y enlaces de los seis proyectos |
| Testimonio | Nombre y cargo reales, o se retira la sección |
| Modo por defecto | ¿Oscuro siempre, o se respeta la preferencia del sistema? Hoy respeta el sistema |
| Persistencia del modo | Requiere `localStorage`, que no funciona en la vista previa actual. Se resuelve al montar en Next.js |
| Destino del formulario | Correo vía Brevo, base de datos, o ambos |
| Presupuesto de rendimiento | `three` pesa. Medir Lighthouse móvil en Pf; si no da 90, sale el WebGL y queda el degradado de CSS ([ADR-0014](decisiones/ADR-0014-three-js-para-el-cielo-de-la-portada.md)) |
| Largo de la página | El anclaje del proceso la alarga. Ver si molesta con contenido real |
