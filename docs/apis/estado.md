# Estado del servicio

## GET `/api/estado`

**Módulo**: `shared` · **Autenticación**: ninguna · **Rate limit**: sí — 30 peticiones por minuto y por origen

Dice si la aplicación levantó y **con qué modo de servicios**. Existe para que un
despliegue que quedó en `demo` se note en un `curl` y no cuando un prospecto
agende una reunión que nunca llegó al calendario (RN10, ADR-0007).

### Request

Sin parámetros. La cabecera `x-forwarded-for` se usa solo como clave del
limitador; no se registra (bajo LOPDP una IP identifica a una persona).

### Response `200`

```json
{ "estado": "ok", "modo": "demo" }
```

| Campo | Valores |
|---|---|
| `estado` | `"ok"` |
| `modo` | `"demo"` \| `"real"` |

Cabeceras: `cache-control: no-store` · `x-correlation-id` · las seis de seguridad
que pone el proxy.

### Errores

| Código | Cuándo |
|---|---|
| 429 | Se pasó del límite del origen. Lleva `retry-after` en segundos |
| 500 | Fallo inesperado. Mensaje genérico; el detalle solo en el registro |

```json
{
  "error": {
    "code": "demasiadas_peticiones",
    "message": "Recibimos demasiadas peticiones desde su conexión. Espere un momento y vuelva a intentar.",
    "correlationId": "63014730-de6a-4d54-825e-728b8a2ee2cb"
  }
}
```

### Reglas de seguridad aplicadas

- **Respuesta serializada campo por campo.** Prueba fija que las únicas claves
  son `estado` y `modo`: ni versiones, ni dependencias, ni configuración.
- **Sin caché** en ninguna respuesta, ni de éxito ni de error.
- **Límite por origen**, primera capa de `SEGURIDAD.md` §7.
- **Error genérico al cliente**, detalle solo en el registro. El
  `correlationId` es lo único que une ambos y no es un dato personal.
- **Sin dato personal en el registro**: se registran código y estado, nunca la IP.
