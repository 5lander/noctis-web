# Runbook — despliegue

> Comandos exactos, sin prosa. Se completa al construir el paquete correspondiente.
> **Dónde se despliega sigue sin decidirse (D9).** Lo de abajo es lo que ya vale
> en cualquier hosting de Node.

## Cuándo se usa

Al publicar una versión, y al verificar que una versión publicada quedó bien.

## Requisitos

- Node **24.19.0** (`.nvmrc`, y `engines` lo exige)
- Ninguna credencial: en `MODO_SERVICIOS=demo` el sistema completo funciona solo

## Pasos

```bash
npm ci
npm run audit          # tipos, lint, prohibidos, arquitectura, secretos,
                       # complejidad, código muerto, duplicación, deps y pruebas
npm run build
npm start              # por defecto en :3000
```

## Verificación

```bash
# 1. Está en pie, y en el modo que se esperaba (RN10)
curl -s https://{dominio}/api/estado
# → {"estado":"ok","modo":"demo"}   ← si esperabas "real", el despliegue está mal

# 2. Las seis cabeceras de seguridad están puestas
curl -sI https://{dominio}/ | grep -iE \
  "content-security-policy|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy"

# 3. La CSP no aflojó: en producción no puede aparecer unsafe-inline ni unsafe-eval
curl -sI https://{dominio}/ | grep -i content-security-policy | grep -c unsafe
# → 0

# 4. No se anuncia el framework
curl -sI https://{dominio}/ | grep -ci x-powered-by
# → 0

# 5. El límite por origen se aplica
for i in $(seq 1 35); do curl -s -o /dev/null -w "%{http_code} " https://{dominio}/api/estado; done
# → treinta 200 y luego 429
```

## Si algo sale mal

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| La aplicación no arranca y el registro dice `ConfigurationError` | Una variable de entorno con un valor que el esquema no acepta | El mensaje nombra la variable. Corregir y volver a desplegar. **No** quitar la validación |
| `/api/estado` responde `modo: "demo"` en producción | `MODO_SERVICIOS` no llegó al proceso | Revisar el gestor de secretos del hosting. Nunca se cae a simulado en silencio: si dice `demo`, es que se configuró `demo` |
| La página se ve pero no responde a clics | La CSP bloqueó los scripts de Next | El proxy tiene que reenviar la política en las cabeceras de la petición y `layout.tsx` declarar `dynamic = 'force-dynamic'`. Ver ADR-0004 |
| El límite deja pasar más de lo esperado | Hay varias réplicas | El conteo es en memoria y por instancia (ADR-0006). Con réplicas, el límite efectivo se multiplica. Si el hosting escala horizontalmente, hace falta un contador compartido |

## Pendientes de este runbook

- Dominio, hosting y variables del proveedor: D9
- Rotación de secretos: `rotacion-secretos.md`, cuando existan credenciales (P12)
