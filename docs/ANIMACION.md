# Spec de animación — Sitio web de Noctis

**Versión** 1.0 · agosto 2026
**Alcance** Capa de movimiento del sitio de productos y trabajos de Noctis
**Base visual** `noctis-v4.html`
**Referencia de terminación** es.squarespace.com (analizada con capturas, agosto 2026)

---

## 1. Criterio general

La página es minimalista. El movimiento **acompaña la lectura, no compite con ella**. Regla de decisión para cualquier animación que se proponga más adelante: si el usuario la nota como efecto en vez de notarla como fluidez, se descarta.

De las capturas de Squarespace se extrajo el patrón concreto a replicar:

| Observado | Parámetro |
|---|---|
| Los elementos suben de opacidad, casi no se desplazan | `opacity 0→1`, `y` de 12–18px, nunca más |
| Aparecen en cascada dentro del bloque | `stagger` 0.08–0.12s |
| El titular entra antes que su párrafo y sus tarjetas | una timeline por sección, no un trigger por elemento |
| La transición dura claramente más de un segundo | `duration` 0.9–1.2s |
| Nada de parallax ni scroll secuestrado | sin `scrub`, sin `pin` en v1 |

**Curvas.** `power3.out` para entradas, `power2.inOut` para cambios de estado, `none` para bucles continuos.

**Presupuesto.** Todo el movimiento debe sostener 60 fps en un equipo de gama media. Solo se anima `transform` y `opacity`. Nunca `width`, `height`, `top` o `left`, con la única excepción documentada del acordeón.

---

## 2. Librerías

| Paquete | Uso | Estado |
|---|---|---|
| `gsap` (core) | Motor base | Requerido |
| `ScrollTrigger` | Disparo por scroll | Requerido |
| `SplitText` | Partir titulares en líneas | Recomendado |
| `ScrollSmoother` | Suavizado de scroll | Opcional, fase 2 |
| `Flip` | Transiciones de layout | No en v1 |

> **Verificar antes de instalar:** desde 2025 GSAP pasó a ser gratuito incluyendo los plugins que antes eran de Club. Confirmar el estado actual de la licencia y de los términos de uso comercial antes de cerrar el stack, porque de eso depende si `SplitText` y `ScrollSmoother` entran o hay que resolverlos a mano.

En `noctis-v4.html` el titular se parte con una función propia de nueve líneas justamente para no depender de `SplitText` hasta que eso esté confirmado.

---

## 3. Requisitos de implementación

### RA-01 · Entrada de portada
Al cargar, secuencia orquestada en una sola timeline: el titular entra palabra por palabra desde abajo con máscara de recorte, y luego se encadenan bajada, botones y etiqueta de ubicación con solapamiento negativo.

- Titular: `y: 105% → 0`, `duration: 1.05`, `stagger: 0.055`
- Cada elemento siguiente arranca ~0.65s antes de que termine el anterior
- Con `SplitText`: cambiar a división por líneas (`type: "lines"`), que se lee mejor que por palabras en pantallas anchas
- **Sin FOUC**: el estado inicial se define en CSS, no en JS

### RA-02 · Revelado por sección
Cada sección tiene una timeline propia disparada al entrar al viewport. Las piezas marcadas con `data-anim` entran en cascada.

- `start: 'top 78%'`, sin `toggleActions` de reversa: entra una vez y se queda
- `stagger: 0.09`

### RA-03 · Marquesina de servicios
Banda de texto en bucle infinito horizontal. La pista se duplica por JS y se anima `xPercent: -50` en bucle, lo que da continuidad perfecta sin salto.

- `duration: 26`, `ease: 'none'`, `repeat: -1`
- **Pendiente**: pausar al pasar el mouse e invertir el sentido según la dirección del scroll

### RA-04 · Barra que se esconde
Al bajar se oculta con `yPercent: -100`; al subir vuelve. Umbral de 140px para que no parpadee arriba de todo.

### RA-05 · Acordeón
Apertura y cierre con altura animada (`height: 0 → auto`). Es la excepción autorizada a la regla de no animar propiedades de layout, porque no hay alternativa con `transform`. Se intercepta el click del `summary` para controlar el tiempo.

### RA-06 · Cambio de modo claro/oscuro
Hoy se resuelve con `transition` de CSS sobre `background` y `color` en 0.5s. **Pendiente de decidir**: si se quiere una transición más elaborada (por ejemplo un barrido circular desde el botón con la View Transitions API), es un requisito aparte.

### RA-07 · Grilla de trabajos
Entrada en cascada como el resto. En hover, la portada del proyecto escala a 1.04 y aparece la flecha.

- **Pendiente**: cuando existan las capturas reales, evaluar reemplazar el hover por un video en bucle o por un scroll interno de la captura completa del sitio, que es lo que hace toda agencia. Requiere decidir peso de assets.

---

## 4. Accesibilidad y degradación

Tres condiciones que el código ya contempla y que no son negociables:

1. **`prefers-reduced-motion: reduce`** → no se ejecuta ninguna animación y todo el contenido queda visible. Verificado en el CSS y en el JS.
2. **GSAP no carga** (CDN caído, red del cliente bloqueando) → se agrega la clase `sin-anim` al body y todo el contenido queda visible. La página nunca depende de JS para ser legible.
3. **Foco de teclado** visible en todo elemento interactivo, y el acordeón sigue siendo operable con teclado pese a interceptar el click.

**Móvil.** Envolver las animaciones de scroll en `gsap.matchMedia()` y reducir o desactivar en pantallas menores a 768px. La entrada de portada se conserva; el resto se simplifica.

---

## 5. Fases

**Fase 1 — implementada en `noctis-v4.html`**
RA-01 a RA-05, más degradación completa. Es lo que ya se puede ver funcionando.

**Fase 2 — a pedir**
- `SplitText` por líneas en titulares, una vez confirmada la licencia
- `gsap.matchMedia()` para el corte de móvil
- Marquesina reactiva a la dirección del scroll
- Transición elaborada de cambio de modo (RA-06)

**Fase 3 — evaluar, no comprometer**
- `ScrollSmoother` en toda la página. Advertencia: se lleva mal con algunos navegadores móviles y puede sentirse artificial. Probar antes de decidir.
- Cursor personalizado en la grilla de trabajos
- Transición entre páginas al abrir el detalle de un proyecto

---

## 6. Puntos abiertos

| Tema | Decisión pendiente |
|---|---|
| Licencia GSAP | Confirmar términos vigentes para uso comercial |
| Trabajos reales | Capturas, nombres autorizados y enlaces de los seis proyectos |
| Testimonio | Nombre y cargo reales, o se retira la sección |
| Modo por defecto | ¿Oscuro siempre, o se respeta la preferencia del sistema? Hoy respeta el sistema |
| Persistencia del modo | Requiere `localStorage`, que no funciona en la vista previa actual. Se resuelve al montar en Next.js |
| Destino del formulario | Correo vía Brevo, base de datos, o ambos |
| Stack | Propuesta: Next.js reutilizando los tokens del sistema de Commerce |
