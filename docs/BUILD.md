# BUILD.md — Construcción completa en una pasada

**Complemento de** `SPEC.md`, `SPEC-agendamiento-bot.md`, `spec-gsap-noctis.md`, `SECURITY.md`
**Versión** 1.0 · agosto 2026

---

## 1. La idea

Se construye **todo**: sitio, animaciones, formulario, agendamiento y bot. Todo funciona de punta a punta desde el primer arranque, sin una sola credencial configurada. Después se conectan los servicios reales cambiando variables de entorno, sin tocar una línea de lógica.

Esto sirve a dos cosas al mismo tiempo:

1. **Mostrarle al cliente cómo va a funcionar de verdad**, para que lo pruebe y contrate.
2. **Ser la demostración viva del servicio de mejora de páginas web.** Si Noctis vende "le mejoramos el sitio", su propio sitio tiene que ser el argumento. Un prospecto que agenda por el bot ya entendió qué compra.

Lo que lo hace posible es una regla de arquitectura, no un truco: **la lógica de negocio nunca habla con un servicio externo directamente.** Habla con una interfaz. Detrás hay dos implementaciones, una simulada y una real.

---

## 2. Puertos y adaptadores

```
dominio/          reglas puras, sin dependencias externas
  disponibilidad/ cálculo de espacios libres — funciones puras, testeables
  prospecto/      ficha, validación, estados
aplicacion/       casos de uso: reservarCita, procesarTurnoChat, enviarFicha
puertos/          interfaces: CalendarioPort, CorreoPort, ChatPort, AlmacenPort
infraestructura/
  calendario/     GoogleCalendarAdapter | CalendarioSimulado
  correo/         BrevoAdapter          | CorreoSimulado
  chat/           ModeloAdapter         | ChatSimulado
  almacen/        DbAdapter             | AlmacenMemoria
ui/               componentes, sin lógica de negocio adentro
```

**El selector.** Una sola variable decide qué adaptador se inyecta:

```
MODO_SERVICIOS=demo | real
```

En `demo` nada sale a internet, nada cuesta dinero y nada se puede romper delante de un cliente. En `real` se exige que las credenciales existan: si falta una, la aplicación **no arranca** y dice cuál falta. Nunca se cae silenciosamente a simulado en producción — eso sería un desastre invisible.

---

## 3. Qué hace cada adaptador simulado

**CalendarioSimulado.** Genera disponibilidad realista a partir de las reglas de negocio, con algunos espacios ya ocupados para que se vea creíble. Aplica las mismas validaciones que el real, incluida la de doble reserva. Al reservar, guarda en memoria y devuelve confirmación.

**CorreoSimulado.** No envía nada. Escribe el correo completo — destinatario, asunto, cuerpo renderizado — en la consola del servidor y en una bandeja en memoria visible en `/dev/bandeja`, solo en desarrollo. Así se revisan las cuatro plantillas sin mandar un correo.

**ChatSimulado.** Máquina de estados determinista que recorre la conversación real: saludo, negocio, problema, interés, contacto, cierre. Sin modelo de lenguaje, sin costo, sin variación entre demos. Para mostrarle a un cliente esto es *mejor* que el modelo real, porque siempre hace lo mismo.

**AlmacenMemoria.** Persistencia en memoria con la misma interfaz que la base de datos.

> Los adaptadores simulados no son descartables. Quedan en el repo para siempre: son el entorno de pruebas automatizadas y el modo demostración comercial.

---

## 4. Orden de construcción

Una sola pasada, pero con este orden. Cada bloque queda funcionando antes de pasar al siguiente.

| # | Bloque | Termina cuando |
|---|---|---|
| 1 | Proyecto, tokens, fuentes, cambio de modo sin parpadeo | Se ve idéntico al prototipo en ambos modos |
| 2 | Secciones estáticas con contenido real desde `content/` | Ningún texto vive dentro de un componente |
| 3 | Capa GSAP (RA-01 a RA-05) con `gsap.context()` y limpieza | Con movimiento reducido, todo sigue visible |
| 4 | Puertos, adaptadores simulados, inyección por `MODO_SERVICIOS` | La app arranca en `demo` sin ninguna credencial |
| 5 | Dominio de disponibilidad — funciones puras | Las pruebas de doble reserva pasan |
| 6 | Endpoints con validación, límites y cabeceras (ver `SECURITY.md`) | Toda entrada inválida se rechaza en el servidor |
| 7 | Agendador en la interfaz, con sus cuatro estados | Cargando, vacío, error y éxito se ven bien |
| 8 | Bot: máquina de estados, ficha, salidas | Solo notifica con contacto real |
| 9 | Plantillas de correo, las cuatro | Se leen bien en la bandeja simulada |
| 10 | Pruebas, cabeceras de seguridad, metadata, Lighthouse | Ver sección 7 |

---

## 5. Reglas de código

**Capas.** El dominio no importa nada de Next, ni de React, ni de un SDK. Si una función de disponibilidad necesita `fetch`, está en la capa equivocada.

**Componentes.** Sin lógica de negocio adentro. Reciben datos y los muestran. La lógica vive en casos de uso o en hooks delgados que los llaman.

**Tipos.** Estricto de verdad: sin `any`, sin `as` para callar al compilador. Lo que entra por la red se valida con esquema y recién ahí se tipa.

**Funciones.** Cortas, un propósito, nombre que dice qué hacen. Si hace falta un comentario para explicar qué hace una función, el nombre está mal.

**Errores.** Explícitos y tipados. Nada de `catch` vacío. Cada error tiene un mensaje para el usuario y otro para el registro — nunca el mismo.

**Dependencias.** Las mínimas. Cada paquete nuevo se justifica. Nada sin mantenimiento reciente.

**Idioma del código.** Identificadores y comentarios técnicos en inglés; contenido de cara al usuario en español. *Confirmar contra la convención de Commerce antes de arrancar, para que los tres repos no queden distintos.*

**Pruebas.** Obligatorias en: cálculo de disponibilidad, prevención de doble reserva, validación de cada endpoint, límites de uso, y transiciones de la máquina de estados del chat. La interfaz no necesita cobertura exhaustiva.

---

## 6. Conexión de lo real, después

Cada servicio se conecta por separado y de forma independiente:

| Servicio | Qué hace falta | Se verifica con |
|---|---|---|
| Correo | Clave API de Brevo, dominio con SPF, DKIM y DMARC | Llega un correo de prueba y no cae en spam |
| Calendario | Cuenta de servicio, calendario compartido, permiso mínimo | Un espacio ocupado real desaparece de la lista |
| Modelo | Clave, modelo elegido, tope de presupuesto | El bot mantiene sus límites bajo conversación real |
| Base de datos | Cadena de conexión, migraciones | La ficha sobrevive a un reinicio |

**Regla de despliegue:** se pasa a `real` un servicio a la vez, verificando cada uno antes del siguiente. Los demás siguen simulados mientras tanto. Eso es posible justamente porque la inyección es por servicio, no global.

---

## 7. Definición de terminado

No está listo hasta que todo esto sea cierto:

- [ ] Arranca en `demo` sin ninguna credencial y todo el recorrido funciona
- [ ] En `real`, si falta una credencial la aplicación no arranca y dice cuál
- [ ] Idéntico al prototipo en ambos modos, sin parpadeo al cargar
- [ ] Con `prefers-reduced-motion`, todo visible y legible
- [ ] Si GSAP no carga, la página sigue siendo usable
- [ ] Dos reservas simultáneas del mismo espacio producen una sola cita
- [ ] Toda entrada inválida se rechaza en el servidor, no solo en el navegador
- [ ] El bot no da precios, no inventa capacidades, corta al llegar al límite
- [ ] Cabeceras de seguridad presentes y verificadas — `SECURITY.md`
- [ ] Sin secretos en el paquete del cliente ni en los registros
- [ ] Lighthouse ≥ 90 en móvil, en las cuatro categorías
- [ ] Navegable completo con teclado, foco siempre visible

---

## 8. Dos advertencias que siguen en pie

**El bot necesita horas de uso antes de mirar a un desconocido.** El código sale en una pasada; la calidad de sus respuestas, no. Conviene salir con el bot en simulado — que además es más confiable para demostrar — y encender el modelo real después de revisar conversaciones propias.

**La demostración es un compromiso comercial.** Si un cliente prueba el bot y agenda, va a esperar que su propio sistema funcione así. Que lo simulado se vea perfecto y lo real llegue a medias es peor que no mostrar nada. Antes de enseñarlo, tener claro qué se está prometiendo y en cuánto tiempo se entrega.
