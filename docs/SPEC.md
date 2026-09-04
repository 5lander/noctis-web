# SPEC.md — Sitio web de Noctis

**Proyecto** Sitio institucional y de productos de Noctis
**Empresa** Noctis (Meridian Holding) · Guayaquil, Ecuador
**Versión** 1.0 · agosto 2026
**Prototipo de referencia** `noctis-v4.html` (adjunto — es la fuente de verdad visual)
**Documentos complementarios**
- `BUILD.md` — arquitectura, modo demo y orden de construcción · **empezar por acá**
- `SECURITY.md` — capas de seguridad
- `spec-gsap-noctis.md` — animación
- `SPEC-agendamiento-bot.md` — agendamiento y bot

---

## 0. Cómo usar este documento

`noctis-v4.html` es un prototipo funcional de una sola página. Este documento indica cómo llevarlo a producción. **Ante cualquier duda visual, el prototipo manda**: sus valores de color, espaciado y tipografía ya están decididos y no hay que reinventarlos.

Lo que falta y hay que construir: migrar a Next.js, hacer el contenido editable, conectar el formulario, completar la capa de animación y desplegar.

---

## 1. Objetivo

Una página que le permita a un dueño de PYME en Ecuador entender en menos de un minuto qué vende Noctis, ver que hay trabajo real hecho, y escribir.

**Acción principal:** enviar el formulario de contacto o escribir por WhatsApp.
**Público:** dueño o gerente de negocio pequeño o mediano. No es perfil técnico. Trato de "usted".
**No es:** un sitio para desarrolladores, ni un catálogo de tecnologías.

---

## 2. Stack

| Capa | Decisión | Razón |
|---|---|---|
| Framework | Next.js (App Router), versión LTS más reciente | Coherente con el resto de los proyectos |
| Lenguaje | TypeScript en modo estricto | |
| Estilos | CSS con variables nativas, siguiendo los tokens del prototipo | Los tokens se comparten con Commerce y Care |
| Animación | GSAP + ScrollTrigger | Ver sección 7 |
| Contenido | Archivos de datos tipados en el repo (`content/`) | Sin CMS en v1; se evalúa después |
| Formulario | Route Handler + Brevo | Brevo ya se usa en Commerce |
| Agendamiento | Google Calendar API, servidor | Reutilizar el motor de Care — ver `SPEC-agendamiento-bot.md` |
| Despliegue | A definir — ver sección 11 | |

**Restricciones de código:** clean architecture donde aplique, componentes reutilizables, sin dependencias innecesarias. Es una página de marketing: no sobre-arquitecturar.

---

## 3. Estructura del proyecto

```
src/
  app/
    layout.tsx           # fuentes, metadata, data-mode inicial
    page.tsx             # composición de secciones
    api/contacto/route.ts
  components/
    layout/              Barra, Pie, CambioModo
    secciones/           Portada, Marquesina, Productos, Trabajos,
                         Servicios, Proceso, Cita, Preguntas, Contacto
    ui/                  Boton, Campo, Acordeon, Etiqueta, Estado
  lib/
    animaciones/         gsap.ts, useRevelado.ts, usePortada.ts
    contenido/           tipos.ts
  styles/
    tokens.css           # variables de los dos modos
    base.css
content/
  productos.ts  servicios.ts  trabajos.ts  preguntas.ts  proceso.ts
```

**Regla:** ningún texto de cara al usuario vive dentro de un componente. Todo sale de `content/`, tipado. Así el contenido se actualiza sin tocar JSX.

---

## 4. Sistema de diseño

### 4.1 Tokens

Un solo juego de variables, dos modos, conmutados por `data-mode` en `<html>`. **Idéntico al sistema de Commerce**, para que los tres proyectos compartan capa visual.

```css
html[data-mode="dark"] {
  --fondo: #0B0B0D;   --fondo-2: #131316;
  --texto: #F5F5F4;   --texto-2: #96969E;  --texto-3: #63636B;
  --linea: rgba(255,255,255,.13);
  --inv-fondo: #F5F5F4; --inv-texto: #0B0B0D;
}
html[data-mode="light"] {
  --fondo: #FFFFFF;   --fondo-2: #F3F3F1;
  --texto: #0B0B0D;   --texto-2: #6C6C74;  --texto-3: #9A9AA2;
  --linea: rgba(0,0,0,.13);
  --inv-fondo: #0B0B0D; --inv-texto: #F5F5F4;
}
```

**Paleta monocroma, sin colores de acento.** El interés visual sale del contraste, el tamaño tipográfico y el aire. No agregar colores de marca sin aprobación explícita.

**Franjas invertidas.** La clase `.inv` hace que una sección use el esquema contrario al modo activo. En el prototipo la usan Servicios y Contacto. Ver la implementación exacta en el CSS del prototipo, incluidos los sobrescritos anidados de `--texto-2`, `--texto-3` y `--linea` — es la parte fácil de romper.

### 4.2 Tipografía

- **Display:** Inter Tight — pesos 400, 500, 600. Titulares, nombres de producto, botones, etiquetas.
- **Texto:** Inter — pesos 400, 500. Párrafos y campos.
- Tracking negativo en titulares (`-.035em`), positivo en etiquetas en versalitas (`.18em`).
- Cargar con `next/font` y `display: swap`. Solo los pesos listados.

### 4.3 Modo por defecto

Respeta `prefers-color-scheme` en la primera visita. **Requiere script inline en `<head>`** que fije `data-mode` antes de pintar, o habrá parpadeo. Después de que el usuario elija, se persiste en `localStorage` (el prototipo no lo hace porque la vista previa no lo permite).

---

## 5. Contenido

### 5.1 Productos — tres, con su estado real

| Producto | Estado | Para quién |
|---|---|---|
| Noctis Commerce | En desarrollo | Tiendas y distribuidoras que ya no alcanzan con cuaderno y Excel |
| Care | En pruebas | Consultorios independientes con agenda en papel |
| Automatización | **Disponible** | Negocios con más mensajes de los que pueden contestar |

> **Eran cuatro.** «Reclutamiento por chat» salió del catálogo el 2 de septiembre de 2026 por decisión del usuario: es un proyecto aparte y no uno de los productos que esta página vende. El ámbito («Comercio», «Salud», «Ventas») también se retiró: era un rótulo más de los diecisiete que hacían que la página se leyera como plantilla.

Los textos ya no se copian del prototipo. Se reescribieron en la pasada del 3 de septiembre de 2026 con una regla: **lo que el dueño deja de hacer, no lo que el sistema tiene.** «Inventario por bodega con aviso de mínimos» describe cómo está construido; «le avisa antes de que se acabe» describe lo que le pasa a él. La fuente de verdad es `src/content/products.ts`.

> **No mencionar facturación electrónica SRI en ninguna parte del sitio.** Todavía no está disponible. Se agrega cuando exista.

### 5.2 Servicios — seis

Página web nueva · CRM sencillo · Rediseño de páginas web · Automatizaciones · Infraestructura · Acompañamiento

> **Eran cinco y faltaba el principal.** «Página web nueva» entró el 3 de septiembre de 2026. Era la incoherencia más cara del sitio: la banda de cifras cuenta seis páginas entregadas, la marquesina abre con «Páginas web», los dos trabajos publicados son páginas y el formulario ofrece «Página web nueva o rediseño», pero la lista de servicios solo vendía mejorar una existente. Lo que más se enseñaba no estaba a la venta. «Mejora» pasó a «Rediseño», que es la palabra que escribe quien busca.

> **No ofrecer desarrollo a medida como servicio abierto, ni integraciones.** Quedaron fuera del alcance comercial y `content.spec.ts` lo vigila sobre `SERVICES`.
>
> **Esto no contradice el titular de la portada**, y conviene dejarlo escrito porque parece que sí. El titular dice «Software hecho a la medida de cómo trabaja su negocio», y eso es una afirmación sobre **cómo se construye**, no un servicio que se pueda encargar. Los seis servicios se entregan ajustados al cliente —la página con el lenguaje visual que le sirva, el CRM sin campos que nadie llena, la automatización montada sobre el número que ya tiene, y el proceso empieza mirando cómo trabaja hoy—. Lo que sigue fuera de alcance es el encargo abierto: «constrúyanme un sistema desde cero para lo que se me ocurra». La diferencia es entre un método y un catálogo, y la lista de servicios es el catálogo.

### 5.3 Trabajos

**Ya no son contenido escrito a mano ni marcadores de posición.** Los trabajos viven en SQLite detrás de un puerto y se cargan desde `/admin` ([ADR-0015](decisiones/ADR-0015-portafolio-en-sqlite-sin-orm.md)): agregar uno no toca una línea de código. `content/works.ts` se borró.

Cada trabajo se enseña de una de tres formas, en este orden: **recorrido en vídeo** de la página entregada, portada fija, o portada tipográfica. La última es el respaldo, para que un trabajo real cuya captura no esté lista se publique igual y se vea como pieza y no como imagen rota.

**Si no hay ninguno publicado, la sección no se pinta**, y su enlace del menú tampoco: un ancla hacia un `id` que no está en el documento no lleva a ninguna parte. Dejó de ser un bloqueo de publicación.

Hoy hay dos publicados, Care y Burnout. Se entregaron catorce proyectos en total; casi todos los clientes pidieron no salir publicados, así que la banda de cifras cuenta más de lo que el portafolio enseña.

### 5.4 Textos con marcador de posición

Eran tres. Queda uno:

- **Testimonio:** `[Nombre del cliente]` y su cargo. Sigue pendiente (C2). `QUOTE.pending` está en `true` y con eso la sección **no se pinta**: publicar un testimonio con corchetes es peor que no tener testimonio.
- ~~Enlace de WhatsApp~~ · Cerrado el 3 de septiembre de 2026. Número y texto previo en `content/site.ts`, con botón flotante propio.
- ~~Enlace para agendar llamada~~ · No es un marcador pendiente: llega con el agendador, que es P6 y P7. Mientras tanto la acción de la portada es el formulario, y eso es deliberado.

La regla que los gobernaba no cambia y vale para lo que venga: **ningún texto de cara al usuario se publica con un corchete adentro.** El componente omite la línea vacía en vez de pintar el marcador.

---

## 6. Secciones

Orden exacto del prototipo:

1. **Barra** — fija, con logo, navegación, botón de modo y CTA. Se esconde al bajar.
2. **Portada** — titular grande, bajada, dos botones, registro nocturno animado.
3. **Marquesina** — banda de servicios en bucle.
4. **Productos** — cuatro filas.
5. **Trabajos** — grilla de seis.
6. **Servicios** — cinco, en franja invertida.
7. **Proceso** — tres pasos.
8. **Cita** — testimonio centrado.
9. **Preguntas** — acordeón de cuatro.
10. **Contacto** — formulario, en franja invertida.
11. **Pie** — repite el titular de portada como cierre.

---

## 7. Animación

**Documento aparte: `spec-gsap-noctis.md`.** Contiene los siete requisitos numerados (RA-01 a RA-07), los parámetros exactos extraídos del análisis de Squarespace, y las tres fases.

Resumen de lo que ya está implementado en el prototipo y hay que portar:
- RA-01 Entrada de portada con titular partido y máscara
- RA-02 Revelado en cascada por sección
- RA-03 Marquesina en bucle
- RA-04 Barra que se esconde
- RA-05 Acordeón con altura animada

**Al portar a React:** las animaciones van dentro de `useGSAP()` o de un `useLayoutEffect` con `gsap.context()` y su limpieza correspondiente. Sin eso, la navegación del App Router deja triggers huérfanos.

**Verificar la licencia de GSAP antes de instalar plugins.** Cambió en 2025 y de eso depende si SplitText y ScrollSmoother entran o se resuelven a mano.

---

## 8. Accesibilidad

No negociable, ya contemplado en el prototipo:

1. `prefers-reduced-motion: reduce` desactiva todo el movimiento y deja el contenido visible.
2. Si GSAP no carga, la clase `sin-anim` deja todo visible. **La página nunca depende de JS para leerse.**
3. Foco de teclado visible en todo elemento interactivo.
4. El acordeón sigue operable con teclado pese a interceptar el click del `summary`.
5. Contraste mínimo AA en ambos modos. Verificar especialmente `--texto-2` sobre `--fondo-2`.
6. Un solo `<h1>` por página, jerarquía de encabezados correcta.
7. El botón de modo tiene `aria-label`; el registro nocturno es decorativo y va con `aria-hidden`.

---

## 9. Rendimiento

| Métrica | Objetivo |
|---|---|
| Lighthouse rendimiento | ≥ 90 en móvil |
| LCP | < 2.5s |
| CLS | < 0.1 — cuidado con las fuentes y con los estados iniciales de animación |
| JS enviado | < 150KB comprimido, GSAP incluido |

Solo se anima `transform` y `opacity`. La única excepción autorizada es la altura del acordeón.
Imágenes de trabajos con `next/image`, formato moderno, carga diferida salvo las dos primeras.

---

## 10. Formulario

Campos: nombre (requerido), negocio, correo (requerido), WhatsApp, interés (select), mensaje.

**Construido en P10.** El contrato completo está en
[`apis/contacto.md`](apis/contacto.md); acá queda lo que decide el producto.

- Validación en cliente y **también en servidor**. La del servidor manda
- Route Handler con dos badenes anti-automatización: campo trampa y control de
  prisa. El instante de partida lo sella el servidor al pintar, no un guion, para
  que la comprobación siga valiendo sin JavaScript
- Límite de peticiones por origen: cinco cada quince minutos
- Confirmación en pantalla sin recargar, **y también sin JavaScript** — ahí la
  ruta redirige a la portada con el resultado en la URL
- Envío por Brevo (API v3, no SMTP). Hoy detrás de `MailPort` con adaptador
  simulado; el real se conecta en P12 sin tocar el dominio ni la ruta
- **Resuelto:** solo correo. No se guarda en base de datos. La ficha vive lo que
  vive el correo, que es lo que pide la minimización de la LOPDP; el día que
  haga falta un historial, se agrega un adaptador detrás del mismo puerto

---

## 11. Puntos abiertos

Hay que resolverlos antes o durante la implementación:

| Tema | Pendiente |
|---|---|
| Licencia GSAP | Confirmar términos vigentes para uso comercial |
| Trabajos reales | Capturas, nombres autorizados, enlaces |
| Testimonio | Nombre y cargo reales, o se retira la sección |
| WhatsApp | Número y texto previo del mensaje |
| Agendar llamada | Resuelto: agendador propio contra calendario real. Ver `SPEC-agendamiento-bot.md` |
| ~~Formulario~~ | Resuelto en P10: solo correo, sin base de datos |
| Dominio y hosting | Dónde se despliega |
| Analítica | ¿Se instala algo? Cuál |
| Inglés | ¿Hace falta versión en inglés? Afecta la arquitectura de rutas |
| Precios | Hoy no aparecen. ¿Se mantienen fuera? |

---

## 12. Fases

**Fase 1 — base**
Proyecto Next.js, tokens, fuentes, cambio de modo sin parpadeo, todas las secciones estáticas con el contenido real. Sin animación.
*Criterio de aceptación:* la página se ve idéntica al prototipo en ambos modos, sin JS de animación.

**Fase 2 — movimiento**
RA-01 a RA-05 portados a React con `gsap.context()` y limpieza. Degradación verificada.
*Criterio de aceptación:* se comporta igual que el prototipo, y con movimiento reducido activado todo sigue visible y legible.

**Fase 3 — formulario**
Route Handler, Brevo, validación en servidor, anti-spam.
*Criterio de aceptación:* llega un correo de prueba y los envíos malformados se rechazan.

**Fase 4 — cierre**
Metadata y Open Graph, sitemap, favicon, contenido real de trabajos, Lighthouse ≥ 90, despliegue.

**Fase 5 — agendamiento** · ver `SPEC-agendamiento-bot.md`, pieza A
Disponibilidad real contra el calendario y reserva de reuniones, reutilizando el motor de Care.

**Fase 6 — bot** · ver `SPEC-agendamiento-bot.md`, pieza B
Asistente conversacional que agenda o envía la ficha del prospecto por correo. Con límites de uso y presupuesto desde el primer commit.

---

## 13. Lo que no se hace en v1

Para que no se cuele por el camino:

- Blog o sección de recursos con artículos reales
- CMS
- Precios públicos
- Versión en inglés
- ScrollSmoother — evaluar en fase posterior; se lleva mal con varios navegadores móviles
- Páginas de detalle por producto o por proyecto
- Cursor personalizado, transiciones entre páginas

**Nota sobre alcance:** el agendamiento y el bot sí entran en la primera entrega, pero contra adaptadores simulados (ver `BUILD.md`). Lo que queda fuera de v1 es la conexión de los servicios reales, que se hace uno por uno y después.
