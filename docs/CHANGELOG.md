# CHANGELOG

Una entrada por commit de paquete. Formato: qué se construyó, qué quedó fuera, qué decisión se tomó.

## [Sin publicar]

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
