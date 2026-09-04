# PREGUNTAS-ABIERTAS.md — Todo lo que falta que decidas

> Consolidado de lo que hoy está repartido en `DECISIONES.md`, `docs/FASE0-CHECKLIST.md`,
> `ESTADO.md`, `SPEC.md` §11, `ANIMACION.md` §6 y el spec de marca.
> **Este archivo no reemplaza a `DECISIONES.md`**: cuando respondas una, el valor se
> escribe allá y acá queda tachada con la fecha.
>
> Están ordenadas por **qué desbloquean**, no por número. Las primeras tres frenan
> el paquete que sigue; las últimas pueden esperar meses sin costo.
>
> Última actualización: 2026-08-14

---

## Bloque 1 — Frenan P10a, el paquete que sigue

### Q1 · ¿Con qué dirección se pide el borrado de datos?
**Frena:** el aviso de privacidad del formulario · **Origen:** C4, FASE0 A6, `CLAUDE.md` §4

El sitio va a recoger nombre, negocio, correo, WhatsApp y mensaje. La LOPDP exige
aviso visible y una vía real de borrado. **Hoy no hay ni un texto de privacidad en
el proyecto.**

Buena noticia: la minimización sale casi gratis. No hay base de datos, así que el
sistema **no almacena nada** — los datos van en tránsito al correo de Noctis y se
acabó. El aviso puede decirlo con honestidad.

Lo único que no puedo escribir es a dónde escribe alguien que quiere que lo borren.

- [ ] **a)** Dame una casilla (ej. `hola@noctis.ec`) y sale el aviso mínimo en P10a
- [ ] **b)** El endpoint se entrega igual y el aviso queda como bloqueo declarado de publicación

### Q2 · La verificación de tiempo anti-bot, ¿firmada o sin firmar?
**Frena:** P10a · **Origen:** `SPEC.md` §10

- [ ] **a) Sin firmar (recomendada).** Un campo con el instante del render. Filtra bots
      ingenuos, es falsificable por uno que mire el HTML. Quien la falsifique igual
      choca con el límite de 5 envíos cada 10 minutos por origen, que es lo que de
      verdad hace inviable el spam masivo
- [ ] **b) Firmada con HMAC.** Infalsificable, pero agrega un secreto obligatorio en cada
      despliegue: por RN10, si falta, la aplicación no arranca

Cambiar de (a) a (b) más adelante es un archivo. Al revés también.

### Q3 · ¿A qué casilla llega el aviso de un prospecto nuevo?
**Frena:** P10a · **Origen:** nuevo — `MailPort.send` necesita un destinatario y no existe

- [ ] **a)** Esta dirección: `____________`
- [ ] **b)** Todavía no la tengo: poné un valor provisional 🟡 en `config/contact.ts`
      y anotalo como pendiente antes de P12

---

## Bloque 2 — Frenan publicar el sitio

### Q4 · Los precios, ¿entran o se quedan fuera?
**Frena:** publicación · **Origen:** D13, `SPEC.md` §11 · **Hoy:** 🟡 no se muestran

Mencionaste que los tenés desde el principio, así que esta es la que más conviene
cerrar. **Tiene más consecuencias de las que parece:**

- Hay una prueba que hoy **falla si aparece una cifra** en cualquier texto del sitio
  (`content.spec.ts`: sin `$`, sin `usd`, sin `dólares`)
- La pregunta "¿cuánto cuesta?" del acordeón hoy **deriva a proforma**, y hay una
  prueba que lo fija
- RN5 de `CLAUDE.md` dice que **el bot nunca da precios ni plazos cerrados**

Publicar precios en el sitio no obliga a cambiar RN5 (el bot puede seguir derivando),
pero sí obliga a rehacer esas dos pruebas y la respuesta del acordeón.

- [ ] **a)** Se quedan fuera, como hoy
- [ ] **b)** Entran. Pasame la tabla: qué paquetes, qué incluye cada uno, qué cifra
- [ ] **c)** Entran como "desde X", sin cerrar alcance

### Q5 · Los seis trabajos reales
**Frena:** publicar la sección Trabajos · **Origen:** C1, FASE0 B1 · **Hoy:** seis marcadores de posición

De cada uno hace falta: **nombre autorizado por el cliente**, tipo de trabajo, año,
enlace y captura. El componente ya acepta imagen: cuando lleguen, se cambia
`content/works.ts` y no se toca una línea de código.

- [ ] Los tengo · [ ] Tengo algunos (¿cuántos?: ___) · [ ] Ninguno todavía

### Q6 · El testimonio
**Frena:** publicación · **Origen:** C2, FASE0 B2 · **Hoy:** escrito, con el nombre entre corchetes y la sección oculta

El texto ya está: *"Hablo directo con quien programó el sistema. Se pide un cambio y a
los días está."* Falta nombre y cargo reales.

- [ ] **a)** Nombre: `____________` Cargo: `____________`
- [ ] **b)** Se retira la sección

### Q7 · El WhatsApp
**Frena:** publicación · **Origen:** C3, FASE0 B3

Número y **texto previo** del mensaje (lo que aparece ya escrito al abrir el chat).

- [ ] Número: `____________` · Texto previo: `____________`

### Q8 · El mensaje "todo bajo una sola relación"
**Frena:** cumplir el spec de marca · **Origen:** spec de rebrand §6 y §7.5

Es uno de los **cinco activos distintivos no negociables** de la marca, y hoy **no
está en el sitio**. El spec pide que aparezca en la portada o cerca: la idea de web,
automatización, infraestructura y acompañamiento en un solo lugar.

El titular actual es *"Su negocio no cierra a las seis."*, que es bueno y no lo tocaría.
La bajada es donde entra.

- [ ] **a)** Escribo yo una propuesta de bajada y la revisás
- [ ] **b)** Me pasás el texto
- [ ] **c)** Va en otro lado del sitio (¿dónde?: ___)

---

## Bloque 3 — Frenan desplegar

### Q9 · Dominio y hosting
**Frena:** despliegue · **Origen:** D9 🔴, FASE0 A1 y A5

- [ ] Dominio: `____________` · Hosting: `____________`

Afecta al runbook de despliegue y al límite de peticiones: el limitador cuenta **por
instancia**, así que con varias réplicas el límite efectivo se multiplica.

### Q10 · Analítica
**Frena:** nada, pero hay que decidirlo antes de publicar · **Origen:** D10 · **Hoy:** 🟡 ninguna en v1

Si entra alguna, afecta la CSP (hay que abrirle un origen) y el aviso de privacidad.

- [ ] Ninguna, como hoy · [ ] Sí: `____________`

---

## Bloque 4 — Frenan encender servicios reales (P12)

### Q11 · Cuenta de Brevo y dominio de correo
**Origen:** FASE0 A2 · Cuenta creada, y SPF, DKIM y DMARC configurados en el dominio.
Sin esto los correos caen en spam.

### Q12 · Cuenta de calendario
**Origen:** D8 🟡, FASE0 A3 · Hoy dice "cuenta de empresa, no la personal de Lander".
- [ ] Confirmás · [ ] Otra: `____________`

### Q13 · Dónde se hace la reunión
**Origen:** D7 🟡 · **Hoy:** Google Meet generado con el evento
- [ ] Confirmás · [ ] Otra cosa: `____________`

### Q14 · Modelo del bot y tope de gasto
**Origen:** D4 🔴, FASE0 A4 · **Bloquea de verdad.** Qué modelo y qué tope mensual.
El tope es obligatorio antes de encenderlo, con apagado automático.
- [ ] Modelo: `____________` · Tope mensual: `____________`

### Q15 · ¿Se guardan las fichas y conversaciones?
**Origen:** D5 🟡, `SPEC.md` §11 · **Hoy:** todo en memoria, nada persiste

Si decidís persistir, entra PostgreSQL detrás del puerto que ya existe — sin tocar
dominio ni casos de uso. Y cambia el aviso de privacidad de Q1, porque ahí sí
habría almacenamiento y el plazo de 12 meses pasaría a ser código.

- [ ] Solo correo, como hoy · [ ] También base de datos

### Q16 · El guion del bot
**Origen:** FASE0 B5 · Qué dice y qué no dice. Se revisa antes de P8.

---

## Bloque 5 — Valores provisionales que ya corren. Ratificar o corregir

Todos están implementados como configuración versionada: cambiarlos es editar un
archivo, no reescribir código.

| # | Decisión | Valor que corre hoy | Vive en |
|---|---|---|---|
| **Q17** | Horario de reuniones | Lun–vie, 09:00–13:00 y 14:30–17:30 (Guayaquil) | `config/scheduling.ts` |
| **Q18** | Máximo de reuniones por día | 4 | `config/scheduling.ts` |
| **Q19** | Duración · margen · aviso mínimo · ventana | 20 min · 10 min · 12 h · 10 días hábiles | `config/scheduling.ts` |
| **Q20** | Conservación de datos | 12 meses | Hoy no aplica: no se almacena nada |
| **Q21** | Idioma del bot | Solo español | `config/chat.ts` |
| **Q22** | Versión en inglés del sitio | No en v1 | Afecta la arquitectura de rutas |
| **Q23** | Modo por defecto | Respeta el sistema; si no expresa preferencia, oscuro | `components/theme/theme.ts` |

Q17 es la que más conviene mirar: es tu agenda real (FASE0 B4).
Q22 es la única cara de revertir — cambiar de idea después obliga a rehacer las rutas.

---

## Ya cerradas — no hace falta que las respondas

| # | Decisión | Cerrada en |
|---|---|---|
| D12 | Identificadores en inglés, archivos `kebab-case` | ADR-0001 |
| D15 | GSAP es gratuito por completo desde 2025, plugins incluidos | ADR-0012 |
| — | Agendador propio contra calendario real, no un servicio de terceros | `SPEC-AGENDAMIENTO-BOT.md` |
| — | Los imanes valen en la portada **y** en el pie, y en ningún otro lado | Tu decisión, 2026-08-14 |

## Decisiones técnicas tomadas por mí que podés revocar

No te frenan: están andando. Las listo porque revertirlas se encarece con el tiempo.

| Decisión | ADR | Hasta cuándo es barato revertir |
|---|---|---|
| Motor de disponibilidad propio, no compartido con Care | [0002](decisiones/ADR-0002-motor-de-disponibilidad-propio.md) | **Ya se pasó el punto barato**: P5 está construido y P6–P8 se apoyan encima |
| Vitest como runner, no Jest | [0003](decisiones/ADR-0003-vitest-como-runner-de-pruebas.md) | También pasó: hay 186 pruebas escritas |
| CSP con nonce, y por eso render dinámico en todas las rutas | [0004](decisiones/ADR-0004-csp-estricta-con-nonce.md) | Se mide en Pf. Si el LCP no da, la salida es caché de estáticos — **no aflojar la CSP** |
