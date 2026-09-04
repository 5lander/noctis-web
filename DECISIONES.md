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
| D16 | Dónde vive el portafolio | SQLite con `node:sqlite`, tras `PortfolioRepositoryPort`. Exige disco persistente; sin él, adaptador de PostgreSQL | ✅ 2026-08-16 | [ADR-0015](docs/decisiones/ADR-0015-portafolio-en-sqlite-sin-orm.md) | — |
| D17 | Ciudad de la empresa | **Loja, Ecuador.** La zona horaria sigue siendo `America/Guayaquil`, que es la de todo el Ecuador continental | ✅ 2026-08-16 | `content/site.ts` · `config/scheduling.ts` | — |
| D11 | Idioma del bot | Solo español | 🟡 | `config/chat.ts` | — |
| D12 | Idioma de identificadores en código | Inglés · archivos `kebab-case` con sufijo de rol · puertos sin prefijo `I`. Verificado contra el **código** de Commerce, no su documentación | ✅ 2026-08-14 | Convención · [ADR-0001](docs/decisiones/ADR-0001-idioma-y-convencion-de-identificadores.md) | — |
| D13 | Precios públicos en el sitio | **Sí se muestran, como pisos.** Página nueva desde USD 890, cotizada por fases con valor cerrado por fase. Productos desde USD 39 al mes más USD 90 de puesta en marcha por única vez. Siguen derivando a proforma: un piso filtra, un precio cerrado compromete | ✅ 2026-09-03 | `content/questions.ts` · `content.spec.ts` | — |
| D14 | Versión en inglés del sitio | No en v1 | 🟡 | Rutas | — |
| D15 | Licencia de GSAP y plugins | **Gratuito por completo desde 2025, plugins incluidos y sin restricción comercial.** El paquete de npm los trae; se sirven desde el propio dominio | ✅ 2026-08-14 | [ADR-0012](docs/decisiones/ADR-0012-licencia-de-gsap-resuelta.md) | — |

## Contenido pendiente del usuario

No son decisiones técnicas, pero bloquean la publicación:

| # | Qué falta | Bloquea |
|---|---|---|
| C1 | Trabajos reales: nombre autorizado, tipo, año, enlace, captura. **Ya no bloquea el código**: se cargan desde `/admin`. Sin ninguno publicado, la sección no se pinta | Que la sección Trabajos aparezca |
| C2 | Testimonio: nombre y cargo reales, o se retira la sección | Publicación |
| C5 | **Actividades del RUC, régimen tributario y leyenda de impuestos en la proforma.** Ver `ESTADO.md`. Requiere confirmación de un contador | Facturar el primer proyecto, no publicar |
| ~~C3~~ | ~~Número de WhatsApp y texto previo del mensaje~~ | **Resuelto 2026-09-03.** Vive en `content/site.ts`, no en variable de entorno |
| C4 | Aviso de privacidad redactado y publicado en `/privacidad` | **Encender el bot Y recibir el primer dato del formulario.** El pie ya enlaza a esa ruta y todavía no existe: es lo primero antes de publicar |
