# SPEC — Agendamiento y bot conversacional

**Módulo** Complemento de `SPEC.md` (sitio web de Noctis)
**Versión** 1.0 · agosto 2026

---

## 0. Antes de empezar: dos advertencias

**Esto no entra en una noche.** El sitio estático con animaciones sí. Este módulo tiene calendario, correo transaccional, un modelo de lenguaje, control de costos y datos personales de por medio. Intentar meterlo todo junto en la primera sesión es la forma más segura de terminar con un bot que agenda dos reuniones en el mismo horario. La sección 8 propone un orden.

**Ya tienen la mitad construida.** Care resuelve exactamente este problema: motor de disponibilidad, máquina de estados conversacional, escritura en Google Calendar y recordatorios. **No reimplementar nada de eso desde cero.** Lo primero de este módulo es revisar qué se extrae de Care como paquete compartido. Si Noctis construye su propio motor de disponibilidad, va a mantener dos motores distintos con los mismos errores.

---

## 1. Qué se construye

Dos piezas que comparten fondo pero se pueden entregar por separado:

**A · Agendamiento directo.** El visitante ve la disponibilidad real de Lander y reserva una reunión de veinte minutos. La cita queda en el calendario y ambos reciben confirmación.

**B · Bot conversacional.** Un asistente en el sitio que conversa con el visitante, entiende qué necesita, y termina en una de dos salidas: agenda la reunión, o envía a Lander un correo con el resumen estructurado de lo que el cliente quiere.

La pieza A funciona sola y aporta valor desde el primer día. La pieza B sin la A no tiene dónde aterrizar.

---

## 2. Pieza A — Agendamiento directo

### 2.1 Flujo

1. El visitante abre el agendador desde el botón "Agendar una llamada"
2. Ve los espacios libres de los próximos diez días hábiles
3. Elige uno y completa nombre, correo, WhatsApp y una línea sobre su negocio
4. El sistema **vuelve a verificar disponibilidad** y crea el evento
5. Confirmación en pantalla, correo al cliente y a Lander, evento en el calendario

### 2.2 Reglas de disponibilidad

Configurables, no incrustadas en el código:

| Regla | Valor inicial |
|---|---|
| Duración | 20 minutos |
| Horario | Lunes a viernes, por definir |
| Zona horaria | `America/Guayaquil` — sin horario de verano |
| Margen entre reuniones | 10 minutos |
| Aviso mínimo | 12 horas |
| Ventana máxima | 10 días hábiles |
| Máximo por día | 4 |

### 2.3 Consideraciones técnicas

- **Free/busy, no lectura de eventos.** El servidor consulta solo bloques ocupados. Nunca se expone al navegador el detalle de la agenda: ni títulos, ni asistentes, ni notas.
- **Doble reserva.** Verificar disponibilidad otra vez justo antes de crear el evento, dentro de la misma operación, con clave de idempotencia por intento. Sin esto, dos personas eligiendo el mismo espacio a la vez generan un choque.
- **Credenciales.** Cuenta de servicio o refresh token en el servidor. Jamás en el cliente.
- **Zona horaria del visitante.** Mostrar los horarios en la zona de quien mira, con la zona indicada de forma explícita en pantalla.
- **Cancelar y reprogramar.** Enlace con token firmado en el correo de confirmación.
- **Si el calendario no responde.** No mostrar un agendador roto: se cae con elegancia al formulario de contacto normal.

---

## 3. Pieza B — Bot conversacional

### 3.1 Qué hace y qué no

**Hace:** saluda, pregunta por el negocio y el problema, explica en términos simples qué producto o servicio aplica, y lleva a una de las dos salidas.

**No hace, nunca:**
- Dar precios cerrados ni cotizar. Deriva a proforma.
- Prometer plazos de entrega.
- Inventar capacidades que los productos no tienen. Solo describe lo que está en el contenido del sitio.
- Afirmar que un producto está disponible cuando está en desarrollo o en pruebas.
- Hablar de temas ajenos al negocio.

La última regla importa más de lo que parece: un bot que responde cualquier cosa en el sitio de una empresa de software es una vergüenza pública esperando a ocurrir.

### 3.2 Datos a capturar

El objetivo de la conversación es llenar esta ficha. El bot pregunta lo que falta, sin interrogar:

```ts
interface FichaProspecto {
  nombre: string
  negocio: string
  sector: string
  canal: { correo?: string; whatsapp?: string }   // al menos uno
  problema: string            // en palabras del cliente
  interes: TipoInteres        // catálogo cerrado
  urgencia: 'ya' | 'este mes' | 'explorando'
  resumen: string             // 3–4 líneas para Lander
  transcripcion: string
}
```

`interes` se limita al catálogo real del sitio: página web, automatización, Care, Commerce, CRM, infraestructura, o sin definir.

### 3.3 Salidas

**Agendó.** El bot entrega los espacios disponibles y confirma. Correo a Lander con la ficha completa antes de la reunión.

**No agendó pero dejó datos.** Correo a Lander con la ficha y la transcripción. Asunto que se pueda leer en el celular sin abrirlo: `Prospecto — [negocio] — [interés]`.

**Ni una cosa ni la otra.** No se envía nada. Un correo por cada curioso que abre el chat convierte la bandeja en ruido y el módulo deja de usarse en dos semanas.

### 3.4 Seguridad y control

- **Límite por sesión** de mensajes y de tokens, con corte y derivación a WhatsApp al llegar al tope
- **Límite por IP** y por ventana de tiempo
- **Inyección de prompt:** lo que escribe el visitante es dato, no instrucción. El bot no ejecuta órdenes que lleguen en el chat.
- **Presupuesto mensual** con alerta y apagado automático. Definir el techo antes de publicar.
- **Interruptor de apagado** que oculta el widget sin desplegar.
- **Registro** de conversaciones para revisar calidad las primeras semanas.

### 3.5 Datos personales

El bot recoge nombre, correo, teléfono y contexto de negocio. Aplica la LOPDP:

- Aviso visible al abrir el chat: qué se guarda y para qué
- Base legal y plazo de conservación definidos
- Vía para solicitar borrado
- No pedir cédula, ni datos bancarios, ni nada que no haga falta para devolver la llamada

> Noctis le va a vender automatización con datos de clientes a otras empresas. Que su propio sitio esté bien resuelto en esto no es un trámite: es la demostración.

---

## 4. Endpoints

| Ruta | Qué hace |
|---|---|
| `GET /api/disponibilidad` | Espacios libres. Solo horarios, sin detalle de agenda |
| `POST /api/reservar` | Verifica, crea evento, envía correos. Idempotente |
| `POST /api/chat` | Turno de conversación. Con límite de uso |
| `POST /api/prospecto` | Cierra la ficha y notifica |
| `GET /api/cita/[token]` | Cancelar o reprogramar |

Validación de esquema en el servidor en todos. Nada confía en el cliente.

---

## 5. Correos

Cuatro plantillas, todas por Brevo:

1. **Confirmación al cliente** — cuándo, cómo se conecta, cómo cancelar
2. **Aviso a Lander de cita nueva** — con la ficha del prospecto
3. **Prospecto sin cita** — ficha y transcripción
4. **Recordatorio** — al cliente, unas horas antes

---

## 6. Interfaz

**Agendador.** Vive en una hoja lateral o modal, no en página aparte. Mismos tokens, mismos dos modos, misma tipografía. Estados obligatorios: cargando, sin espacios disponibles, error de calendario, éxito.

**Widget del bot.** Discreto, esquina inferior. **No se abre solo** al entrar: eso es lo que hace que la gente cierre la pestaña. Se abre al hacer clic, o después de una intención clara como llegar al final de la página. Debe poder cerrarse y quedarse cerrado durante la sesión.

Ambos accesibles con teclado, con foco atrapado dentro del modal mientras esté abierto, y anunciados correctamente por lector de pantalla.

---

## 7. Puntos abiertos

| Tema | Pendiente |
|---|---|
| Reutilización de Care | Qué se extrae como paquete compartido — **decidir primero** |
| Horario de atención | Días y horas exactas de disponibilidad |
| Dónde se hace la reunión | Google Meet, llamada telefónica, WhatsApp |
| Modelo del bot | Cuál, y presupuesto mensual tope |
| Persistencia | ¿Se guardan las conversaciones? ¿Cuánto tiempo? |
| Cuenta de calendario | ¿Calendario personal de Lander o cuenta de la empresa? |
| Aviso de privacidad | Redactarlo y publicarlo antes de encender el bot |
| Idioma | ¿El bot responde solo en español? |

---

## 8. Orden sugerido

**Primero, el sitio.** `SPEC.md` completo, desplegado y funcionando. Formulario de contacto operativo. Con eso ya se puede vender.

**Después, la pieza A.** Agendamiento con disponibilidad real, reutilizando lo de Care. Es determinista, se prueba fácil y resuelve el noventa por ciento del valor: que el cliente reserve sin ida y vuelta de mensajes.

**Al final, la pieza B.** El bot, con límites de uso y presupuesto desde el primer commit, y con revisión manual de las conversaciones durante las primeras semanas.

*Criterio de aceptación de A:* dos personas reservando el mismo espacio al mismo tiempo producen una sola cita y un mensaje claro para la segunda.

*Criterio de aceptación de B:* el bot rechaza dar precios, no inventa capacidades, corta al llegar al límite de mensajes, y solo notifica cuando hay una ficha con contacto real.
