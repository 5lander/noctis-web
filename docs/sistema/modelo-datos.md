# Modelo de datos

**En v1 puede no haber base de datos.** El almacén está tras `AlmacenPort`, con implementación en memoria.

Entidades del dominio (existen como tipos aunque no se persistan):

- `TimeSlot` — inicio, fin, zona horaria
- `Booking` — espacio, datos de contacto, estado, token de cancelación
- `Lead` — ficha del prospecto según `docs/SPEC-AGENDAMIENTO-BOT.md` §3.2
- `ChatSession` — estado de la máquina, turnos, límites consumidos

Si se decide persistir (D5), se agrega un adaptador de PostgreSQL **sin tocar dominio ni casos de uso**. Reglas en `CLAUDE.md` §5.
