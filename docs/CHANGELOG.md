# CHANGELOG

Una entrada por commit de paquete. Formato: qué se construyó, qué quedó fuera, qué decisión se tomó.

## [Sin publicar]

### P2 — Contenido tipado y secciones estáticas · 2026-08-14

**Qué se construyó**

- `content/` tipado y hoja: productos, trabajos, servicios, proceso, preguntas y
  todos los textos del sitio. `WorkCover` es unión discriminada —portada
  tipográfica **o** imagen— desde el primer día, para que el componente de
  trabajos no haya que reescribirlo cuando lleguen las capturas reales.
- Las once secciones de `SPEC.md` §6, más barra y pie. `app/page.tsx` es solo
  composición: once líneas, ni un texto.
- 17 pruebas nuevas, 93 en total.

**El criterio de aceptación es una prueba**

"Ningún texto de cara al usuario vive dentro de un componente" no se comprueba
leyendo: la prueba recorre `src/components` y `src/app`, quita los comentarios y
busca texto suelto entre etiquetas JSX. Igual RN8: busca la cadena sobre todo el
texto del sitio aplanado, y también se verificó sobre el HTML servido.

**Dos decisiones de contenido**

- **El testimonio no se publica** mientras no haya nombre real (C2). Una cita
  firmada por `[Nombre del cliente]` dice que el sitio se armó con relleno.
- **El formulario apunta a `/api/contacto`** desde ya. Un `<form>` sin destino
  envía por `GET` y deja lo que escribió el visitante en la barra de direcciones
  y en el historial. Hasta P10 responde 404, que es una señal honesta.

**Corregido durante la construcción**

- Un fallo real de `audit:secrets`: reventaba con archivos borrados del árbol
  pero todavía en el índice. Lo destapó este mismo paquete al borrar la vista de
  P1.
- Un `eslint-disable` que se había colado para usar `<img>` → `next/image`.

### P1 — Sistema de diseño y modo claro/oscuro · 2026-08-14

**Qué se construyó**

- `tokens.css` con los dos modos y la franja invertida, con los valores exactos
  del prototipo. Los nombres de token quedan en español: son el contrato visual
  compartido con Commerce y Care (ADR-0008).
- Fuentes Inter Tight e Inter con `next/font`, descargadas en el build y
  servidas desde el propio dominio. Ni una petición a un tercero.
- Script en línea en el `<head>`, con el nonce de la petición, que fija
  `data-mode` **antes del primer pintado**. Se ejecuta de verdad en una prueba,
  contra un documento falso.
- Botón de cambio de modo con persistencia, sin estado propio: el modo vive en
  el atributo del `<html>` y el icono lo decide el CSS, así no hay diferencia
  entre servidor y cliente al hidratar.
- Los cinco componentes base: `Button`, `Field`, `Label`, `Status`, `Accordion`.
- Vista del sistema de diseño para poder comprobar los dos modos de un vistazo.
- 20 pruebas nuevas, 76 en total.

**Qué se corrigió, y por qué importa**

La prueba de contraste **calcula** la razón WCAG leyendo `tokens.css`, en vez de
marcar una casilla. Encontró dos fallos reales:

- La franja invertida no invertía `--fondo-2`: cualquier componente que lo usara
  ahí dejaba el texto secundario en 2.8:1.
- `--texto-3` da 2.79:1 en modo claro, y se estaba usando en el marcador de
  posición de los campos, que es texto.

Los dos se corrigieron **en el uso, no en la paleta**: el prototipo manda en lo
visual (ADR-0009).

**Qué quedó fuera, y por qué**

- Pruebas de render de los componentes: no se trajo entorno de DOM ni biblioteca
  de pruebas de React. La interfaz se cubre con Playwright en P7 y Pf.
- La vista del sistema de diseño y `content/design-system-preview.ts` **los borra
  P2** al poner las once secciones.

**Decisiones** — ADR-0008 y ADR-0009.

### P0 — Fundación · 2026-08-14

**Qué se construyó**

- Proyecto Next.js 16 con TypeScript 6 en modo estricto completo
  (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Node 24 fijado.
- Estructura de capas de `CLAUDE.md` §2 **hecha ejecutable**: cuatro reglas de
  dependency-cruiser en `error` dentro de `audit:fast`, que bloquea el commit. Un
  import de infraestructura desde `domain/` rompe la compuerta.
- Cadena de auditoría completa: `audit:fast` (tipos, lint, prohibidos,
  arquitectura, secretos) y `audit` (+ complejidad, código muerto, duplicación,
  dependencias y pruebas). Pre-commit por `core.hooksPath` versionado y CI en
  GitHub Actions.
- Dos verificadores propios: `audit-forbidden.mjs` (`any`, supresiones de
  compilador y linter, `process.env` en el dominio, HTML crudo, scripts desde
  CDN, SQL interpolado, `.env` versionado) y `audit-secrets.mjs` (diff preparado
  en pre-commit, archivos versionados en CI).
- Infraestructura compartida: entorno validado por esquema —único punto que lee
  `process.env`—, registro estructurado que redacta datos personales por nombre
  de campo (RN12), formato único de error, limitador por origen, y las seis
  cabeceras de seguridad con **CSP estricta y nonce por petición**.
- `GET /api/estado`, que devuelve el modo de servicios activo y hace verificable
  RN10 después de desplegar.
- 56 pruebas, todas sin base de datos, sin red y sin servidor levantado.

**Qué quedó fuera, y por qué**

- Dominio, casos de uso y puertos: son P4 y P5. No se escribió una interfaz sin
  implementación ni un error sin quien lo lance.
- Exigencia de credenciales en `MODO_SERVICIOS=real`: llega en P4, cuando
  existan credenciales que exigir. El mecanismo que las va a exigir ya está.
- Playwright: llega con la interfaz que lo justifique (P7 y Pf).

**Decisiones** — siete ADRs, `ADR-0001` a `ADR-0007`

- Identificadores en inglés y archivos `kebab-case` con sufijo de rol, verificado
  contra el **código** de Commerce. Cierra D12 y `FASE0-CHECKLIST` C2.
- Motor de disponibilidad propio, sin extraer el de Care. Cierra
  `FASE0-CHECKLIST` C1 · **pendiente de ratificación del usuario**.
- Vitest como runner · **pendiente de ratificación**.
- CSP con nonce, con el render dinámico que trae con ella.
- TypeScript 6.0.3 y ESLint 9.39.5, porque `typescript-eslint` no soporta 7 ni 10.
- Registro, limitador y pre-commit propios, sin dependencias nuevas.
- `/api/estado` expone el modo de servicios.

**Corregido durante la construcción**

- La CSP con `strict-dynamic` dejaba sin firmar los scripts en línea de Next: la
  página llegaba servida pero muerta en el navegador. Se detectó verificando
  contra un servidor de producción real, no en las pruebas.
