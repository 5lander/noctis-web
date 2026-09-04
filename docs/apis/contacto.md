# Formulario de contacto

## POST `/api/contacto`

**Módulo**: `lead` · **Autenticación**: ninguna · **Rate limit**: sí — 5 envíos por 15 minutos y por origen

Recibe la ficha del formulario del sitio, la valida y avisa por correo. Es la
única vía de conversión que no depende de que el visitante abra WhatsApp, y
hasta este paquete no existía: el formulario apuntaba acá y devolvía 404.

### Request

Acepta dos codificaciones, y de eso depende cómo contesta:

| `content-type` | Quién lo manda |
|---|---|
| `application/x-www-form-urlencoded` | El envío nativo del `<form>` y el `fetch` del formulario |
| `application/json` | Cualquier cliente que prefiera JSON |

| Campo | Obligatorio | Tope | Nota |
|---|---|---|---|
| `nombre` | sí | 80 | Sin él la ficha no se puede leer ni contestar |
| `negocio` | no | 80 | |
| `correo` | ver RN7 | 160 | |
| `whatsapp` | ver RN7 | 30 | Se cuentan dígitos, no caracteres |
| `interes` | no | 80 | Una de las opciones de `content/site-copy.ts` |
| `mensaje` | no | 2000 | |
| `sitio` | — | 80 | **Campo trampa.** Si llega con algo, el envío se descarta |
| `desde` | — | — | Milisegundos de época en que el servidor pintó el formulario |

**RN7 — al menos un canal de contacto válido.** Se acepta con correo bien
formado **o** con un número de al menos siete dígitos. Sin ninguno de los dos se
rechaza, y es una regla de negocio y no una validación de formulario: un correo
por cada curioso que no dejó cómo responderle convierte la bandeja en ruido, y
una bandeja ruidosa se deja de mirar.

El cuerpo entero se corta en **16 KB** antes de interpretarse.

### Response `200` — pedida en JSON

```json
{ "estado": "recibido" }
```

### Response `303` — envío nativo del formulario

`location: /?enviado=si#contacto`, o `?enviado=no` si algo falló. La portada lee
ese parámetro y pinta el mismo mensaje que pinta la vía con JavaScript. Sin esto,
quien tenga el JavaScript caído vería el JSON crudo en una pantalla en blanco.

### Errores

| Código | Cuándo |
|---|---|
| 400 | Falta el nombre, falta el canal de contacto, el correo está mal escrito, o el cuerpo no se pudo interpretar |
| 413 | El cuerpo se pasó de 16 KB |
| 429 | Se pasó del límite del origen. Lleva `retry-after` en segundos |
| 500 | Fallo inesperado. Mensaje genérico; el detalle solo en el registro |

El mensaje de 400 y de 413 es el mismo y es deliberado: dice qué revisar sin
decir qué comprobación falló. Enumerar cuál de los cuatro motivos fue le sirve
más a quien prueba el formulario con un guion que a quien lo llena en serio.

### Lo que **no** devuelve nunca

**Un envío que huele a robot recibe `200`, igual que uno bueno.** Contarle al
automatismo que se le detectó la trampa es regalarle el dato que necesita para
ajustarla. La diferencia es invisible desde afuera y total adentro: solo uno de
los dos genera un correo.

### Reglas de seguridad aplicadas

- **Lo que escribe el visitante es dato, no instrucción.** El cuerpo entra como
  `unknown`, pasa por esquema y sale como ficha o como motivo de rechazo. El
  texto viaja íntegro al correo, sin interpretarse — hay prueba de eso.
- **Campos desconocidos se descartan**, no se arrastran.
- **Dos badenes anti-automatización** (`SPEC.md` §10): la trampa, un campo que
  nadie ve; y la prisa, menos de tres segundos entre que el servidor pintó el
  formulario y el envío. Los dos viajan por el cliente y los dos se pueden
  falsear: son badenes, no muros. El muro es el límite por origen.
- **Límite por origen** como única defensa que no depende del navegador.
- **Sin dato personal en el registro** (RN12). Se registra que llegó una ficha y
  por qué se rechazó una; nunca qué decía. Para leerla está el correo.
- **Sin caché** en ninguna respuesta.

### Cómo se prueba sin credenciales

En modo `demo` el correo lo recibe `FakeMail`, y los envíos se ven enteros en
`/dev/bandeja`, que solo existe en desarrollo. No hace falta cuenta de Brevo ni
una sola credencial: `BUILD.md` §3.
