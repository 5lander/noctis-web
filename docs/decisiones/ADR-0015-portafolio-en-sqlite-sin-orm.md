# ADR-0015 — El portafolio se guarda en SQLite con `node:sqlite`, sin ORM

**Fecha:** 2026-08-16 · **Estado:** aceptada · **Reemplaza a:** nada · **Relacionada con:** ADR-0006, D5

## Contexto

La auditoría UX marcó como hallazgo crítico que la sección de trabajos publicaba
seis clientes inventados con nombre, tipo y año, bajo un titular que afirmaba que
ya estaban en línea, y con un párrafo en la misma pantalla admitiendo que eran
marcadores de posición. Los dos daños posibles eran caros: si el visitante creía
los nombres, el sitio publicaba clientes que no existen; si leía el párrafo,
entendía que la empresa no tenía nada que mostrar.

El pedido fue que los trabajos y los clientes dejaran de ser una lista escrita a
mano y pasaran a cargarse desde un panel, cada vez que se entrega un proyecto. Y
llegó con una pregunta que condiciona todo lo demás:

> **¿me lo soporta el webhosting?**

## Decisión

El portafolio vive detrás de un puerto —`PortfolioRepositoryPort`— con dos
adaptadores: **SQLite sobre el módulo `node:sqlite` que trae el propio Node**, y
memoria para pruebas y modo demostración.

**Sin Prisma y sin ningún ORM.**

## Por qué

La respuesta a «¿me lo soporta el hosting?» depende de una sola cosa: qué hay
que compilar o generar en el servidor.

| Opción | Qué arrastra | Riesgo en hosting compartido |
|---|---|---|
| Prisma | motor de consulta nativo + paso `prisma generate` en el build | Alto: el binario depende de la libc y de la arquitectura, y el paso de generación falla o se olvida |
| `better-sqlite3` | módulo nativo con `node-gyp` | Alto: sin `prebuild` para esa combinación de Node y plataforma, hay que compilar en el servidor |
| **`node:sqlite`** | **nada** | **Ninguno: viene dentro de Node** |

`package.json` ya exige `node >=24.19.0`, y `node:sqlite` es parte de esa versión.
Cero dependencias nuevas, cero compilación, cero paso de build. Es exactamente el
mismo razonamiento de ADR-0006 para el registro, el limitador y el pre-commit.

Lo único que este adaptador le exige al hosting es **disco escribible y
persistente**:

- **Sirve**: VPS, plan Node de cPanel/Passenger, Railway, Render, Fly, Docker con volumen.
- **No sirve**: despliegue sin servidor (Vercel, Netlify Functions), donde el
  disco se borra en cada invocación.

Para el segundo caso no hay que reescribir nada: se escribe un
`PostgresPortfolioRepository` detrás del mismo puerto y se cambia una variable de
entorno. Ni el dominio ni la página se enteran. Es la misma razón por la que
`StorePort` existe (D5).

## Consecuencias

- `SQLITE_RUTA` y `MEDIOS_RUTA` **tienen que apuntar fuera de la carpeta que el
  despliegue reemplaza**. Si el hosting borra y recrea el directorio de la
  aplicación al publicar, el portafolio se vacía en cada publicación. Está
  anotado en `.env.example` y en el runbook de despliegue.
- El respaldo del portafolio son dos cosas: el archivo `.db` y la carpeta de
  medios. Se copian con `cp`. No hay volcado ni herramienta que aprender.
- `node:sqlite` emite un `ExperimentalWarning` al cargarse. La API está
  estabilizándose y el módulo es utilizable sin bandera desde Node 23.4. Si
  alguna vez cambia de forma, el que se adapta es un solo archivo — que es la
  razón de que haya un puerto delante.
- Las escrituras son síncronas. Para un panel de una persona y un sitio de una
  página es lo correcto: no hay pool que agotar ni conexión que se caiga.
- El conteo del limitador y la caché siguen siendo por instancia. Con varias
  réplicas y SQLite en disco local, cada réplica tendría su propia base: **este
  adaptador asume una sola instancia**. Ese es el momento de pasar a PostgreSQL,
  y es una decisión de escala, no de código.

## Alternativas descartadas

- **JSON versionado en el repositorio.** Cero infraestructura, pero cada carga de
  contenido exige un commit y un redespliegue, y solo puede hacerlo quien tenga
  el repositorio. El pedido era cargar clientes «cada vez que desarrollamos esto
  para una empresa»: eso es contenido, no código.
- **Un CMS externo (Sanity, Contentful, Strapi).** Resuelve el problema y añade
  una cuenta, un límite de plan, un origen más en la CSP y una dependencia de un
  tercero para que el portafolio se vea. Desproporcionado para dos tablas.
- **PostgreSQL desde el primer día.** Es a dónde se va si hace falta más de una
  instancia. Hoy sería un servicio más que administrar, respaldar y pagar para
  guardar unas decenas de filas.
