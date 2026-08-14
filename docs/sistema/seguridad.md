# Seguridad — vista del sistema

El estándar completo está en `docs/SEGURIDAD.md`. Acá solo el mapa de lo específico de este proyecto.

| Activo | Amenaza | Defensa |
|---|---|---|
| Agenda del equipo | Filtración del detalle de eventos | Solo free/busy; el detalle nunca sale del backend; test sobre respuesta cruda |
| Espacios de reunión | Doble reserva | Verificar y crear en una operación idempotente |
| Enlaces de cancelación | Adivinar o reutilizar el token | Firmado, vida corta, un solo uso, comparación en tiempo constante |
| El bot | Inyección de instrucciones | El texto del visitante es dato; el bot no ejecuta nada; salida validada por esquema |
| Presupuesto del modelo | Uso malintencionado o bucle | Límites por sesión e IP, tope mensual, apagado automático, interruptor manual |
| Datos de prospectos | Retención indebida | Minimización, plazo de conservación, borrado real, registros sin datos personales |
