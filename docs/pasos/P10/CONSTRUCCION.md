# P10 — Documento de construcción

## Resumen

| Campo | Valor |
|---|---|
| Paquete | P10 — Formulario de contacto y cierre público |
| Fecha inicio / fin | 2026-09-04 / 2026-09-04 |
| Decisiones implementadas | D5 cerrado (solo correo, sin base de datos) |
| Estado | ✅ completado |

## Objetivo del paquete

Cerrar los tres huecos que quedaban entre el sitio y alguien que quiere
contratar: el formulario no enviaba, el enlace compartido no tenía tarjeta y una
dirección equivocada caía en una pantalla que no era de Noctis.

**Aceptación:** los envíos malformados se rechazan · el formulario confirma en
pantalla sin recargar **y también sin JavaScript** · el enlace compartido muestra
imagen · el 404 es del sitio.

## Qué se construyó

### El módulo `lead`, completo por primera vez

| Archivo | Capa | Qué resuelve |
|---|---|---|
| `domain/lead.ts` | dominio | La ficha, sus topes y **RN7** |
| `application/contact-submission.ts` | aplicación | De cuerpo HTTP a veredicto, con los dos badenes anti-robots |
| `application/notify-lead.ts` | aplicación | El caso de uso y el cuerpo del aviso |
| `app/api/contacto/route.ts` | infraestructura | Límite, tamaño, forma de la respuesta |
| `components/sections/contact-form.tsx` | interfaz | Los cuatro estados del envío |

El dominio no importa nada: ni zod, ni Node, ni React. Por eso `lead.spec.ts`
corre sin servidor y sin cuenta de correo, que es la misma prueba de arquitectura
que se le exigió al motor de disponibilidad en P5.

### RN7 tiene función propia y prueba propia

`hasValidContact` es la regla escrita una vez: se acepta con correo bien formado
**o** con un número de al menos siete dígitos. No es validación de formulario, es
la regla que decide si se manda un correo — y de ella depende que la bandeja siga
siendo útil. Una bandeja con un aviso por cada curioso se deja de mirar, y el día
que se deja de mirar el módulo está muerto aunque funcione.

### Los dos badenes, y lo que honestamente valen

- **La trampa** es un campo que nadie ve. Se esconde sacándolo del lienzo y no
  con `display: none`: un robot que valga algo salta lo declarado invisible.
- **La prisa** es el tiempo entre que el servidor pintó el formulario y el envío.
  Menos de tres segundos no lo escribió una persona.

**El instante de partida lo sella el servidor**, no un guion en el navegador. Esa
decisión es lo que hace que la comprobación siga valiendo sin JavaScript: con un
guion que midiera el tiempo, quien lo tuviera apagado quedaría marcado como robot
en cada envío.

Ninguno de los dos es infalible y el código lo dice: los dos viajan por el
cliente y se pueden falsear. Son badenes. El muro es el límite por origen —cinco
envíos cada quince minutos—, que no depende de nada que mande el navegador.

**Un envío que huele a robot recibe `200`.** Decirle que se le detectó la trampa
es regalarle el dato que necesita para ajustarla.

### Funciona sin JavaScript, y no por casualidad

El `<form>` conserva su `action` y su `method`. Si el guion no llega, el navegador
envía por su cuenta y la ruta contesta `303` hacia `/?enviado=si#contacto`; la
portada lee ese parámetro y pinta el mismo mensaje. Lo que agrega el JavaScript
es no recargar, que es comodidad, no funcionamiento.

### La tarjeta social

`src/app/opengraph-image.jpg`, 1200×630, generada por `npm run og:generar`.

**No es un `opengraph-image.tsx`**, que sería la forma idiomática, por las
fuentes: el renderizador de Next no lee WOFF2 y es el único formato en el que el
proyecto tiene Source Serif e Inter. La tarjeta habría salido con una tipografía
que no es la de la marca. El guion la pinta con el mismo navegador que pinta el
sitio, y **lee el texto de `content/`**: si no encuentra el titular, se cae en vez
de inventarlo.

**`opengraph-image.alt.txt` está puesto y hoy no se emite.** El archivo es
correcto y es la convención documentada, pero en Next 16.3.1 con Turbopack el
`alt` no llega a la etiqueta: el compilador convierte el `.txt` en un módulo
suelto en vez de plegarlo en los metadatos de la imagen. Se deja escrito para que
funcione solo cuando lo soporten, y se anota acá para que nadie lo dé por hecho.
Ningún canal que importa lo usa —WhatsApp no lo lee—, así que no se compensa con
un `openGraph.images` a mano, que duplicaría la etiqueta de la imagen.

### El 404

`app/not-found.tsx` atiende toda dirección que no resuelve, no solo `notFound()`.
Va sin barra de navegación a propósito: los enlaces del menú son anclas a
secciones de la portada y desde acá ninguna existe en el documento.

## Tres fallos que encontró la verificación en navegador

Ninguno se veía leyendo el código.

### 1. El `IntersectionObserver` de los recorridos nunca funcionó

La página usa ScrollSmoother, que no desplaza el contenido sino que lo mueve con
un `transform` sobre `#smooth-content`. **Un observador de intersección no mira
las transformaciones de un ancestro.** Se comprobó poniendo un observador propio
sobre el mismo vídeo: avisó una sola vez al crearse y siguió callado mientras el
elemento pasaba de +2974 px a −9203 px. El recorrido seguía andando a nueve mil
píxeles de la vista.

Se reemplazó por una comprobación colgada de `timeupdate`, que el propio vídeo
dispara mientras se reproduce: ve el movimiento por transformación, porque
`getBoundingClientRect` sí lo refleja, y no cuesta nada cuando no hay nada
andando.

**Regla general para este proyecto: `IntersectionObserver` no sirve dentro del
envoltorio de ScrollSmoother.** Lo que sí sirve es ScrollTrigger, o una
comprobación de rectángulo colgada de un evento que ya exista.

### 2. La confirmación del envío era invisible

Llevaba `data-anim`. La capa de animación deja esos elementos en opacidad cero
hasta que su disparador los revela al pasar por pantalla, y este nace **después**
de que el disparador ya corrió: quedaba en el documento, anunciado por el lector
de pantalla, y sin pintar.

**Nada que aparezca por una acción del usuario puede llevar `data-anim`.**

### 3. La bandeja simulada mostraba una bandeja distinta

En desarrollo Next arma dos grafos de módulos —uno para rutas de API y otro para
páginas—, así que `service-registry` se evalúa dos veces y salen dos `FakeMail`.
El correo caía en una lista y `/dev/bandeja` mostraba la otra, siempre vacía. La
bandeja pasó a colgar de `Symbol.for`, que devuelve el mismo símbolo en cualquier
grafo del proceso.

## Qué quedó fuera

- **Brevo real.** Sigue detrás de `MailPort` con el adaptador simulado; se conecta
  en P12 sin tocar el dominio ni la ruta.
- **Analítica** (D10). Sin ella no hay forma de saber si los textos nuevos mueven
  algo.
- **Guardar la ficha.** D5 se cierra en «solo correo»: la ficha vive lo que vive
  el correo, que es lo que pide la minimización de la LOPDP.

## Verificación

Contra el servidor de desarrollo, con Playwright:

| Caso | Resultado |
|---|---|
| Envío válido | `200 {"estado":"recibido"}` y el correo aparece entero en `/dev/bandeja` |
| Envío instantáneo | `200`, sin correo |
| Trampa llena | `200`, sin correo |
| Sin nombre | `400 envio_invalido` |
| Sin canal de contacto (RN7) | `400 envio_invalido` |
| Mensaje de 40 000 caracteres | `413` |
| Sin `accept: application/json` | `303 → /?enviado=si#contacto` |
| Siete envíos seguidos del mismo origen | `200 200 200 200 200 429 429` |
| Formulario en pantalla | «Listo, ya llegó. Le contestamos el mismo día hábil.» |
| Dirección inexistente | `404` con la pantalla del sitio |
| Recorrido al salir de pantalla | pausado y rebobinado a cero |

223 pruebas en verde · `npm run audit:fast` en verde.
