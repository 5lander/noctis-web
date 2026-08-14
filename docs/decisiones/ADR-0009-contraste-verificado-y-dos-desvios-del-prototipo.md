# ADR-0009: Contraste verificado, y los dos desvíos del prototipo que obligó

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P1 |
| Decisores | Claude Code |

## Contexto

El criterio de aceptación de P1 pide *"contraste AA verificado en ambos modos,
con atención a `--texto-2` sobre `--fondo-2`"*, y `SPEC.md` §8.5 lo repite. Al
mismo tiempo, `CLAUDE.md` §8 dice que **en lo visual manda el prototipo** y que
no se reinventan colores.

Se escribió una prueba que lee `tokens.css` y **calcula** la razón de contraste
según WCAG 2.1, en vez de marcar una casilla a mano. Encontró dos cosas.

## Lo que encontró

**1. `--fondo-2` no se invierte dentro de `.inv`.** El prototipo redefine
`--texto-2`, `--texto-3` y `--linea` dentro de la franja invertida, pero no
`--fondo-2`. Un componente que use `--fondo-2` dentro de una franja invertida
queda con texto secundario a **2.8:1**. Hoy ninguno lo usa ahí, así que el
prototipo se ve bien; es una trampa esperando al primero que lo haga.

**2. `--texto-3` no llega a 3:1 en modo claro.** Da 2.79:1 sobre `--fondo` y
2.51:1 sobre `--fondo-2`. En el prototipo ese token se usa para: el punto del
estado, el separador de la marquesina, la línea de las viñetas, las filas
inactivas del registro nocturno (que va con `aria-hidden`) y **el marcador de
posición de los campos**. Los cinco primeros son decoración, que no tiene
requisito de contraste. El sexto es texto.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Cambiar los valores de `--texto-3` | Cumpliría AA en todo uso | Reinventa la paleta del prototipo, que es la fuente de verdad visual |
| Dejarlo y anotarlo como deuda | Cero cambios | El protocolo dice que lo que sale en rojo se corrige, no se documenta |
| Corregir el uso, no la paleta | El prototipo queda intacto y el texto cumple | Un desvío de una línea respecto al prototipo |

## Decisión

**Se corrige el uso, no la paleta.** Dos líneas de diferencia con el prototipo:

1. `.inv` redefine también `--fondo-2` al valor del modo contrario.
2. El marcador de posición de los campos usa `--texto-2` en vez de `--texto-3`.

`--texto-3` queda declarado como **token decorativo**: puntos, separadores,
líneas y contenido oculto al lector de pantalla. Nunca texto.

## Consecuencias

- Visualmente no cambia nada de lo que hoy se ve en el prototipo: el primer
  desvío afecta a una combinación que todavía no ocurre, y el segundo aclara un
  gris de marcador de posición.
- `contrast.spec.ts` fija los dos: calcula AA para `--texto` y `--texto-2` sobre
  los dos fondos, en los cuatro contextos (dos modos × con y sin franja
  invertida), y comprueba que la regla del marcador de posición no vuelva atrás.
- Si alguien cambia un token, la prueba falla con el número exacto. No hay que
  acordarse de nada.
- **Pendiente para Pf**: revisar `--texto-3` cuando esté usado de verdad en las
  once secciones (P2). Si aparece sobre texto en algún lugar nuevo, se decide
  ahí, con el caso a la vista.
