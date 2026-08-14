# P1 — Resultado de auditoría

| Fecha | Auditor | Commit auditado |
|---|---|---|
| 2026-08-14 | Claude Code | `e8466b9` |

> Checklist completa de `docs/AUDITORIA.md`. Las filas que describen el sistema
> base —cuentas, tenants, base de datos, pagos— siguen sin aplicar por la misma
> razón que en P0; el mapa está en `docs/sistema/seguridad.md`. Acá se detallan
> las que **sí** cambian con este paquete, y en especial la sección F, que entra
> en juego por primera vez.

---

## A. Arquitectura

| # | Resultado | Evidencia |
|---|---|---|
| A1 · A2 | ✅ | `audit:arch` limpio sobre 41 módulos y 45 dependencias. P1 no toca `domain/` ni `application/` |
| A3 | ✅ | Los componentes no contienen regla de negocio. `Status` recibe el resaltado decidido y no lo deduce: RN6 dice que el estado de un producto sale de `content/` |
| A4 · A5 | — no aplica | Sin casos de uso |
| A6 | ✅ | Las 76 pruebas siguen corriendo sin base de datos, sin red y sin servidor |

## B. Código

| # | Resultado | Evidencia |
|---|---|---|
| B1 | ✅ | `audit:forbidden — sin hallazgos`, con **1 excepción declarada e impresa**: `theme-script.tsx`. Ver la nota de abajo |
| B2 · B3 | ✅ | `tsc --noEmit` y `eslint .` limpios |
| B4 | ✅ | `max-lines-per-function` hizo saltar la página de vista previa a las 44 líneas; se partió en cuatro componentes en vez de subir el umbral |
| B5 · B6 · B7 | ✅ | Sin cambios: siguen como error en cada commit |
| B8 | — no aplica | Sin tipos de dominio todavía |
| B9 | ⚠️ parcial | Igual que P0: el único error tipado sigue siendo `ConfigurationError` |
| B10 | ✅ | Un `catch` nuevo, en `ModeToggle`, con comentario que explica qué se pierde y por qué no hay nada que reportar: el modo ya cambió, solo no se recuerda |
| B11 | ✅ | Sin código comentado |
| B12 | ✅ | Sin límites externos nuevos |

### Nota sobre la excepción de `html-crudo`

`CLAUDE.md` §10 exige un script en línea que fije el modo antes del primer
pintado. En React eso no se escribe de otra forma: `<script>{código}</script>`
sale con las comillas escapadas como entidades —y dentro de un `<script>` el
navegador no las decodifica—, y `next/script` usa `dangerouslySetInnerHTML`
internamente. `CLAUDE.md` §8 prohíbe HTML crudo **con contenido de usuario**; acá
el contenido es una constante del repositorio.

El check de P0 era más ancho que la regla. Se ajustó con una lista de
excepciones que **se imprime en cada corrida**:

```
audit:forbidden — 1 excepción(es) declarada(s) de html-crudo: src\components\theme\theme-script.tsx
audit:forbidden — sin hallazgos
```

Una excepción que nadie ve deja de ser una excepción y pasa a ser un agujero.

## C. Seguridad

| # | Resultado | Evidencia |
|---|---|---|
| C19 | ✅ | Cabeceras y CSP intactas. **El script del modo lleva el nonce de la petición**, verificado en el HTML servido; ningún script ni hoja de estilo sale sin nonce |
| C11 | ✅ | `audit:secrets` limpio |
| C13 · C14 · C22 · C24 · C26 · C27 | ✅ | Sin cambios respecto a P0 |
| Resto | — no aplica | Mismas razones que en P0 |

Comprobación específica de P1: **ninguna petición sale a un tercero.** Las
fuentes vienen de Google en el prototipo y acá se descargan en el build y se
sirven desde el propio dominio; `grep "fonts.googleapis\|fonts.gstatic"` sobre el
HTML servido devuelve **0**.

## D. Base de datos

| # | Resultado | Evidencia |
|---|---|---|
| D1–D13 | — no aplica | Sin base de datos en v1 |

## E. Reglas de negocio

| # | Resultado | Evidencia |
|---|---|---|
| E8 | ✅ | `grep -rniE "sri\|facturaci[oó]n electr"` sobre `src/` → sin coincidencias |
| E11 | ✅ | **Verificado de las dos formas.** Sin JavaScript: el `<html>` sale del servidor con `data-mode="dark"`, así que la paleta completa se aplica y la página se lee entera. Con `prefers-reduced-motion`: `base.css` anula animaciones y transiciones, y vive ahí y no en la capa de animación justamente para que valga aunque GSAP no cargue |
| Resto | — no aplica | P5, P6 y P8 |

## F. Frontend — entra en juego en este paquete

| # | Resultado | Evidencia |
|---|---|---|
| F1 | ✅ | **Cero valores literales en componentes.** Cada `.module.css` referencia tokens. Los únicos números son medidas estructurales del prototipo (tamaños de fuente, espaciados), copiadas de él y no inventadas |
| F2 | ✅ | Todo color, fuente y curva sale de `tokens.css` |
| F3 | ✅ | No hay componentes de dominio todavía. Los de UI llevan sus clases desde su propio módulo |
| F4 | ✅ | `components/ui` es reemplazable entero: nada fuera de esa carpeta conoce sus clases |
| F5 | — no aplica | Sin datos bloqueados que difuminar |
| F6 | — no aplica | Ninguna vista consume la API todavía |
| F7 | ✅ | La rejilla de campos cae a una columna a 620 px, igual que el prototipo |
| F8 | — no aplica | Sin formularios que validar (P10) |
| F9 | ✅ | Foco visible en todo elemento interactivo (`:focus-visible` en `base.css`); acordeón sobre `<details>` nativo, operable con teclado sin código propio; el botón de modo lleva `aria-label` desde `content/`; el punto del estado va con `aria-hidden`; **contraste AA calculado, no afirmado** |

### Contraste — el criterio de aceptación de P1, medido

`src/styles/contrast.spec.ts` lee `tokens.css` y calcula la razón según WCAG 2.1
en los cuatro contextos: modo oscuro, modo claro, y cada uno con franja
invertida encima.

| Par | Oscuro | Claro | Inv. sobre oscuro | Inv. sobre claro |
|---|---|---|---|---|
| `--texto` sobre `--fondo` | 18.0 | 19.7 | 18.0 | 18.0 |
| `--texto` sobre `--fondo-2` | 17.0 | 17.7 | 17.7 | 17.0 |
| `--texto-2` sobre `--fondo` | 6.7 | 5.2 | 6.1 | 6.7 |
| **`--texto-2` sobre `--fondo-2`** | **6.3** | **4.7** | **6.0** | **6.3** |

Todos por encima de 4.5. El más ajustado es el modo claro sin invertir, a 4.7:
por eso el criterio de aceptación señalaba justamente ese par, y por eso la
prueba lo calcula en vez de darlo por bueno. La prueba encontró dos fallos reales y los dos se
corrigieron **en el uso, no en la paleta** (ADR-0009):

1. `.inv` no invertía `--fondo-2`: dentro de una franja invertida, el texto
   secundario sobre fondo secundario daba 2.8:1. Hoy ningún componente cae en esa
   combinación; la corrección existe para que el primero que lo haga no se rompa.
2. `--texto-3` da 2.79:1 en modo claro. Es un token decorativo —puntos,
   separadores, líneas, y filas con `aria-hidden`—, y el único sitio donde tocaba
   texto de verdad era el marcador de posición de los campos, que pasó a
   `--texto-2`. Hay prueba que fija esa línea.

## G. Pruebas

| # | Resultado | Evidencia |
|---|---|---|
| G1 | ✅ | `Test Files 13 passed (13)` · `Tests 76 passed (76)` |
| G3 | ✅ | Sin base de datos, sin red, sin servidor |
| G5 | ✅ | Las de P0 siguen en verde |
| G7 | ✅ | Sin datos de personas |
| G2 · G4 · G6 | — no aplica | Sin dominio, sin multi-tenencia, sin casos conocidos todavía |

**El script del modo se ejecuta de verdad en la prueba**, contra un documento
falso, con `node:vm`. Es código que corre en el navegador de cada visitante,
antes de que exista React: no lo revisa el compilador y no lo cubre ningún tipo.

## H. Documentación

| # | Resultado | Evidencia |
|---|---|---|
| H1 | ✅ | `docs/pasos/P1/CONSTRUCCION.md` completo |
| H2 | — no aplica | Sin endpoints nuevos |
| H3 | ✅ | `docs/sistema/FUNCIONAMIENTO.md` con el apartado de P1 y su diagrama |
| H4 | — no aplica | Sin migraciones |
| H5 | ✅ | Sin variables de entorno nuevas |
| H6 | ✅ | ADR-0008 y ADR-0009, con el índice al día |
| H7 | — no aplica | Nada operable nuevo |
| H8 | ✅ | Entrada de P1 en `docs/CHANGELOG.md` |
| H9 | — no aplica | Casos conocidos: P5 |
| H10 · H11 | ✅ | Describe lo construido; este archivo |

## I. Optimización

| # | Resultado | Evidencia |
|---|---|---|
| I1 | ✅ | `knip` limpio |
| I2 | ✅ | `audit:complexity` limpio, tras partir la página de vista previa |
| I3 | ✅ | `jscpd`: 0 clones |
| I4 | ✅ | Ninguna abstracción sobrante. `Field` recibe el control como hijo en vez de una prop `type` que decidiera entre tres |
| I5 · I6 · I7 | ✅ | Sin trabajo pesado, sin concurrencia, sin cachés nuevos |
| I8 | ⚠️ diferido | LCP se mide en Pf, con las secciones reales puestas |
| I9 | — no aplica | Presupuesto de bundle desde P6b/P7b |
| I10 | ✅ | Sin optimizaciones no triviales |

**Peso del cliente**: el único JavaScript de cliente de P1 es `ModeToggle`, un
botón sin estado. La página es Server Component salvo ese archivo.

---

## Resumen

```
AUDITORÍA P1

A. Arquitectura      ✅ A1-A3, A6 · — A4, A5
B. Código            ✅ B1-B8, B10-B12 · ⚠️ B9
C. Seguridad         ✅ C11, C13, C14, C19, C22, C24, C26, C27 · — resto
D. Base de datos     — no aplica
E. Reglas de negocio ✅ E8, E11 · — resto
F. Frontend          ✅ F1-F4, F7, F9 · — F5, F6, F8
G. Pruebas           ✅ G1, G3, G5, G7 · 76 pruebas en verde · — G2, G4, G6
H. Documentación     ✅ H1, H3, H5, H6, H8, H10, H11 · — H2, H4, H7, H9
I. Optimización      ✅ I1-I7, I10 · ⚠️ I8 diferido a Pf · — I9

npm run audit → salida 0
```

## Verificación en servidor de producción

```
$ npm run build && npx next start

$ curl -s localhost:3000/ | grep -o '<html[^>]*>'
<html lang="es-EC" data-mode="dark" class="inter_tight_…__variable inter_…__variable">

$ # el script del modo, en el <head> y antes del <body>
posición del script: 1597 · posición de <body>: 1900   → en <head>

$ curl -s localhost:3000/ | grep -o '<script nonce="[^"]*">(function(){try{[^<]*</script>'
<script nonce="6FTuRM/Ync2P2qg09zdtqA==">(function(){try{
  var g=localStorage.getItem("noctis-modo");
  var m=(g==='dark'||g==='light')?g:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
  document.documentElement.setAttribute("data-mode",m);
}catch(e){document.documentElement.setAttribute("data-mode","dark");}})()</script>

$ # ni una petición a un tercero por las fuentes
curl -s localhost:3000/ | grep -c "fonts.googleapis\|fonts.gstatic"
0

$ # ningún script ni hoja de estilo sin nonce
scripts sin nonce: 0

$ # sin avisos de hidratación en el registro del servidor
0
```

## Correcciones hechas durante la auditoría

| Check que falló | Qué se corrigió |
|---|---|
| F9 / contraste | `.inv` no invertía `--fondo-2` (2.8:1 para texto secundario). Ahora sí, y la prueba lo cubre |
| F9 / contraste | El marcador de posición usaba `--texto-3` (2.79:1 en modo claro). Pasó a `--texto-2`, con prueba que fija la línea |
| I2 | La página de vista previa pasaba de 40 líneas: se partió en cuatro componentes |
| E11 | Sin `data-mode` en el `<html>`, la página sin JavaScript perdía toda la paleta. El servidor emite el modo por defecto |
| B1 | El check de `html-crudo` era más ancho que la regla de `CLAUDE.md` §8: se ajustó con una excepción declarada e impresa |
