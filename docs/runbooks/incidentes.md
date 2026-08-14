# Runbook — incidentes

> Comandos exactos, sin prosa. Se completa al construir el paquete correspondiente.

## Cuándo se usa

## Pasos

```bash
# pendiente
```

## Verificación

## Si algo sale mal

## Incidentes propios de este proyecto

| Síntoma | Causa probable | Primera acción |
|---|---|---|
| Doble reserva en el calendario | Falló la verificación previa a crear | Cancelar una, revisar registro de idempotencia |
| El agendador no muestra espacios | Google Calendar caído o credencial vencida | Verificar cortacircuitos; el sitio debe caer al formulario |
| Gasto del modelo disparado | Bucle o uso malintencionado | Bajar `BOT_ACTIVO`; revisar límites por IP |
| Correos en spam | SPF, DKIM o DMARC mal configurados | Verificar registros del dominio |
| El bot dijo algo indebido | Guion o guardas insuficientes | Bajar `BOT_ACTIVO`, revisar transcripción, ajustar casos conocidos |
