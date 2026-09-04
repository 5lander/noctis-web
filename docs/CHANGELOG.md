# CHANGELOG

Una entrada por commit de paquete. Formato: qué se construyó, qué quedó fuera, qué decisión se tomó.

## [Sin publicar]

### Favicon legible en pestaña oscura · 2026-09-04

`src/app/icon.svg` era el archivo del paquete de marca en su versión para fondo
claro: la luna no estaba recortada, estaba **tapada con un círculo opaco
`#FAFAFA`**. Eso funciona sobre una página blanca, pero un favicon vive en la
barra de pestañas del navegador, cuyo fondo no decidimos: en pestaña oscura la
tapa se veía como un disco blanco encima de la luna.

Ahora el mordisco se recorta con una máscara, así que es hueco de verdad y el
icono sirve sobre cualquier fondo. **Ni un centro ni un radio cambian** respecto
al archivo de marca; lo único distinto es cómo se produce el vacío. El trazo pasa
al `#818CF8` de la variante oscura del logotipo, que es la única de las dos
tintas oficiales legible sobre los dos fondos.

### P10 — Formulario de contacto y cierre público · 2026-09-04

**Qué se construyó**

- **`POST /api/contacto` existe.** El formulario apuntaba ahí desde P2 y ahí no
  había nada: la vía principal de conversión devolvía 404. Ahora el módulo `lead`
  está completo —dominio, caso de uso y ruta—, y el dominio se prueba sin
  servidor y sin cuenta de correo, igual que el motor de disponibilidad.
- **RN7 escrita una vez.** `hasValidContact` decide si se manda el aviso: correo
  bien formado **o** número de al menos siete dígitos. Sin ninguno de los dos no
  hay correo, porque una bandeja con un aviso por cada curioso se deja de mirar.
- **Dos badenes anti-automatización.** Un campo trampa que nadie ve, y un control
  de prisa cuyo instante de partida **lo sella el servidor al pintar**, no un
  guion: por eso la comprobación sigue valiendo sin JavaScript. Un envío que huele
  a robot recibe `200` igual que uno bueno; solo uno de los dos genera correo.
- **El formulario funciona sin JavaScript.** El `<form>` conserva `action` y
  `method`; sin guion, la ruta contesta `303` a `/?enviado=si#contacto` y la
  portada pinta el mismo mensaje.
- **Tarjeta social.** `opengraph-image.jpg` a 1200×630, generada por
  `npm run og:generar`, que **lee el titular de `content/`** y se cae si no lo
  encuentra en vez de inventarlo. Hasta hoy el enlace compartido por WhatsApp
  llegaba como texto pelado.
- **Página 404 del sitio.** Antes salía la de Next: fondo claro, tipografía del
  sistema y en inglés, en un sitio de un solo esquema oscuro.
- **Burnout enlaza a `https://burnout.ec`**, que ya está en línea.

**Tres fallos que solo aparecieron verificando en navegador**

- **El `IntersectionObserver` de los recorridos nunca funcionó.** ScrollSmoother
  mueve el contenido con `transform` y un observador de intersección no mira las
  transformaciones de un ancestro: se comprobó con uno propio, que avisó una vez
  al crearse y siguió callado mientras el vídeo pasaba de +2974 px a −9203 px. El
  recorrido seguía andando fuera de pantalla. Se cambió por una comprobación
  colgada de `timeupdate`, que además rebobina — un recorrido que quedó congelado
  a mitad de página se lee como que arrancó solo.
- **La confirmación del envío era invisible.** Llevaba `data-anim` y nacía después
  de que su disparador ya había corrido.
- **La bandeja simulada mostraba otra bandeja.** En desarrollo Next evalúa el
  registro de servicios dos veces, así que había dos `FakeMail`.

**Qué quedó fuera**

- Brevo real (P12), analítica (D10) y el testimonio (C2).

**Decisiones**

- **D5 cerrado: solo correo, sin base de datos.** La ficha vive lo que vive el
  aviso. El día que haga falta historial, se agrega un adaptador detrás del mismo
  puerto.

### Pendientes de P11.2 cerrados · 2026-09-03

**Qué se construyó**

- **Cero violaciones de CSP en producción** (hallazgo 14). Eran cuarenta en
  desarrollo y el diagnóstico las dio por un solo problema; medidas con
  `securitypolicyviolation` resultaron ser dos. Treinta y tres son del overlay de
  Next y no existen fuera de desarrollo. Las siete reales eran el
  `style="color:transparent"` que `next/image` pone en cada imagen, bloqueado
  porque los nonces no aplican a atributos. Se admite por su hash exacto en una
  directiva `style-src-attr` propia, que es **más restrictivo que no declararla**:
  sin ella los atributos heredan `style-src` entero; con ella, lo único admitido
  en todo el sitio es la cadena `color:transparent`.
- **El ritmo vertical deja de ser una sola cifra repetida** (hallazgo 12). Las
  siete secciones llevaban 118 px arriba y abajo, así que entre dos consecutivas
  quedaban 236 px: más de un cuarto de un visor de 900 px, siete veces. Ahora hay
  dos tokens con criterio: `--ritmo` es el hueco **entre** secciones y se reparte
  a la mitad, y `--ritmo-banda` es el aire **dentro** de una franja con fondo
  propio. El hueco entre secciones baja de 236 px a 148 px y la franja de cierre
  pasa a leerse como el momento distinto que es.
- **`SPEC.md` §5.3 y §5.4 al día.** §5.3 describía seis marcadores de posición y
  mandaba a `content/works.ts`, que se borró hace dos paquetes: los trabajos
  viven en SQLite y se cargan desde `/admin`. De §5.4 quedan tres marcadores en
  uno: solo el testimonio sigue pendiente.
- **`PREGUNTAS-ABIERTAS.md` repasado.** Llevaba tres semanas sin tocarse y daba
  por abiertas cinco cosas ya cerradas, mandando a dos archivos borrados. Las
  respondidas quedan tachadas con su fecha en vez de desaparecer.

**Qué se decidió**

- **La auditoría de prohibidos tenía razón y se reescribió el comentario, no la
  regla.** Una nota nueva contenía la cadena `eslint` + `-disable` explicando por
  qué no se usa, y el grep la marcó. Aflojar el patrón para admitir menciones en
  comentarios habría abierto la puerta a la supresión real: la frase se reescribió.
- **El hash del estilo no se exporta.** La prueba lo recalcula desde
  `color:transparent` y comprueba que la política lo contenga, que es más fuerte
  que comparar dos constantes escritas a mano y no añade superficie que knip
  tenga que juzgar.

**Qué quedó fuera**

- **`knip` no se pudo correr**, ni antes ni después. El parser de `oxc` falla al
  reservar su buffer con 1,4 GB libres de 15 en la máquina. Es memoria, no
  código: el diff no añade ni un `export`.



### P11.2 y P11.3 — Pase visual, esquema único y textos · 2026-09-02 y 03 · **fuera de la numeración**

> Van en una sola entrada porque van en un solo commit. El árbol de trabajo tenía
> P11, P11.2 y P11.3 sin commitear a la vez, y los tres tocan los mismos
> archivos: `site-copy.ts` lleva a la vez el pase visual y la pasada de textos, y
> no hay forma de separarlos por archivo sin inventar una historia que no ocurrió.
> Se prefiere un commit grande y honesto a cuatro commits reconstruidos a mano.

**Qué se construyó**

- **Pasada de textos completa** (`content/`), con la auditoría de copia del 2 de
  septiembre aplicada. Titular que por fin nombra las dos cosas que Noctis vende
  y no solo la automatización, conservando «horas» y «ventas» que la prueba
  exige. Bajada que dice de dónde son y qué hacen, en 17 palabras. «Conversemos»
  pasa a «Pedir propuesta» con una línea que promete respuesta el mismo día
  hábil. Los doce puntos de producto reescritos por lo que el dueño deja de
  hacer, no por lo que el sistema tiene. Encabezado de Trabajos que cambia el
  tema de cuántos a cuánto se enseña.
- **Servicios pasa de cinco a seis: entra «Página web nueva».** Era lo más raro
  que tenía el sitio, y no era de redacción: lo que más se enseñaba —seis páginas
  en la banda, dos en el portafolio, «Páginas web» en la marquesina— no estaba a
  la venta en la lista de servicios. «Mejora» pasa a «Rediseño», que es la
  palabra que escribe quien busca.
- **Preguntas pasa de cuatro a siete.** Las cuatro que había contestaban
  objeciones técnicas; las nuevas contestan las humanas, que son las que frenan a
  un dueño de PYME: quiénes son, si un negocio chico les interesa, si atienden
  fuera de Loja.
- **El sitio deja de ser anónimo.** Razón social, RUC, dirección, correo,
  WhatsApp y horario en el pie, desde `content/site.ts`. Era el freno más caro
  que tenía: una empresa de software que vende a distancia y no dice quién es se
  parece demasiado a nadie.
- **El número de WhatsApp sale de las variables de entorno** y pasa a
  `content/site.ts`, con su mensaje precargado. `WHATSAPP_NUMERO` existía porque
  el dato era C3 y no se podía incrustar; confirmado el dato, un número que se
  pinta en un botón visible es contenido y no configuración. Con eso se va el
  caso de «no hay número», que ya no puede darse.
- **Corregido un texto que mandaba a mirar donde no había nada**: el apoyo de
  Lenguajes decía que Burnout estaba «aquí abajo» y Burnout está en Trabajos, que
  va antes.
- Los catorce hallazgos del diagnóstico visual del 2 de septiembre
  (`docs/auditoria-ux/diagnostico-visual-2026-09-02.html`), cerrados en siete
  palancas. Lo medido sobre la página servida: la portada baja de 1011 px a
  570 px y entra en el visor, el titular de cuatro líneas a dos, la bajada de 32
  palabras a 20, los rótulos en versalita de 17 a 1, las imágenes de 0 a 6, las
  escalas de radio de 4 a 3 con regla escrita, y las inversiones de tema de 2 a 1.
- **El registro nocturno salió de la portada** a su propia banda. La portada
  llevaba seis bloques y no cabía; ningún ajuste de márgenes arregla eso.
- **Dos destinos rotos, cerrados.** `/privacidad` existe —el pie lo enlazaba
  desde P11 y daba 404, con un formulario que pide nombre, correo y WhatsApp— y
  el botón «Ver trabajos» de la portada ahora se filtra con la misma condición
  que ya filtraba el enlace del menú.
- **La barra voltea sobre la franja invertida**, con su vidrio, su texto y su
  logotipo. Fuera de la capa de animación, porque tiene que funcionar también con
  movimiento reducido y en móvil.
- **El foco de teclado vuelve al formulario.** `field.module.css` lo apagaba con
  `outline: none` en el único sitio del sitio donde alguien escribe.
- **El catálogo real.** Fuera «Reclutamiento por chat», que es un proyecto aparte
  y no un producto de esta página: quedan tres. Care enlaza a su sitio vivo en
  `care.noctisdev.online`, y el nombre del producto **es** el enlace.
- **Burnout, el primer trabajo del portafolio**, con captura real del sitio y por
  el camino normal: una fila en la base, la misma que llena el panel. La rejilla
  de trabajos ahora se adapta al número de piezas publicadas.
- **Recorridos en vídeo a 1920×1200.** Cada trabajo puede llevar un MP4 que baja
  por la página entregada de arriba abajo. Se montan fotograma a fotograma, no
  con el grabador de Playwright, que comprime a VP8 con poco bitrate y deja un
  máster del que ya no se recupera nitidez. No se descargan al abrir la página:
  `preload="none"` y un `IntersectionObserver` los arrancan al llegar. `Work.tourUrl` en el dominio, columna nueva
  con su migración, campo en el panel y `video/mp4` admitido en el almacén de
  medios con un tope propio de 12 MB. Con `prefers-reduced-motion` no arranca
  solo: se pausa y aparecen los controles.
- **Care entra al portafolio** con su recorrido y su enlace; Burnout, con
  recorrido y sin enlace hasta que su DNS apunte. La sección dejó de ser una
  grilla de tres columnas y pasó a ser una lista a ancho completo con los lados
  alternados: un recorrido en un tercio de ancho se ve como un sello.
- **Sección de lenguajes de diseño**: cuatro tableros —minimalista, editorial,
  brutalista y oscuro cinematográfico— que enseñan el rango sin romper la
  coherencia de la página.
- **Banda de cifras entre la marquesina y Productos.** Seis páginas web, cuatro
  CRM, cuatro automatizaciones y tres productos propios, con contador que sube al
  entrar en pantalla. La cifra de productos **se deriva** de `content/products.ts`
  en vez de escribirse. Las otras tres son trabajo entregado a clientes que
  pidieron no salir publicados, así que la banda cuenta catorce proyectos y el
  portafolio enseña dos. Llevó una nota que explicaba ese hueco y se retiró a
  pedido del usuario: sonaba a disculpa.
- **El sitio se queda solo en oscuro.** Fuera el conmutador de la barra, el
  script de modo del `<head>`, `localStorage`, el barrido circular (RA-06) y el
  observador de `data-mode` del cielo. La paleta clara **no se borró**: pasó a
  ser exclusivamente la de la franja invertida, que es donde el spec de marca la
  sigue exigiendo. `color-scheme: dark` en la raíz para que los widgets del
  navegador dejen de salir en claro.

**Qué quedó fuera**

- **Burnout va sin enlace.** `burnout.ec` no resuelve y el README del propio
  proyecto dice que el despliegue no es lanzable: el formulario no envía, no hay
  textos legales y la indexación está bloqueada.
- Las capturas de producto son **ejemplos compuestos**; la de Burnout, en cambio,
  es una captura real. Se reemplazan cambiando una ruta en `content/products.ts`.
- ~~`SPEC.md` §5.1 sigue diciendo cuatro productos.~~ Corregido el 3 de septiembre de 2026: §5.1 dice tres y §5.2 dice seis, con la nota de por qué cambiaron.
- ~~El ritmo vertical idéntico de las secciones (hallazgo 12) y las violaciones de
  `style-src` (hallazgo 14).~~ Los dos cerrados el 3 de septiembre de 2026, sin
  esperar a Pf. Ver la entrada de abajo.

**Qué se decidió**

- **D13 pasa a verde: el sitio publica precios, como pisos.** Página nueva desde
  USD 890 cotizada por fases; productos desde USD 39 al mes más USD 90 de puesta
  en marcha. «Depende del alcance» es lo que contesta todo el mundo y por eso no
  tranquiliza a nadie: sin un piso, el que tiene presupuesto no se anima y el que
  no lo tiene escribe igual. **El fondo de RN5 no se movió**: son pisos, no
  tarifas cerradas, siguen derivando a proforma y el bot sigue sin poder inventar
  un número. La prueba que prohibía toda cifra se reescribió para vigilar eso en
  vez de borrarse, y comprueba los tres montos uno por uno.
- **La promesa de respuesta el mismo día hábil se publica en dos sitios**, bajo
  el botón de portada y bajo el de envío. Solo vale si se cumple: una promesa de
  respuesta incumplida hace más daño que no prometer, porque el visitante la usa
  para medir si el resto de la página también es verdad.
- **Ninguna cifra de la banda es de relleno, y la nota que la acompaña no es
  letra chica.** Se pidió publicar «más de 20 páginas» como recurso de venta. No
  se hizo: es la cifra que un prospecto contrasta justo antes de firmar, choca
  con RN8 y repetiría el error del adaptador de portafolio con clientes
  inventados que este mismo paquete borró. Lo que se hizo fue contar el trabajo
  real: seis, cuatro, cuatro y tres, confirmados el 3 de septiembre de 2026. Las
  páginas son seis y no cinco porque Burnout también es un encargo; Care queda
  fuera de la cuenta por ser la página de un producto propio.
- **La banda no explica por qué el portafolio enseña menos.** Se escribió una nota
  que lo hacía y se retiró el mismo día, por decisión del usuario: dicha desde el
  cliente que no autorizó, sonaba a disculpa. Si el hueco vuelve a cerrarse, será
  desde la política propia —«no publicamos el nombre de un cliente sin su
  permiso»— y en el encabezado de Trabajos, no en la banda.
- La única inversión de tema de la página es la de cierre. Servicios vuelve al
  esquema de la página y se separa por elevación, no por color.
- Los rótulos de sección se fueron enteros: los cuatro repetían palabra por
  palabra el enlace del menú que acababa de traer al visitante hasta ahí.
- **Nada de clientes inventados.** Durante el pase existió un adaptador con tres
  trabajos de ejemplo; se eliminó en cuanto entró un trabajo real. Mezclar
  ficticios con reales en una sección que dice «son los que el cliente autorizó a
  mostrar» no tiene defensa.
- **El rango de diseño se enseña en tableros, no mezclando estilos.** Una página
  minimalista arriba y brutalista abajo no se lee como versátil.
- El titular de trabajos dejó de afirmar que todo lo listado está publicado. Solo
  es cierto de lo que lleva enlace.
- **Un solo esquema de color.** Mantener el claro obligaba a validar dos veces
  cada decisión visual, y el sitio se llama Noctis: la marca, el cielo de la
  portada y los recorridos en vídeo están construidos sobre el oscuro. La paleta
  de la página se movió de `html[data-mode='dark']` a `html` —(0,0,1) en vez de
  (0,1,1)— para que `.inv` gane por especificidad y no por orden del archivo.
- **RA-06 se cierra por retirada de alcance, no por incumplimiento.** Sin dos
  esquemas no hay nada entre lo que barrer.

### P3.1 — Capa de movimiento expresiva · 2026-08-14 · **fuera de la numeración**

**Qué se construyó**

- Nueve requisitos nuevos de movimiento, RA-06 a RA-14: cielo WebGL en la portada,
  suavizado de scroll, botón magnético, inclinación por velocidad, onda desde el
  centro y cortina en la grilla de trabajos, proceso anclado con trazo que se
  dibuja, parallax por capas, cursor sobre la grilla y barrido circular al cambiar
  de modo. Más el corte por líneas del titular con `SplitText`, que era lo que
  `ANIMACION.md` pedía desde el principio.
- `animation-layer.tsx` pasó a **solo componer**: cada efecto vive en
  `components/animation/effects/` con su requisito en la cabecera, y todos los
  parámetros en `animation-settings.ts`.
- Las secciones no ganaron lógica: ganaron atributos `data-*`. Siguen siendo
  Server Components.
- 22 pruebas nuevas, 181 en total.

**Dos bugs que estaban vivos**

- **El script del `<head>` no corría entero desde P3.** Las dos constantes se
  concatenaban sin separador y el navegador leía `})()(function(){…})()` como una
  llamada: `TypeError` y la segunda mitad muerta. La clase `animation-ready` no se
  ponía, así que el estado inicial de toda la animación y el temporizador de
  rescate no existían. Cada script pasaba su prueba por separado; ahora se prueba
  **el texto unido**, que es lo único que el navegador ejecuta.
- La grilla de trabajos se quedaba torcida: el disparador solo avisa mientras hay
  scroll y la última inclinación no la bajaba nadie.

**Qué quedó fuera**

- Pruebas del shader y de las animaciones: verificadas a mano en el navegador.
  Playwright sigue para Pf.
- Medición de rendimiento: es de Pf, y este paquete es el que más la necesita.
- `Flip` y transiciones entre páginas: no hay páginas de detalle todavía.

**Decisiones** — tres ADRs, `ADR-0012` a `ADR-0014`

- **D15 cerrado**: GSAP es gratuito por completo, plugins incluidos, y el paquete
  de npm ya los traía. Nada que instalar, nada que pagar.
- El criterio de animación gira: de "que no se note" a "que se note".
  `ANIMACION.md` pasa a v2.0 · **decisión del usuario**.
- `three` como dependencia de producción, autorizada explícitamente, con el uso
  acotado y la salida escrita por si el presupuesto de Pf no da.

### P5 — Motor de disponibilidad · 2026-08-14 · **camino crítico**

**Qué se construyó**

- El motor: entran bloques ocupados y una política, salen espacios libres. Nada
  más. No sabe que existen Google Calendar, una base de datos ni una petición
  HTTP, y **por eso sus 24 pruebas corren sin levantar nada**.
- Las siete reglas de D1, D2 y D3, cada una con sus pruebas de borde.
- Conversión de zona horaria explícita con `Intl`. El motor **nunca** lee la zona
  del servidor: un despliegue en Virginia ofrece las mismas horas que uno en
  Guayaquil, y hay una prueba que lo comprueba corriendo la misma consulta con
  `Europe/Madrid`.
- Tipos de dominio: `TimeSlot`, `SlotId` (cadena marcada), `SchedulingPolicy`.
- `config/scheduling.ts` con los valores de D1–D3, versionados. El dominio no
  importa la configuración: la recibe.
- 24 pruebas nuevas, 159 en total.

**Los casos conocidos hicieron su trabajo**

`docs/pruebas/casos-conocidos.md` tiene M1–M21 con el resultado esperado escrito
a mano **antes de ejecutar**. Cuatro de esas expectativas estaban mal y el motor
tenía razón:

- Un espacio que deja **exactamente** los diez minutos de margen sí cumple: el
  margen es un mínimo, no algo que superar.
- La ventana de diez días hábiles cuenta desde hoy, y hoy queda fuera por el
  aviso mínimo: se ofrecen nueve días, no diez.

Las dos lecturas quedaron registradas como decisión, con la nota de qué cambiar
si el usuario las prefiere al revés.

### P4 — Puertos, adaptadores simulados y selector de modo · 2026-08-14

**Qué se construyó**

- Los cuatro puertos de `BUILD.md` §2, con las reglas metidas en su forma:
  `CalendarPort.busyRanges` devuelve intervalos y nada más, así que **RN1 no
  depende de la disciplina de nadie**; `ChatPort` devuelve texto y no órdenes,
  así que el modelo no tiene por dónde ejecutar nada.
- Los cuatro adaptadores simulados, con latencia y un **interruptor** de fallo
  —no un dado—: pruebas deterministas y demostraciones que siempre hacen lo
  mismo, que es lo que `BUILD.md` §3 pide.
- El selector de modo, global y por servicio, que es lo que permite pasar a real
  uno a la vez en P12.
- `TimeRange`, el primer tipo de dominio del sistema.
- `/dev/bandeja`, que muestra los correos que se habrían enviado. **404 en
  producción**: es donde se ven correos enteros.
- 38 pruebas nuevas, 135 en total.

**RN10, verificada contra el build**

Con un servicio en `real` y sin credenciales, `next build` **falla** y nombra las
tres variables que faltan. Con las credenciales puestas también se detiene, porque
el adaptador real llega en P12: seguir sería usar el simulado sin avisar, que es
exactamente el desastre invisible que la regla prohíbe.

### P3 — Capa de animación GSAP · 2026-08-14

**Qué se construyó**

- RA-01 a RA-05 de `docs/ANIMACION.md`, dentro de un `gsap.context()` con
  limpieza: al desmontar, `revert()` deshace los estilos y mata los
  ScrollTrigger, así que navegar entre rutas no deja disparadores huérfanos.
- GSAP 3.15 desde el paquete, empaquetado con la aplicación. **Nunca desde un
  CDN**; verificado sobre el HTML servido.
- Corte de móvil con `gsap.matchMedia()` a 768 px.
- El registro nocturno de la portada, renderizado en el servidor y rotando en el
  cliente. Con movimiento reducido no rota.
- Un solo componente de cliente para toda la animación: las once secciones
  siguen siendo Server Components.

**D15 no bloqueó, y sigue abierto**

D15 (licencia de GSAP) está en 🔴 y bloquea P3 **si se usan plugins**. No se usa
ninguno: el titular se parte en el servidor en vez de con `SplitText` —lo que
además evita el instante con el titular entero reorganizándose— y ScrollSmoother
está fuera de v1. Queda pendiente para el día que se quieran.

**Un agujero del prototipo, corregido**

Su CSS esconde los elementos animados y los rescata con una clase que **nadie
agrega**: con JavaScript deshabilitado, la página queda en blanco, contra RN11.
Se invirtió la condición —se esconde solo si JavaScript lo pidió— y se agregó un
temporizador de rescate por si la capa no llega a ejecutarse. ADR-0010, con
prueba que lo ejecuta.

### P2 — Contenido tipado y secciones estáticas · 2026-08-14

**Qué se construyó**

- `content/` tipado y hoja: productos, trabajos, servicios, proceso, preguntas y
  todos los textos del sitio. `WorkCover` es unión discriminada —portada
  tipográfica **o** imagen— desde el primer día, para que el componente de
  trabajos no haya que reescribirlo cuando lleguen las capturas reales.
- Las once secciones de `SPEC.md` §6, más barra y pie. `app/page.tsx` es solo
  composición: once líneas, ni un texto.
- 17 pruebas nuevas, 93 en total.

**El criterio de aceptación es una prueba**

"Ningún texto de cara al usuario vive dentro de un componente" no se comprueba
leyendo: la prueba recorre `src/components` y `src/app`, quita los comentarios y
busca texto suelto entre etiquetas JSX. Igual RN8: busca la cadena sobre todo el
texto del sitio aplanado, y también se verificó sobre el HTML servido.

**Dos decisiones de contenido**

- **El testimonio no se publica** mientras no haya nombre real (C2). Una cita
  firmada por `[Nombre del cliente]` dice que el sitio se armó con relleno.
- **El formulario apunta a `/api/contacto`** desde ya. Un `<form>` sin destino
  envía por `GET` y deja lo que escribió el visitante en la barra de direcciones
  y en el historial. Hasta P10 responde 404, que es una señal honesta.

**Corregido durante la construcción**

- Un fallo real de `audit:secrets`: reventaba con archivos borrados del árbol
  pero todavía en el índice. Lo destapó este mismo paquete al borrar la vista de
  P1.
- Un `eslint-disable` que se había colado para usar `<img>` → `next/image`.

### P1 — Sistema de diseño y modo claro/oscuro · 2026-08-14

**Qué se construyó**

- `tokens.css` con los dos modos y la franja invertida, con los valores exactos
  del prototipo. Los nombres de token quedan en español: son el contrato visual
  compartido con Commerce y Care (ADR-0008).
- Fuentes Inter Tight e Inter con `next/font`, descargadas en el build y
  servidas desde el propio dominio. Ni una petición a un tercero.
- Script en línea en el `<head>`, con el nonce de la petición, que fija
  `data-mode` **antes del primer pintado**. Se ejecuta de verdad en una prueba,
  contra un documento falso.
- Botón de cambio de modo con persistencia, sin estado propio: el modo vive en
  el atributo del `<html>` y el icono lo decide el CSS, así no hay diferencia
  entre servidor y cliente al hidratar.
- Los cinco componentes base: `Button`, `Field`, `Label`, `Status`, `Accordion`.
- Vista del sistema de diseño para poder comprobar los dos modos de un vistazo.
- 20 pruebas nuevas, 76 en total.

**Qué se corrigió, y por qué importa**

La prueba de contraste **calcula** la razón WCAG leyendo `tokens.css`, en vez de
marcar una casilla. Encontró dos fallos reales:

- La franja invertida no invertía `--fondo-2`: cualquier componente que lo usara
  ahí dejaba el texto secundario en 2.8:1.
- `--texto-3` da 2.79:1 en modo claro, y se estaba usando en el marcador de
  posición de los campos, que es texto.

Los dos se corrigieron **en el uso, no en la paleta**: el prototipo manda en lo
visual (ADR-0009).

**Qué quedó fuera, y por qué**

- Pruebas de render de los componentes: no se trajo entorno de DOM ni biblioteca
  de pruebas de React. La interfaz se cubre con Playwright en P7 y Pf.
- La vista del sistema de diseño y `content/design-system-preview.ts` **los borra
  P2** al poner las once secciones.

**Decisiones** — ADR-0008 y ADR-0009.

### P0 — Fundación · 2026-08-14

**Qué se construyó**

- Proyecto Next.js 16 con TypeScript 6 en modo estricto completo
  (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Node 24 fijado.
- Estructura de capas de `CLAUDE.md` §2 **hecha ejecutable**: cuatro reglas de
  dependency-cruiser en `error` dentro de `audit:fast`, que bloquea el commit. Un
  import de infraestructura desde `domain/` rompe la compuerta.
- Cadena de auditoría completa: `audit:fast` (tipos, lint, prohibidos,
  arquitectura, secretos) y `audit` (+ complejidad, código muerto, duplicación,
  dependencias y pruebas). Pre-commit por `core.hooksPath` versionado y CI en
  GitHub Actions.
- Dos verificadores propios: `audit-forbidden.mjs` (`any`, supresiones de
  compilador y linter, `process.env` en el dominio, HTML crudo, scripts desde
  CDN, SQL interpolado, `.env` versionado) y `audit-secrets.mjs` (diff preparado
  en pre-commit, archivos versionados en CI).
- Infraestructura compartida: entorno validado por esquema —único punto que lee
  `process.env`—, registro estructurado que redacta datos personales por nombre
  de campo (RN12), formato único de error, limitador por origen, y las seis
  cabeceras de seguridad con **CSP estricta y nonce por petición**.
- `GET /api/estado`, que devuelve el modo de servicios activo y hace verificable
  RN10 después de desplegar.
- 56 pruebas, todas sin base de datos, sin red y sin servidor levantado.

**Qué quedó fuera, y por qué**

- Dominio, casos de uso y puertos: son P4 y P5. No se escribió una interfaz sin
  implementación ni un error sin quien lo lance.
- Exigencia de credenciales en `MODO_SERVICIOS=real`: llega en P4, cuando
  existan credenciales que exigir. El mecanismo que las va a exigir ya está.
- Playwright: llega con la interfaz que lo justifique (P7 y Pf).

**Decisiones** — siete ADRs, `ADR-0001` a `ADR-0007`

- Identificadores en inglés y archivos `kebab-case` con sufijo de rol, verificado
  contra el **código** de Commerce. Cierra D12 y `FASE0-CHECKLIST` C2.
- Motor de disponibilidad propio, sin extraer el de Care. Cierra
  `FASE0-CHECKLIST` C1 · **pendiente de ratificación del usuario**.
- Vitest como runner · **pendiente de ratificación**.
- CSP con nonce, con el render dinámico que trae con ella.
- TypeScript 6.0.3 y ESLint 9.39.5, porque `typescript-eslint` no soporta 7 ni 10.
- Registro, limitador y pre-commit propios, sin dependencias nuevas.
- `/api/estado` expone el modo de servicios.

**Corregido durante la construcción**

- La CSP con `strict-dynamic` dejaba sin firmar los scripts en línea de Next: la
  página llegaba servida pero muerta en el navegador. Se detectó verificando
  contra un servidor de producción real, no en las pruebas.
