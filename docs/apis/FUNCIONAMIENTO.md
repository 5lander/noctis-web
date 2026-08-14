# APIs — visión general

Todas las superficies son internas: **no hay API pública**. CORS cerrado al propio origen.

| Superficie | Archivo | Paquete |
|---|---|---|
| Disponibilidad y reserva | `agendamiento.md` | P6 |
| Chat y ficha de prospecto | `chat.md` | P8 |
| Formulario de contacto | `contacto.md` | P10 |

Reglas comunes: validación por esquema en servidor · límite de uso por endpoint · error genérico al cliente y detalle solo en el registro · **nunca una traza al navegador**.

Cada endpoint se documenta con `docs/plantillas/API-ENDPOINT.md` **en el mismo commit** que lo crea.
