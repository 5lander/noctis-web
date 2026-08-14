# APIs — visión general

Todas las superficies son internas: **no hay API pública**. CORS cerrado al propio origen.

| Superficie | Archivo | Paquete | Estado |
|---|---|---|---|
| Estado del servicio | `estado.md` | P0 | ✅ construida |
| Disponibilidad y reserva | `agendamiento.md` | P6 | ⬜ pendiente |
| Chat y ficha de prospecto | `chat.md` | P8 | ⬜ pendiente |
| Formulario de contacto | `contacto.md` | P10 | ⬜ pendiente |

Reglas comunes: validación por esquema en servidor · límite de uso por endpoint · error genérico al cliente y detalle solo en el registro · **nunca una traza al navegador**.

Cada endpoint se documenta con `docs/plantillas/API-ENDPOINT.md` **en el mismo commit** que lo crea.

## Lo que toda superficie recibe sin pedirlo (desde P0)

`src/proxy.ts` corre antes que cualquier ruta y deja puestas tres cosas, para que
una ruta nueva nazca protegida en vez de depender de que alguien se acuerde:

1. Las seis cabeceras de seguridad de `SEGURIDAD.md` §4.4, con **CSP estricta y
   nonce por petición** (ADR-0004).
2. Un **identificador de correlación** generado en el servidor. El que mande el
   cliente se descarta: aceptarlo dejaría forjar entradas en el registro.
3. El nonce, reenviado a la petición.

## Formato único de error

Toda respuesta de error tiene esta forma y ninguna otra:

```json
{ "error": { "code": "…", "message": "…", "correlationId": "…" } }
```

- El `code` sale del catálogo de `src/content/errors.ts`, que es donde vive todo
  texto de cara al usuario.
- El `message` es genérico por diseño: sin trazas, sin rutas de archivo, sin
  versiones (`SEGURIDAD.md` §8).
- El `correlationId` es lo único que une la pantalla con el registro, y no
  identifica a nadie.
