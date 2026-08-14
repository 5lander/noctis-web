# Configuración

Todo lo de abajo se valida por esquema al cargar la aplicación, en
`src/shared/infrastructure/config/environment.ts`. Es el **único** lugar del
sistema donde se lee `process.env`: si la configuración está mal, la aplicación
no arranca en vez de fallar en la cara de un visitante.

Plantilla versionada: `.env.example`. Los archivos `.env*` reales nunca se
versionan (`SEGURIDAD.md` §9) y `audit:forbidden` falla si alguno aparece
rastreado por git.

## Selectores de adaptador

| Variable | Valores | Por defecto | Efecto |
|---|---|---|---|
| `MODO_SERVICIOS` | `demo` \| `real` | `demo` | Selector global |
| `CALENDARIO_ADAPTER` | `fake` \| `real` | sigue al global | Sobrescribe el global |
| `CORREO_ADAPTER` | `fake` \| `real` | sigue al global | Sobrescribe el global |
| `CHAT_ADAPTER` | `fake` \| `real` | sigue al global | Sobrescribe el global |
| `ALMACEN_ADAPTER` | `memoria` \| `postgres` | sigue al global | Sobrescribe el global |

Los selectores individuales permiten pasar a real **un servicio a la vez** (P12).
La resolución de cada selector contra el global llega en P4, junto con los
puertos; hoy el esquema los acepta y los tipa.

## Interruptores

| Variable | Valores | Por defecto | Efecto |
|---|---|---|---|
| `BOT_ACTIVO` | `true` \| `false` | `false` | Oculta el widget sin desplegar |
| `AGENDADOR_ACTIVO` | `true` \| `false` | `true` | Oculta el agendador y deja el formulario |

## Regla

Con `MODO_SERVICIOS=real`, si falta una credencial la aplicación **no arranca** y
nombra la que falta. **Jamás cae a simulado en silencio** (RN10).

Construido en P4 y verificado contra el build, no solo en pruebas:

```bash
$ MODO_SERVICIOS=real npx next build
El servicio "calendar" está configurado en modo real y faltan estas variables:
GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY.
La aplicación no arranca en simulado sin avisar (RN10).
```

Con las credenciales puestas **también** se detiene hasta P12, porque el
adaptador real todavía no existe: seguir sería usar el simulado sin avisar.

## Credenciales por servicio

Los nombres viven en `src/shared/infrastructure/config/credentials.ts`. Se exigen
**solo** del servicio que esté en modo real.

| Servicio | Variables |
|---|---|
| Calendario | `GOOGLE_CALENDAR_ID` · `GOOGLE_SERVICE_ACCOUNT_EMAIL` · `GOOGLE_PRIVATE_KEY` |
| Correo | `BREVO_API_KEY` · `BREVO_SENDER_EMAIL` |
| Modelo del bot | `MODELO_API_KEY` · `MODELO_NOMBRE` · `MODELO_TOPE_MENSUAL_USD` |
| Almacén | `DATABASE_URL` |

Una variable vacía cuenta como ausente.

Se comprueba después de desplegar con `GET /api/estado`, que devuelve el modo
activo (ADR-0007).

Configuración de negocio (horario, duración, márgenes, topes) en `config/`,
versionada. Valores en `DECISIONES.md`. Llega con P5.

## Comandos

| Comando | Qué hace | Cuándo corre |
|---|---|---|
| `npm run dev` | Servidor de desarrollo | — |
| `npm run build` · `npm start` | Build y servidor de producción | Despliegue |
| `npm test` | Pruebas | Cada cambio, y dentro de `audit` |
| `npm run audit:fast` | Tipos · lint · prohibidos · arquitectura · secretos | **Pre-commit, bloquea** |
| `npm run audit` | Lo anterior + complejidad, código muerto, duplicación, dependencias y pruebas | CI y Pf |

Detalle de cada check en `CLAUDE.md` §13.

### Cómo se hacen cumplir los umbrales de `OPTIMIZACION.md` §8

| Check de la auditoría | Herramienta | Dónde corre |
|---|---|---|
| I1 código muerto | `knip` | `audit:deadcode` |
| I2 complejidad ≤10, profundidad ≤3, funciones ≤40 líneas, ≤3 parámetros | ESLint | `audit:complexity` **y además** `audit:lint`, o sea en cada commit |
| I3 duplicación < 3 % | `jscpd` | `audit:duplication` |

Los umbrales de I2 viven una sola vez, en `eslint.complexity-rules.mjs`, y los
usan las dos configuraciones. Duplicarlos era garantizar que un día se separen.
