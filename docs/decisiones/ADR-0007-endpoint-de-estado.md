# ADR-0007: `GET /api/estado` expone el modo de servicios

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P0 |
| Decisores | Claude Code |

## Contexto

RN10 es una de las reglas duras del proyecto: *"En `MODO_SERVICIOS=real`, si
falta una credencial la aplicación no arranca y dice cuál falta. **Jamás cae a
simulado en silencio**"*. `docs/BUILD.md` §2 lo llama, con razón, "un desastre
invisible".

Una regla así necesita una forma de comprobarse después de desplegar. Si no, la
única manera de descubrir que producción quedó en `demo` es que un prospecto
agende una reunión que nunca llegó al calendario.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Sin endpoint | Nada que exponer | La regla más importante del despliegue no se puede verificar |
| `{ estado: "ok" }` a secas | Máxima discreción | No distingue una aplicación viva y bien configurada de una viva y en modo demostración |
| `{ estado: "ok", modo }` | Verifica RN10 en un `curl` | Revela si el sitio corre contra servicios reales |

## Decisión

**`GET /api/estado` devuelve `{ estado, modo }`** y nada más.

## Consecuencias

- El paso de verificación del runbook de despliegue es una sola línea, y falla
  ruidosamente si el despliegue quedó en `demo`.
- Lo que se revela no es un secreto: `MODO_SERVICIOS` está en `.env.example`, y
  desde P4 el propio sitio muestra un aviso cuando corre en modo demostración,
  porque la demostración es un argumento comercial (`docs/BUILD.md` §1).
- **Lo que el endpoint no devuelve**: versiones, dependencias, configuración,
  credenciales, ni estado de los servicios externos. Hay prueba que fija que las
  únicas claves de la respuesta son `estado` y `modo`.
- Lleva límite por origen y `Cache-Control: no-store`, como toda superficie.
- De paso es la prueba de integración de toda la infraestructura de P0: entorno
  validado, limitador, formato único de error y registro con correlación.
