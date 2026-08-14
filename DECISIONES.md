# DECISIONES.md — Valores provisionales

> 🟡 = provisional, **úsalo sin preguntar** e impleméntalo como configuración versionada (nunca incrustado).
> 🔴 = bloquea de verdad; pregunta antes de avanzar en el paquete indicado.
> Cuando el usuario confirme un valor, cambia el 🟡 por ✅ y anota la fecha.

| # | Decisión | Valor provisional | Estado | Vive en | Bloquea |
|---|---|---|---|---|---|
| D1 | Horario de atención para reuniones | Lunes a viernes, 09:00–13:00 y 14:30–17:30 (Guayaquil) | 🟡 | `config/scheduling.ts` | — |
| D2 | Máximo de reuniones por día | 4 | 🟡 | `config/scheduling.ts` | — |
| D3 | Duración, margen, aviso mínimo, ventana | 20 min · 10 min · 12 h · 10 días hábiles | 🟡 | `config/scheduling.ts` | — |
| D4 | Modelo del bot y tope de presupuesto | Definir al conectar; tope mensual obligatorio antes de encender | 🔴 | `config/chat.ts` | Conexión real en P12 |
| D5 | Persistencia de fichas y conversaciones | En memoria en v1; PostgreSQL si se decide persistir | 🟡 | `AlmacenPort` | — |
| D6 | Plazo de conservación de datos de prospectos | 12 meses, borrado automático al vencer | 🟡 | `config/privacy.ts` | — |
| D7 | Dónde se hace la reunión | Google Meet generado con el evento | 🟡 | `config/scheduling.ts` | — |
| D8 | Cuenta de calendario | Cuenta de empresa, no la personal de Lander | 🟡 | Variables de entorno | Conexión real |
| D9 | Hosting y dominio | Por definir | 🔴 | — | Despliegue en P12 |
| D10 | Analítica | Ninguna en v1 | 🟡 | — | — |
| D11 | Idioma del bot | Solo español | 🟡 | `config/chat.ts` | — |
| D12 | Idioma de identificadores en código | Inglés — **confirmar contra Commerce antes de P0** | 🟡 | Convención | — |
| D13 | Precios públicos en el sitio | No se muestran | 🟡 | `content/` | — |
| D14 | Versión en inglés del sitio | No en v1 | 🟡 | Rutas | — |
| D15 | Licencia de GSAP y plugins | **Verificar términos vigentes antes de instalar SplitText o ScrollSmoother** | 🔴 | — | P3 si se usan plugins |

## Contenido pendiente del usuario

No son decisiones técnicas, pero bloquean la publicación:

| # | Qué falta | Bloquea |
|---|---|---|
| C1 | Seis trabajos reales: nombre autorizado, tipo, año, enlace, captura | Publicación de la sección Trabajos |
| C2 | Testimonio: nombre y cargo reales, o se retira la sección | Publicación |
| C3 | Número de WhatsApp y texto previo del mensaje | Publicación |
| C4 | Aviso de privacidad redactado | **Encender el bot** |
