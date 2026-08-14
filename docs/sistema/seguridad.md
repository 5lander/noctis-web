# Seguridad — vista del sistema

El estándar completo está en `docs/SEGURIDAD.md`. Acá solo el mapa de lo específico de este proyecto.

| Activo | Amenaza | Defensa | Desde |
|---|---|---|---|
| Agenda del equipo | Filtración del detalle de eventos | Solo free/busy; el detalle nunca sale del backend; test sobre respuesta cruda | P6 |
| Espacios de reunión | Doble reserva | Verificar y crear en una operación idempotente | P6 |
| Enlaces de cancelación | Adivinar o reutilizar el token | Firmado, vida corta, un solo uso, comparación en tiempo constante | P6 |
| El bot | Inyección de instrucciones | El texto del visitante es dato; el bot no ejecuta nada; salida validada por esquema | P8 |
| Presupuesto del modelo | Uso malintencionado o bucle | Límites por sesión e IP, tope mensual, apagado automático, interruptor manual | P8 |
| Datos de prospectos | Retención indebida | Minimización, plazo de conservación, borrado real, registros sin datos personales | P8 |

## Lo que ya está puesto (P0)

| Amenaza | Defensa | Dónde |
|---|---|---|
| XSS | CSP estricta con nonce por petición, sin `unsafe-inline` ni `unsafe-eval` en producción | `http/security-headers.ts` · ADR-0004 |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` | `http/security-headers.ts` |
| Olfateo de tipo | `X-Content-Type-Options: nosniff` | `http/security-headers.ts` |
| Degradación a HTTP | HSTS con `preload` | `http/security-headers.ts` |
| Fuga por `Referer` | `Referrer-Policy: strict-origin-when-cross-origin` | `http/security-headers.ts` |
| Abuso de hardware | `Permissions-Policy` con cámara, micrófono y ubicación apagados | `http/security-headers.ts` |
| Banners de versión | `poweredByHeader: false` | `next.config.ts` |
| Denegación de servicio | Límite por origen, primera capa de §7 | `http/rate-limit.ts` |
| Fuga por errores | Formato único, mensaje genérico, cero trazas al navegador | `http/api-error.ts` |
| Inyección en el registro | Saltos de línea y caracteres de control saneados en todo texto | `logging/logger.ts` |
| Correlación forjada | El identificador se genera en el servidor; el del cliente se descarta | `proxy.ts` |
| Dato personal en registro | Lista de campos prohibidos aplicada por nombre; la IP no se registra | `logging/logger.ts` · `http/client-ip.ts` |
| Secreto versionado | `audit:secrets` sobre el diff preparado y sobre lo versionado | `scripts/audit-secrets.mjs` |
| Configuración mala en producción | Entorno validado por esquema al arrancar; `GET /api/estado` dice el modo | `config/environment.ts` · ADR-0007 |

## Lo que de `SEGURIDAD.md` no aplica a este proyecto

`docs/SEGURIDAD.md` viene del sistema base y cubre un producto con cuentas,
multi-tenencia y pagos. Acá **no hay login, ni tenants, ni back office, ni carga
de archivos, ni webhooks entrantes**: el sitio no autentica a nadie.

Queda sin aplicar mientras eso siga así: §2 (autenticación y fuerza bruta de
login), §3 en su parte de tenants y roles, §5 (carga de archivos), §6 (webhooks),
y la mayor parte del catálogo de auditoría de §10, que enumera eventos de
cuentas, vacantes y pagos que este sistema no tiene.

Lo que sí rige entero: §1 inyección, §4 web clásico, §7 abuso, §8 datos, §9
cadena de suministro y §11 verificación continua.

**Esto no se decide paquete por paquete**: si algún día el sitio autentica a
alguien, esas secciones vuelven a regir completas y sin discusión.
