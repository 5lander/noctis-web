# ADR-0008: Componentes en inglés, tokens en español

| Campo | Valor |
|---|---|
| Estado | ✅ aceptado |
| Fecha | 2026-08-14 |
| Paquete | P1 |
| Decisores | Claude Code |

## Contexto

`docs/SPEC.md` §3 y `docs/PLAN-IMPLEMENTACION.md` P1 nombran los componentes base
en español: `Boton`, `Campo`, `Etiqueta`, `Estado`, `Acordeon`. `CLAUDE.md` §3
dice lo contrario: *"Código en inglés; español solo en textos visibles al
usuario"*, y `CLAUDE.md` §0 establece que ante conflicto gana `CLAUDE.md`.

El prototipo, además, nombra sus **tokens** en español (`--fondo`, `--texto-2`,
`--linea`), y `CLAUDE.md` §1 dice que esos tokens se comparten con Commerce y
Care.

Son dos preguntas distintas con dos respuestas distintas.

## Decisión

**Componentes, props y clases CSS: inglés.**

| SPEC | Implementación |
|---|---|
| `Boton` | `Button` — `variant="solid" \| "outline"` |
| `Campo` | `Field` |
| `Etiqueta` | `Label` |
| `Estado` | `Status` |
| `Acordeon` | `Accordion` |

**Nombres de token: en español, tal cual el prototipo.** `--fondo`, `--fondo-2`,
`--texto`, `--texto-2`, `--texto-3`, `--linea`, `--inv-fondo`, `--inv-texto`,
`--ancho`, `--borde`, `--curva`, y la clase `.inv`.

## Consecuencias

- Los tokens son un contrato entre tres repositorios. Renombrarlos acá rompería
  la capa común sin que nadie gane nada; el idioma de una variable CSS no es
  legibilidad de código, es identidad de un valor compartido.
- `.inv` se mantiene con ese nombre porque `SPEC.md` §4.1 la nombra así: es parte
  del contrato de tokens, no un componente.
- La tabla de arriba queda en `CONSTRUCCION.md` de P1 para que nadie lea la
  lista del plan y crea que falta un entregable.
