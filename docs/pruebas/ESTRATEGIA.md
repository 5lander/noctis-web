# Estrategia de pruebas

Prioridades en `CLAUDE.md` §7.

## Principios

- El motor de disponibilidad se prueba **sin base de datos, sin red y sin Google Calendar**. Es la prueba de que las capas están bien
- La doble reserva se prueba con **concurrencia real**, no simulada en secuencia
- El bot se prueba contra un conjunto de casos conocidos que incluye **intentos de inyección de instrucciones**
- Nunca datos reales de personas. Solo sintéticos

## Capas

| Tipo | Alcance | Corre en |
|---|---|---|
| Unitarias | Dominio: disponibilidad, máquina de estados, tokens | Cada commit |
| Integración | Endpoints, límites, concurrencia, adaptadores simulados | Cada commit |
| Extremo a extremo | Recorridos: agendar, conversar, contactar | CI |
| Accesibilidad | Teclado, movimiento reducido, contraste | Pf |
