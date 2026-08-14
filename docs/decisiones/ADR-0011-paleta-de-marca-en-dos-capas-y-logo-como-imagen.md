# ADR-0011: La paleta de marca vive en dos capas, y el logotipo se sirve como imagen

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | Rebrand visual (fuera de la numeración P0–Pf) |
| Decisores | Claude Code |

## Contexto

`docs/identidad-de-marca-noctis/spec-rebrand-noctis.md` reemplaza la paleta, la
tipografía y el logotipo del sitio. Hasta hoy la fuente de verdad visual era
`prototipo/noctis-v4.html` (`CLAUDE.md` §8) y sus valores estaban en
`tokens.css` con nombres cortos —`--fondo`, `--texto`, `--texto-2`, `--linea`—
que ADR-0008 declaró **contrato compartido con Commerce y Care**.

El spec trae siete tokens semánticos con otros nombres (`--color-fondo`,
`--color-superficie`, `--color-marca`, `--color-accion`, …) y no menciona los
que el sitio ya tenía: no hay en el spec un equivalente de `--texto-3`
(decorativo), de `--linea`, ni de la franja invertida `.inv`.

Además el paquete de marca trae el logotipo como cinco SVG, con la instrucción
explícita de **nunca deformarlo, rotarlo ni recolorearlo fuera de esos
archivos**. Hasta hoy el "logo" del sitio era el nombre en texto.

## Opciones consideradas — paleta

| Opción | A favor | En contra |
|---|---|---|
| Renombrar los tokens a los nombres del spec | Un solo juego de nombres | Imposible sin inventar: el spec no cubre línea, texto decorativo ni franja invertida. Y rompe el contrato de ADR-0008 para los tres repos |
| Dejar los nombres cortos con los valores nuevos | Cero churn en 108 usos de `var()` | La paleta deja de ser diffeable contra el spec: nadie puede verificar que un tono es el que la marca dice |
| Dos capas: los siete del spec, y los cortos como alias | Se verifica contra el spec y no se rompe el contrato | Dos nombres para el mismo color en siete casos |

## Decisión

**Dos capas.** Los siete `--color-*` de cada modo son transcripción literal del
spec §1 y son la única fuente de color. Los nombres cortos quedan como alias
(`--fondo: var(--color-fondo)`) y siguen siendo lo que consumen los componentes.
Los derivados que el spec no cubre —`--texto-3`, `--linea`, `--inv-*`— se
eligen dentro de la misma familia de grises del spec.

`contrast.spec.ts` lee **el spec y `tokens.css`** y falla si un tono no coincide.
La transcripción deja de depender de que alguien la revise.

El atributo sigue siendo `data-mode` y no el `data-theme` del spec: el propio
spec §4 pide mantener el toggle existente.

### El color de acción no es el mismo tono en los dos modos

`--color-accion` es índigo `#3730A3` en claro y lavanda `#C4B5FD` en oscuro. No
es un descuido del spec: el índigo sobre el fondo oscuro da **2.49:1**, y la
lavanda sobre el claro da **1.77:1**. Cada uno solo funciona en su modo.

De ahí sale un sobrescrito nuevo: **la franja invertida tiene que voltear también
`--color-accion`**. Un botón de marca dentro de una franja `.inv` heredaría el
tono del modo de afuera y quedaría a 1.98:1 — invisible. Es la misma trampa que
ADR-0009 encontró con `--fondo-2`, y se cierra igual: sobrescrito en el bloque
anidado y prueba que lo fija en los cuatro contextos.

## Opciones consideradas — logotipo

| Opción | A favor | En contra |
|---|---|---|
| SVG en línea como componente React | Hereda `currentColor`, un solo nodo | Copia el trazo dentro del código, donde diverge del archivo de marca. Y el logo no debe recolorearse |
| `<img>` con los dos archivos, uno oculto por CSS | `alt` real, imprime bien | Descarga los dos, y las dimensiones en props chocan con `no-magic-numbers` |
| Imagen de fondo conmutada por CSS | Un solo archivo por modo, sin copia del trazo, sin props numéricas | No imprime por defecto ni sobrevive a `forced-colors` |

## Decisión

**Imagen de fondo**, en `src/components/brand/logo.tsx`, con
`role="img"` y `aria-label` desde `content/`. El modo lo conmuta
`html[data-mode='dark'] .logo`. Los archivos se copian sin tocar una coordenada
a `public/marca/`, y `favicon.svg` va a `src/app/icon.svg`, que es la convención
de Next 16.

Se publican **solo los dos archivos que el sitio usa**. `logo-final-apilado.svg`
y `logo-final-monocromo.svg` se quedan en `docs/identidad-de-marca-noctis/`
hasta que exista una superficie que los pida (imagen de compartir, impresión):
un archivo servido que nadie pide es superficie sin motivo.

## Consecuencias

- El ancho del logotipo es 96px, por encima del mínimo de 90px del spec §3. El
  área de seguridad —el alto de la "N"— **ya viene dentro del `viewBox`**, así
  que el bloque mide 54.9px de alto para un trazo de unos 24px. Recortar el
  `viewBox` para "aprovechar" ese aire sería violar el área de seguridad.
- **El logotipo solo se puede colocar sobre `--color-fondo`.** El recorte de la
  luna es un círculo opaco pintado del color del fondo (`#FAFAFA` en el archivo
  claro, `#0A0A12` en el oscuro), no un recorte real. Sobre `--color-superficie`
  o sobre una franja invertida se vería el círculo. Hoy está en la barra y en el
  pie, que son fondo; **si alguien lo mete en una tarjeta, hay que pedirle al
  diseño un archivo con el recorte hecho con `mask` o `fill-rule`.**
- La barra fija es traslúcida (`color-mix` al 88% + `blur`), así que bajo ese
  círculo opaco puede asomarse un borde tenue cuando pasa contenido de mucho
  contraste. Es visible solo al scrollear y se resuelve con el mismo archivo
  corregido que el punto anterior.
- `--fondo-2` cambia de significado: era un gris **más oscuro** que el fondo en
  modo claro (`#f3f3f1` sobre `#ffffff`) y ahora es la superficie **más clara**
  (`#ffffff` sobre `#fafafa`). Es lo que el spec quiere —las tarjetas flotan
  sobre la página— pero invierte la relación en la grilla de trabajos, donde el
  tratamiento `uppercase` pasa a ser el cuadro más oscuro en vez del más claro.
  El borde de `--linea` mantiene los cuadros distinguibles.
