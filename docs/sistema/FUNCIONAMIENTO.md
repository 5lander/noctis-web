# Funcionamiento del sistema

## Visión

```mermaid
graph LR
  V[Visitante] --> UI[Next.js App Router]
  UI --> API[Route Handlers]
  API --> APP[Casos de uso]
  APP --> DOM[Dominio: motor de disponibilidad]
  APP --> PORT[Puertos]
  PORT --> FAKE[Adaptadores simulados]
  PORT --> REAL[Adaptadores reales]
  REAL --> GC[Google Calendar]
  REAL --> BR[Brevo]
  REAL --> LLM[Modelo del bot]
```

El selector `MODO_SERVICIOS` decide qué implementación se inyecta. **El sistema completo se recorre de punta a punta sin una sola credencial.**

## Lo construido hasta hoy — P0, la fundación

Existe el esqueleto y las cinco piezas transversales que toda superficie usa. No
hay dominio todavía: llega en P5.

```mermaid
flowchart TD
  P[Petición] --> PX["src/proxy.ts"]
  PX -->|nonce + correlación| RT["Route handler"]
  PX -->|6 cabeceras + CSP| RESP["Respuesta"]
  RT --> ENV["environment.ts<br/>entorno validado por esquema"]
  RT --> RL["rate-limit.ts<br/>límite por origen"]
  RT --> OK["Respuesta 200"]
  RL -->|se pasó| ERR["api-error.ts<br/>formato único"]
  ERR --> LOG["logger.ts<br/>JSON, sin datos personales"]
  RT -->|falla| ERR
  OK --> RESP
  ERR --> RESP
```

| Pieza | Archivo | Qué garantiza |
|---|---|---|
| Proxy de entrada | `src/proxy.ts` | Una ruta nueva nace con cabeceras de seguridad, CSP con nonce y correlación. No hay forma de olvidarse |
| Entorno | `shared/infrastructure/config/environment.ts` | Único punto que lee `process.env`. Configuración mala = no arranca |
| Registro | `shared/infrastructure/logging/logger.ts` | RN12 por construcción: los campos personales salen `[redactado]` aunque alguien los registre por descuido |
| Formato de error | `shared/infrastructure/http/api-error.ts` | Un solo formato de error en todo el sistema; mensaje genérico afuera, detalle solo adentro |
| Limitador | `shared/infrastructure/http/rate-limit.ts` | Primera capa de `SEGURIDAD.md` §7, por origen |

### La regla de dependencia es ejecutable

```mermaid
flowchart RL
  I["infrastructure<br/>adaptadores"] --> A["application<br/>casos de uso"] --> D["domain<br/>reglas puras"]
  C["content<br/>textos del sitio"]
```

`audit:arch` (dependency-cruiser) corre dentro de `audit:fast`, que bloquea el
commit. Cuatro reglas, todas en `error`:

| Regla | Qué prohíbe |
|---|---|
| `dominio-solo-dominio` | Que `domain/` importe cualquier cosa que no sea `domain/`: ni Next, ni React, ni SDKs, ni módulos de Node |
| `aplicacion-sin-infraestructura` | Que `application/` importe implementaciones concretas, rutas o componentes |
| `contenido-es-hoja` | Que `content/` importe nada. Si importa algo, dejó de ser contenido |
| `sin-ciclos` | Ciclos de imports |

`audit:forbidden` completa lo que un grafo de imports no ve: `process.env` dentro
de `domain/`, `any`, supresiones de compilador o linter, `dangerouslySetInnerHTML`,
scripts desde CDN, SQL interpolado y archivos `.env` versionados.

## Flujo de reserva *(llega en P6)*

```mermaid
sequenceDiagram
  Visitante->>API: GET /api/disponibilidad
  API->>Calendario: bloques ocupados
  API->>Dominio: calcular espacios libres
  API-->>Visitante: solo horarios
  Visitante->>API: POST /api/reservar
  API->>Calendario: verificar de nuevo
  API->>Calendario: crear evento (idempotente)
  API->>Correo: encolar confirmaciones
  API-->>Visitante: confirmación
```

La doble verificación antes de crear es lo que impide la doble reserva.

## Regla que ordena el diseño

El bot **no ejecuta nada**. Produce una ficha; el servidor la valida contra esquema y decide. Por eso el módulo `chat` no depende de `booking` ni de `lead`: entrega datos, no órdenes.
