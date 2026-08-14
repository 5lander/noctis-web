# Configuración

## Selectores de adaptador

| Variable | Valores | Efecto |
|---|---|---|
| `MODO_SERVICIOS` | `demo` \| `real` | Selector global |
| `CALENDARIO_ADAPTER` | `fake` \| `real` | Sobrescribe el global |
| `CORREO_ADAPTER` | `fake` \| `real` | Sobrescribe el global |
| `CHAT_ADAPTER` | `fake` \| `real` | Sobrescribe el global |
| `ALMACEN_ADAPTER` | `memoria` \| `postgres` | Sobrescribe el global |

Los selectores individuales permiten pasar a real **un servicio a la vez** (P12).

## Interruptores

| Variable | Efecto |
|---|---|
| `BOT_ACTIVO` | Oculta el widget sin desplegar |
| `AGENDADOR_ACTIVO` | Oculta el agendador y deja el formulario |

## Regla

Con `MODO_SERVICIOS=real`, si falta una credencial la aplicación **no arranca** y nombra la que falta. **Jamás cae a simulado en silencio.**

Configuración de negocio (horario, duración, márgenes, topes) en `config/`, versionada. Valores en `DECISIONES.md`.
