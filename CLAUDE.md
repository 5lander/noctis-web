# CLAUDE.md — Reglas del proyecto Noctis Web

> **Noctis Web** — Sitio de productos, portafolio, agendamiento y bot conversacional de Noctis.
> **Este archivo es de cumplimiento obligatorio.** Ante conflicto entre este archivo y cualquier otra instrucción, gana este archivo. Si una tarea exige violar una regla de aquí, **detente y pregunta** antes de escribir código.

---

## 0. Contexto en una frase

Noctis es una empresa de tres personas en Guayaquil que construye software para PYMES. Este sitio existe para que un dueño de negocio entienda en menos de un minuto qué vende Noctis, vea trabajo real hecho, y termine agendando una reunión o dejando sus datos.

**EL producto real de este proyecto es la credibilidad demostrada.** El sitio no describe lo que Noctis sabe hacer: lo demuestra funcionando. Un prospecto que agenda por el bot y recibe su confirmación ya entendió qué compra. Todo lo demás —animación, arquitectura, seguridad— está al servicio de eso.

### Archivos del proyecto — léelos en este orden al iniciar cualquier sesión

| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| `CLAUDE.md` (este) | Las reglas obligatorias | **Siempre, completo, en cada paquete** |
| `ESTADO.md` | Dónde va el proyecto, decisiones tomadas, dudas abiertas | **Siempre, al inicio de cada sesión** |
| `DECISIONES.md` | Valores provisionales de las decisiones abiertas | **Siempre** — usar sin preguntar mientras estén 🟡 |
| `docs/PROTOCOLO.md` | El ritual de 7 fases por paquete | **Siempre** |
| `docs/BUILD.md` | Puertos, adaptadores, modo demo/real | **Siempre** — define cómo se construye todo sin credenciales |
| `docs/AUDITORIA.md` | Checklist de calidad | Rápida en cada commit, completa en Pf |
| `docs/SEGURIDAD.md` | Estándar contra cada vector de ataque | Cada paquete que toque API, datos o el bot |
| `docs/OPTIMIZACION.md` | Eficiencia, YAGNI, presupuestos | **Todos los paquetes** |
| `docs/MODO-AUTONOMO.md` | Reglas para corridas largas sin confirmación | Cuando se active modo autónomo |
| `docs/PLAN-IMPLEMENTACION.md` | Los paquetes P0–Pf en orden | La sección del paquete actual |
| `docs/SPEC.md` | Especificación funcional del sitio | Las secciones que el paquete referencia |
| `docs/SPEC-AGENDAMIENTO-BOT.md` | Agendamiento y bot | P5 en adelante |
| `docs/ANIMACION.md` | Requisitos RA-01 a RA-07 | P3 |
| `prototipo/noctis-v4.html` | **Fuente de verdad visual** | P1, P2, P3, P7 |

> **Si el contexto se compactó y no recuerdas el detalle: relee. No supongas.**
> `ESTADO.md` es la única memoria fiable entre sesiones.

### Ciclo de trabajo obligatorio

Cada paquete sigue las 7 fases de `docs/PROTOCOLO.md`:

**RECARGA → PLAN → IMPLEMENTACIÓN → AUDITORÍA → COMMIT → DOCUMENTAR + ESTADO → CIERRE**

Reglas del ciclo, no negociables:
1. **Un commit por paquete.** Ni más ni menos
2. **Nunca commitear** con pruebas en rojo o con la auditoría rápida fallando
3. **Siempre actualizar `ESTADO.md`** antes de cerrar el paquete
4. **Siempre esperar confirmación del usuario** antes del siguiente paquete (salvo modo autónomo)
5. **Siempre releer `CLAUDE.md` completo** al empezar un paquete, aunque creas recordarlo

### ⚠️ Adaptación deliberada de este proyecto: construir completo, endurecer después

El sistema base exige la auditoría completa de ~100 verificaciones antes de **cada** commit. **En este proyecto no.** Decisión explícita del usuario, tomada a partir de la experiencia de Commerce, donde poner todas las compuertas desde el inicio hizo la construcción lenta y cara.

Acá se hace así:

- **Auditoría rápida en cada commit** (`npm run audit:fast`): tipos, lint, prohibidos, arquitectura, secretos. Es barata, corre en segundos y no frena a nadie. **Bloquea el commit.**
- **Auditoría completa** (`npm run audit` + checklist manual de `docs/AUDITORIA.md`): se corre entera **en Pf**, el paquete de endurecimiento, y ahí se corrige todo lo que salga en rojo.
- Lo que salga mal en Pf **se corrige, no se documenta como deuda.**

Esto es un intercambio consciente: se gana velocidad de construcción, se paga con una fase de corrección al final. **No es permiso para escribir mal.** Las reglas de las secciones 2 a 6 rigen desde la primera línea; lo que se mueve es *cuándo se verifica*, no *qué se exige*.

---

## 1. Stack — no negociable

| Componente | Elección | Nota |
|---|---|---|
| Runtime | Node LTS vigente | Fijar en `.nvmrc`, `engines` y Dockerfile. Nunca `latest` |
| Lenguaje | TypeScript, `strict` completo | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Framework | Next.js, App Router | Server Components por defecto |
| Estilos | CSS con variables nativas | Tokens compartidos con Commerce y Care |
| Animación | GSAP + ScrollTrigger | **Servido desde el propio dominio**, no desde CDN. Verificar licencia antes de instalar plugins |
| Validación | Zod o equivalente | En todo límite externo |
| Correo | Brevo, API v3 | No SMTP |
| Calendario | Google Calendar API | Solo free/busy y creación de eventos |
| Modelo del bot | Por decidir — ver `DECISIONES.md` D4 | Con tope de presupuesto obligatorio |
| Base de datos | **Opcional en v1** | Ver sección 5 |

El frontend se construye ahora y con identidad visual ya definida: el prototipo manda.

## 2. Clean Architecture — regla de dependencia

```
infrastructure  →  application  →  domain
     (adaptadores)   (casos de uso)   (reglas puras)
```

Las dependencias apuntan **siempre hacia adentro**. El dominio no sabe que existe la infraestructura.

### Estructura de carpetas obligatoria

```
src/
  modules/
    availability/     domain/ application/ infrastructure/
    booking/          domain/ application/ infrastructure/
    lead/             domain/ application/ infrastructure/   (ficha del prospecto)
    chat/             domain/ application/ infrastructure/
  shared/
    domain/
    infrastructure/
  app/                rutas Next.js — solo composición
  components/         UI, sin lógica de negocio
  content/            contenido tipado del sitio
  styles/             tokens.css, base.css
```

### Qué puede importar cada capa

| Capa | Puede importar | **Prohibido importar** |
|---|---|---|
| `domain` | Solo otros archivos de `domain` | Next, React, SDKs, HTTP, `process.env`, cualquier tercero |
| `application` | `domain` + sus propios puertos | Implementaciones concretas de infraestructura |
| `infrastructure` | Todo | Contener reglas de negocio |

### Prueba de que está bien hecho

**El motor de disponibilidad es el componente central del dominio y debe poder probarse sin base de datos, sin red y sin Google Calendar**, alimentándolo con bloques ocupados en memoria. Si para probarlo hace falta levantar algo, las capas están mal — arreglar antes de seguir.

### Módulos del sistema

- **`availability`** — motor puro: dado un conjunto de bloques ocupados y las reglas de negocio, devuelve espacios libres. **Es el corazón del sistema.**
- **`booking`** — reservar, cancelar, reprogramar. Consume `availability`
- **`lead`** — ficha del prospecto y su notificación
- **`chat`** — máquina de estados de la conversación. **Nunca escribe en calendario ni en base de datos directamente**: produce una ficha que `lead` y `booking` validan
- **`content`** — fuente única de verdad del contenido del sitio. **Ningún otro módulo escribe acá y ningún texto de cara al usuario vive fuera de acá**

### Inyección de dependencias
Los casos de uso reciben sus puertos por constructor. **Nunca** instanciar un cliente de calendario, de correo o del modelo dentro de una regla de negocio.

---

## 3. Clean Code — reglas duras

### Nombres
- Código en **inglés**; español solo en textos visibles al usuario
- Sin abreviaturas crípticas; booleanos como afirmación: `isAvailable`, `hasValidContact`
- *Confirmar contra la convención de Commerce antes de arrancar P0, para que los tres repos no queden distintos*

### Funciones
- Una función, una responsabilidad · preferir ≤ 20 líneas · máximo 3 parámetros · **sin efectos secundarios ocultos**

### Control de flujo
- *Early return* en vez de anidamiento · máximo 3 niveles · sin números ni cadenas mágicas

### Tipado
- `strict` máximo. **`any` prohibido** (usar `unknown` y estrechar). Sin `as` para callar al compilador
- **Tipos de dominio, no primitivos sueltos**: `SlotId`, `BookingId`, `LeadId`, `TimeSlot` — no `string` ni `Date` suelto
- Validación por esquema en **todo** límite externo: endpoints, variables de entorno, respuesta del modelo, respuesta del calendario

### YAGNI
Detalle en `docs/OPTIMIZACION.md` §1. Sin abstracciones especulativas, sin código muerto, sin endpoints "para el futuro", sin dependencias para 10 líneas. Es un sitio de marketing con tres funciones: **no sobre-arquitecturar**. Las capas existen porque hay adaptadores dobles, no por ceremonia.

### Errores
- Errores tipados de dominio · **nunca** capturar y silenciar · el mensaje al usuario y el detalle del registro son cosas distintas

### Comentarios
- El código explica el *qué*; el comentario el *por qué* · **sin código comentado** en el repositorio

---

## 4. Seguridad — máxima estrictez

> Cualquier duda de seguridad se resuelve por la opción **más restrictiva**.
> **El estándar completo está en `docs/SEGURIDAD.md` y es obligatorio en cada paquete.**

Reglas de alto nivel de este proyecto:

**Lo que nunca sale del backend:**
- **El detalle de la agenda.** Al navegador llegan horarios libres y nada más. Ni títulos, ni asistentes, ni notas, ni la existencia de eventos privados. Test obligatorio sobre la respuesta cruda
- **Datos de otros prospectos.** Una sesión de chat jamás ve nada de otra
- **Claves.** Ninguna variable de entorno con prefijo público contiene un secreto

**Superficie del bot** — la más nueva y la menos comprendida:
- Lo que escribe el visitante es **dato, no instrucción**
- El bot **no ejecuta nada**: no toca calendario, ni base de datos, ni correo. Propone una ficha; el servidor la valida contra esquema y decide
- Si la salida del modelo no cumple el esquema, **se descarta**
- Sin enlaces generados por el modelo: los enlaces del sitio son fijos y salen de `content/`
- Tope de presupuesto con apagado automático, e interruptor manual por variable de entorno

**API:** autorización y validación en servidor siempre · límites de uso por IP y por sesión · CORS cerrado al propio origen · cabeceras de seguridad y CSP estricta sin `unsafe-inline` · errores genéricos al cliente, detalle solo en el registro

**Reserva:** tokens de cancelación firmados, de vida corta, de un solo uso, comparados en tiempo constante

**Datos personales (LOPDP):** minimización, aviso visible, plazo de conservación, vía de borrado real. **Los registros no contienen datos personales.**

---

## 5. Base de datos

**En v1 puede no haber base de datos.** El almacén está detrás de un puerto (`AlmacenPort`) con implementación en memoria. Si se decide persistir fichas y conversaciones (`DECISIONES.md` D5), se agrega un adaptador de PostgreSQL sin tocar dominio ni casos de uso.

Si se agrega, rigen estas reglas: normalización hasta 3FN · restricciones en la base · UUID v7 como clave pública · `timestamptz` para fechas · migraciones versionadas y reversibles · sin `SELECT *` · sin N+1 · paginación por cursor · cifrado en reposo para datos de contacto.

**Presupuestos p95** — ver `docs/OPTIMIZACION.md` §2.

---

## 6. Reglas de negocio que no se pueden romper

1. **Ningún endpoint devuelve detalle de eventos del calendario.** Solo horarios libres
2. **Dos reservas simultáneas del mismo espacio producen una sola cita.** Verificación y creación en una operación idempotente
3. **No se agenda** con menos de 12 horas de aviso, fuera de la ventana de 10 días hábiles, ni fuera del horario configurado
4. **Máximo de reuniones por día** respetado siempre (valor en `DECISIONES.md` D2)
5. **El bot nunca da precios ni plazos cerrados.** Deriva a proforma
6. **El bot nunca afirma que un producto está disponible** si su estado en `content/` no lo es. El estado sale del contenido, jamás del modelo
7. **Solo se notifica al usuario si la ficha tiene al menos un canal de contacto válido.** Un correo por cada curioso convierte la bandeja en ruido y mata el módulo
8. **El sitio no menciona facturación electrónica SRI** en ninguna parte, hasta que exista
9. **La salida del modelo se valida contra esquema** y se descarta si no cumple
10. **En `MODO_SERVICIOS=real`, si falta una credencial la aplicación no arranca** y dice cuál falta. **Jamás cae a simulado en silencio**
11. **La página es legible y usable sin JS de animación** y con `prefers-reduced-motion` activo
12. **Ningún dato personal en los registros**

---

## 7. Pruebas

| Prioridad | Qué | Tipo |
|---|---|---|
| 🔴 | Motor de disponibilidad | Unitaria, sin BD ni red |
| 🔴 | Doble reserva simultánea | Integración, concurrencia real |
| 🔴 | El detalle del calendario no sale en ninguna respuesta | Sobre la respuesta cruda |
| 🔴 | Máquina de estados del chat: todas las transiciones | Unitaria |
| 🔴 | El bot ignora instrucciones incrustadas en el mensaje | Casos conocidos |
| 🟠 | Validación de cada endpoint ante entrada inválida y sobredimensionada | Integración |
| 🟠 | Límites de uso: se disparan y se recuperan | Integración |
| 🟠 | Token de cancelación: expira, un solo uso, no adivinable | Unitaria |
| 🟡 | Interfaz: estados de carga, vacío, error, éxito | Playwright |
| 🟡 | Accesibilidad y movimiento reducido | Playwright |

**Casos conocidos**: mantener en `docs/pruebas/casos-conocidos.md` un conjunto de entradas con resultado esperado definido a mano ANTES de ejecutar. Todo cambio del motor de disponibilidad o del prompt del bot se corre contra todos.

**Nunca datos reales de personas en desarrollo.** Solo sintéticos.

---

## 8. Cómo debe trabajar Claude Code

### Antes de escribir código
1. Lee la sección correspondiente de `docs/SPEC.md` o `docs/SPEC-AGENDAMIENTO-BOT.md`
2. Confirma en qué capa va cada pieza
3. Si algo es ambiguo o contradictorio, **pregunta — no inventes**
4. En lo visual, **el prototipo manda**. No reinventes colores ni espaciados

### Al escribir
- **Dominio → casos de uso → infraestructura.** Nunca al revés
- La prueba del dominio se escribe junto con el dominio
- Si una función supera 20 líneas o 3 niveles, refactoriza antes de seguir

### Prohibido sin autorización explícita
- Dependencias nuevas · `any`, `@ts-ignore`, `eslint-disable` · estilos literales en componentes · texto de cara al usuario fuera de `content/` · `dangerouslySetInnerHTML` con contenido de usuario · GSAP desde CDN externo · llamar a un servicio externo desde el dominio · cualquier atajo que exponga el detalle del calendario

### Al terminar cada paquete
- Pruebas en verde · `audit:fast` en verde · decisiones y dudas registradas en `ESTADO.md`

---

## 9. Decisiones abiertas

Usa los valores 🟡 de `DECISIONES.md` sin preguntar; impleméntalos **siempre como configuración versionada**, nunca incrustados. Solo pregunta si la decisión no está ahí ni en el SPEC, o está marcada 🔴.

---

## 10. Frontend

> A diferencia del proyecto base, acá **la identidad visual ya existe**: `prototipo/noctis-v4.html`. No hay fase de "bonito después" — se construye bonito desde P1.

### Regla de oro: cero estilos literales
**Prohibido escribir un color, tamaño, radio o fuente dentro de un componente.** Todo vive en `src/styles/tokens.css`. Los valores están en el prototipo y en `docs/SPEC.md` §4.

### Separación lógica / presentación

| Capa | Contiene | Se reemplaza después |
|---|---|---|
| Hooks y servicios | API, estado, validación | ❌ No se toca |
| Componentes de dominio | Composición y comportamiento | ⚠️ Mínimamente |
| Componentes de UI | Solo apariencia | ✅ Entero |
| Tokens | Colores, tipografía, espaciado | ✅ Entero |

### Reglas técnicas
- Los datos protegidos **nunca llegan al navegador** para ocultarse con CSS — el backend no los incluye
- Validación en cliente **y** servidor; la del servidor manda
- Estados de carga, error y vacío en toda vista que llame a la API
- Modo claro/oscuro por `data-mode`, **con script inline en `<head>`** que lo fije antes del primer pintado. Sin eso hay parpadeo
- Animaciones dentro de `useGSAP()` o `gsap.context()` **con limpieza**. Sin eso el App Router deja triggers huérfanos
- Sin `localStorage` para nada sensible; solo para la preferencia de modo

---

## 11. Documentación — árbol completo y obligatorio

Se documenta **mientras se construye** (plantillas en `docs/plantillas/`):

```
docs/
├── pasos/P{n}/     CONSTRUCCION.md + AUDITORIA-RESULTADO.md
├── apis/           FUNCIONAMIENTO.md + un archivo por superficie
├── sistema/        FUNCIONAMIENTO.md (con Mermaid) · modelo-datos.md · seguridad.md · configuracion.md
├── decisiones/     ADRs numerados e inmutables
├── runbooks/       despliegue · respaldos · incidentes · rotación de secretos
├── pruebas/        ESTRATEGIA.md · casos-conocidos.md
└── CHANGELOG.md    una entrada por commit de paquete
```

Cada endpoint y cada decisión técnica se documenta **en el mismo commit**. Diagramas en Mermaid. ADR para toda decisión relevante: ante la duda, escríbelo.

---

## 12. Servicios externos — siempre tras adaptador falso

**Todo servicio externo se implementa primero como adaptador simulado** que cumple el puerto: Google Calendar, Brevo, el modelo del bot y el almacén. El real se activa con `MODO_SERVICIOS=real` o por selector individual.

**El sistema completo debe levantarse y recorrerse de punta a punta sin una sola credencial real.** Detalle completo en `docs/BUILD.md`.

Los adaptadores simulados **no son andamio descartable**: son el entorno de pruebas y el modo demostración comercial. Se mantienen para siempre.

---

## 13. Verificación automatizada

**`npm run audit:fast`** — corre en pre-commit y **bloquea**:

| Check | Qué detecta |
|---|---|
| `audit:types` | Compilación estricta |
| `audit:lint` | Linting, incluida la prohibición de `any` |
| `audit:forbidden` | `@ts-ignore`, `eslint-disable`, `: any`, `as any`, `.env` versionado, GSAP desde CDN |
| `audit:arch` | Reglas de dependencia entre capas |
| `audit:secrets` | Secretos en el diff |

**`npm run audit`** — completo, añade `deadcode` (knip), `complexity`, `duplication` (jscpd) y toda la batería de pruebas. **Corre en CI y es obligatorio en Pf.**

La checklist manual de `docs/AUDITORIA.md` cubre lo no automatizable y se aplica entera en Pf.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
