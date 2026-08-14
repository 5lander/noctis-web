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

## Flujo de reserva

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
