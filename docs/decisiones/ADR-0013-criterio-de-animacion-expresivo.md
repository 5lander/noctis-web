# ADR-0013: El criterio de animación cambia de "que no se note" a "que se note"

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P3.1 |
| Decisores | Usuario |

## Contexto

`docs/ANIMACION.md` v1.0 fijaba un criterio explícito y conservador:

> El movimiento **acompaña la lectura, no compite con ella**. Regla de decisión
> para cualquier animación que se proponga más adelante: si el usuario la nota
> como efecto en vez de notarla como fluidez, se descarta.

y en la tabla de parámetros: *"Nada de parallax ni scroll secuestrado — sin
`scrub`, sin `pin` en v1"*.

El usuario pidió lo contrario, señalando el showcase de GSAP como referencia y
pidiendo explícitamente que el sitio "se vaya haciendo una locura", con la
identidad de Noctis como marco.

`CLAUDE.md` §0 obliga a detenerse y preguntar cuando una tarea exige violar una
regla del proyecto. Se preguntó; el usuario ratificó el giro y eligió, entre las
opciones planteadas, la más agresiva de cada una: WebGL real en la portada,
suavizado de scroll activado y construcción completa sin pausas intermedias.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Sostener el criterio v1 y rechazar el pedido | Coherencia con la documentación | La documentación existe para servir al proyecto, no al revés. El dueño del criterio es el usuario |
| Implementar sin tocar `ANIMACION.md` | Rápido | La próxima sesión lee un documento que contradice el código y "arregla" lo que no está roto |
| Cambiar el criterio en el documento, con este ADR de por medio | El código y el spec vuelven a decir lo mismo; queda el porqué | Cuesta una revisión completa del documento |

## Decisión

**`ANIMACION.md` pasa a v2.0** con un criterio nuevo, y se implementa el paquete
P3.1 con nueve requisitos adicionales (RA-06 a RA-14) sobre los cinco de la v1.

El criterio nuevo no es "todo vale". Es:

> El movimiento es parte de lo que el sitio vende. Puede notarse, y debería.
> Lo que no puede es **estorbar**: nada que retrase la lectura, esconda
> contenido, secuestre el scroll ni deje la página inservible si falla.

Las cuatro condiciones no negociables de la v1 se mantienen enteras y son las que
distinguen esto de un sitio de agencia por el que no se puede navegar:

1. `prefers-reduced-motion: reduce` apaga **todo**;
2. sin JavaScript, o si la capa no arranca, la página se ve y se usa entera;
3. por debajo de 768 px no hay anclaje, ni suavizado, ni cielo, ni cursor;
4. solo se animan `transform`, `opacity` y `clip-path` — más la altura del
   acordeón, que es la excepción autorizada de siempre.

## Consecuencias

- El `pin` del proceso alarga la página. Es el costo que el catálogo ya advertía
  para la técnica 11, y se acepta a cambio de que la secuencia se recorra.
- El presupuesto de rendimiento se tensiona: el sitio pasa de "GSAP y nada más" a
  GSAP con cinco plugins más WebGL. Se mide en Pf; el techo sigue siendo
  Lighthouse móvil ≥ 90, y el corte de móvil es lo que lo protege.
- Si el criterio volviera a girar, lo que se revierte es la capa
  (`components/animation/`) y los atributos `data-*` de las secciones. **El
  contenido y la estructura no dependen de esto**: es exactamente por eso que la
  capa está separada.
- `CATALOGO-GSAP.md` deja de ser un catálogo de lo que "además se podría hacer" y
  pasa a describir, en su mayoría, lo que hay. Se anota ahí.
