# ESTADO.md — Memoria del proyecto Noctis Web

> Este archivo sobrevive a las compactaciones de contexto. **Se actualiza al cerrar cada paquete, sin excepción.**
> Una sesión nueva retoma leyendo: `CLAUDE.md` → `ESTADO.md` → `DECISIONES.md` → `docs/PLAN-IMPLEMENTACION.md`.

## Dónde va el proyecto

**Paquete actual:** ninguno — proyecto sin iniciar
**Último commit de paquete:** —
**Fecha de última actualización:** —

## Paquetes

| # | Paquete | Estado |
|---|---|---|
| P0 | Fundación | ⬜ Pendiente |
| P1 | Sistema de diseño y modo claro/oscuro | ⬜ Pendiente |
| P2 | Contenido tipado y secciones estáticas | ⬜ Pendiente |
| P3 | Capa de animación GSAP | ⬜ Pendiente |
| P4 | Puertos, adaptadores simulados y selector de modo | ⬜ Pendiente |
| P5 | Motor de disponibilidad (dominio puro) | ⬜ Pendiente |
| P6 | API de agendamiento | ⬜ Pendiente |
| P7 | Agendador en la interfaz | ⬜ Pendiente |
| P8 | Bot conversacional | ⬜ Pendiente |
| P9 | Correo transaccional | ⬜ Pendiente |
| P10 | Formulario de contacto y portafolio | ⬜ Pendiente |
| Pf | Endurecimiento y auditoría completa | ⬜ Pendiente |
| P12 | Conexión de servicios reales | ⬜ Pendiente |

Estados: ⬜ Pendiente · 🔄 En curso · ✅ Cerrado

## Decisiones tomadas durante la construcción

*(ADRs en `docs/decisiones/`. Acá solo el índice y la razón en una línea.)*

| Fecha | Decisión | ADR |
|---|---|---|
| — | — | — |

## Dudas abiertas

*(Lo que Claude Code no pudo resolver solo y espera respuesta del usuario.)*

| # | Duda | Paquete | Estado |
|---|---|---|---|
| — | — | — | — |

## Notas para la próxima sesión

- **El camino crítico del proyecto es P5.** El motor de disponibilidad es el componente central del dominio: si queda mal, la prueba de arquitectura falla y P6, P7 y P8 se construyen sobre arena. Se prueba sin base de datos, sin red y sin Google Calendar
- **Este proyecto construye completo primero y endurece en Pf.** Ver la adaptación deliberada en `CLAUDE.md` §0
- **Los adaptadores simulados no se descartan.** Son el entorno de pruebas y el modo demostración comercial
