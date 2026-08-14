# P2 — Resultado de auditoría

| Fecha | Auditor | Commit auditado |
|---|---|---|
| 2026-08-14 | Claude Code | `{hash}` |

> Checklist completa de `docs/AUDITORIA.md`. Las filas del sistema base —cuentas,
> tenants, base de datos, pagos, uploads, webhooks— siguen sin aplicar por la
> razón de siempre, mapeada en `docs/sistema/seguridad.md`. Acá se detalla lo que
> cambia con este paquete.

---

## A. Arquitectura

| # | Resultado | Evidencia |
|---|---|---|
| A1 · A2 | ✅ | `audit:arch` limpio sobre **72 módulos y 113 dependencias**. La regla `contenido-es-hoja` vigila que `content/` no importe nada |
| A3 | ✅ | Ningún componente decide nada. `Products` compara el estado con `'disponible'` para resaltar, pero el estado viene de `content/`: es lo que protege RN6 |
| A4 · A5 · A6 | — / ✅ | Sin casos de uso. Las 93 pruebas siguen sin base de datos, sin red y sin servidor |

## B. Código

| # | Resultado | Evidencia |
|---|---|---|
| B1 | ✅ | `sin hallazgos`, con la excepción única de P1 impresa. **Se corrigió un `eslint-disable` que se había colado** para usar `<img>`: pasó a `next/image` con `fill` |
| B2 · B3 | ✅ | `tsc --noEmit` y `eslint .` limpios |
| B4 | ✅ | `ContactForm` llegó a 59 líneas y se partió extrayendo `TextInput`, que de paso eliminó cuatro repeticiones idénticas |
| B5–B7 | ✅ | Sin cambios |
| B8 | ✅ | El contenido está tipado: `Product`, `Work`, `Service`, `ProcessStep`, `Question`. `WorkCover` es unión discriminada, no un `string` con convenciones |
| B9 | ⚠️ parcial | Igual que P0 y P1: los errores de dominio llegan con el dominio |
| B10–B12 | ✅ | Sin `catch` nuevos, sin código comentado, sin límites externos nuevos |

## C. Seguridad

| # | Resultado | Evidencia |
|---|---|---|
| C11 · C13 · C14 · C19 · C22 · C24 · C26 · C27 | ✅ | Sin cambios. Ningún script ni hoja de estilo sale sin nonce, verificado sobre el HTML servido |
| Resto | — no aplica | Mismas razones que en P0 |

**Encontrado y corregido en esta auditoría**: `audit:secrets` reventaba con
`ENOENT` al haber archivos borrados del árbol pero todavía en el índice. Se
filtra por existencia. Es un fallo del verificador, no del código verificado, y
lo destapó el propio paquete al borrar la vista de P1.

## D. Base de datos

| # | Resultado |
|---|---|
| D1–D13 | — no aplica: sin base de datos en v1 |

## E. Reglas de negocio

| # | Resultado | Evidencia |
|---|---|---|
| E8 | ✅ | **Verificado por prueba y sobre el HTML servido.** `content.spec.ts` busca `\bsri\b` y "facturación electrónica" sobre todo el texto del sitio aplanado; `curl` sobre la página devuelve 0 coincidencias |
| E11 | ✅ | La página es HTML renderizado en servidor: se lee entera sin JavaScript. Sin animación todavía |
| Resto | — no aplica | P5, P6 y P8 |

**Regla adicional verificada aunque la checklist no la enumere** (`SPEC.md` §5.2):
no se ofrece software a medida ni integraciones. La prueba distingue el servicio
vetado de la frase "a medida que el negocio crece", que es otra cosa.

## F. Frontend

| # | Resultado | Evidencia |
|---|---|---|
| F1 · F2 | ✅ | Cero colores, fuentes y curvas literales. Los números que hay son medidas estructurales copiadas del prototipo |
| F3 | ✅ | Ningún componente de sección lleva valores visuales en `className`: cada uno usa su módulo |
| F4 | ✅ | `components/ui` sigue siendo reemplazable entero |
| F5 · F6 · F8 | — no aplica | Sin datos bloqueados, sin vistas que consuman la API, sin validación de formulario (P10) |
| F7 | ✅ | Los tres cortes del prototipo portados: 1000 px y 620 px. Productos y servicios a una columna, trabajos de 3 → 2 → 1 |
| F9 | ✅ | **Un solo `h1`**, verificado sobre el HTML servido. Jerarquía corregida: `h3` donde el prototipo saltaba a `h4`. Marquesina y flecha decorativa con `aria-hidden`. Foco visible. Acordeón nativo. Contraste AA por la prueba de P1 |

## G. Pruebas

| # | Resultado | Evidencia |
|---|---|---|
| G1 | ✅ | `Test Files 14 passed (14)` · `Tests 93 passed (93)` |
| G3 · G5 · G7 | ✅ | Sin base de datos ni red; datos sintéticos |
| G2 · G4 · G6 | — no aplica | Sin dominio todavía |

**El criterio de aceptación del paquete es una prueba.** "Ningún texto de cara al
usuario vive dentro de un componente" no se comprueba leyendo: `content.spec.ts`
recorre `src/components` y `src/app`, quita los comentarios y busca texto suelto
entre etiquetas JSX. Hoy da cero.

## H. Documentación

| # | Resultado |
|---|---|
| H1 · H3 · H8 · H10 · H11 | ✅ |
| H2 · H4 · H5 · H7 · H9 | — no aplica: sin endpoints, migraciones, configuración, runbooks ni casos conocidos nuevos |
| H6 | ✅ — no hubo decisiones que ameriten ADR: las de este paquete son consecuencia directa del SPEC y están en `CONSTRUCCION.md` |

## I. Optimización

| # | Resultado | Evidencia |
|---|---|---|
| I1 | ✅ | `knip` limpio. Señaló `ProductStage` exportado sin consumidor y se dejó de exportar |
| I2 | ✅ | Limpio, tras partir `ContactForm` |
| I3 | ✅ | 0 clones. La extracción de `TextInput` quitó cuatro bloques casi idénticos antes de que jscpd los viera |
| I4–I7 | ✅ | Sin abstracciones sobrantes, sin trabajo pesado, sin concurrencia, sin cachés |
| I8 | ⚠️ diferido | LCP se mide en Pf, con las animaciones puestas |
| I9 | — no aplica | Desde P6b/P7b |

**Peso del cliente**: sigue habiendo un solo componente de cliente en todo el
sitio, `ModeToggle`. Las once secciones son Server Components.

---

## Resumen

```
AUDITORÍA P2

A. Arquitectura      ✅ A1-A3, A6 · — A4, A5
B. Código            ✅ B1-B8, B10-B12 · ⚠️ B9
C. Seguridad         ✅ C11, C13, C14, C19, C22, C24, C26, C27 · — resto
D. Base de datos     — no aplica
E. Reglas de negocio ✅ E8, E11 · — resto
F. Frontend          ✅ F1-F4, F7, F9 · — F5, F6, F8
G. Pruebas           ✅ G1, G3, G5, G7 · 93 pruebas en verde · — G2, G4, G6
H. Documentación     ✅ H1, H3, H6, H8, H10, H11 · — H2, H4, H5, H7, H9
I. Optimización      ✅ I1-I7 · ⚠️ I8 diferido a Pf · — I9

npm run audit → salida 0 · 72 módulos, 113 dependencias, 0 clones, 0 vulnerabilidades
```

## Verificación sobre el HTML servido

```
$ npm run build && npx next start

$ for id in productos trabajos servicios proceso preguntas contacto; do ... done
productos:1 trabajos:1 servicios:1 proceso:1 preguntas:1 contacto:1

$ grep -o '<h1' | wc -l              → 1        (un solo h1, SPEC §8.6)
$ grep -ci "sri|facturación electrónica"  → 0    (RN8)
$ grep -c "Nombre del cliente"       → 0        (el testimonio no se publica, C2)
$ scripts sin nonce                  → 0
$ textos clave presentes: "Su negocio no cierra a las seis", "Noctis Commerce",
  "Lubricadora del Sur", "Mejora de páginas web", "Enviar mensaje"
```

## Correcciones hechas durante la auditoría

| Check que falló | Qué se corrigió |
|---|---|
| B1 | Un `eslint-disable` colado para usar `<img>` → `next/image` con `fill`, que además es lo que pide `SPEC.md` §9 |
| — (el verificador mismo) | `audit:secrets` reventaba al encontrar archivos borrados del árbol pero aún en el índice. Ahora filtra por existencia |
| I2 / B4 | `ContactForm` en 59 líneas → se extrajo `TextInput` |
| I1 | `ProductStage` exportado sin consumidor → dejó de exportarse |
| G / criterio de aceptación | El check de "texto en componentes" señalaba comentarios; se quitan antes de escanear |
