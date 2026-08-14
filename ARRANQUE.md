# Cómo arrancar

1. Descomprimir en la **raíz del repositorio**. `CLAUDE.md` va en la raíz: Claude Code lo lee solo.
2. `git init`, primer commit, subir a GitHub con protección de rama.
3. Antes del primer prompt, resolver las dos filas C de `docs/FASE0-CHECKLIST.md`.

## Primer prompt para Claude Code

```
Lee CLAUDE.md, ESTADO.md, DECISIONES.md, docs/BUILD.md y docs/MODO-AUTONOMO.md.
Activa modo autónomo hasta P5. Ejecuta el protocolo completo de docs/PROTOCOLO.md
en cada paquete: un commit por paquete, audit:fast en verde, evidencia en
docs/pasos/P{n}/ y ESTADO.md actualizado al cerrar cada uno.
Empieza por la Fase de RECARGA de P0.
```

Recomendación: primera corrida hasta P5 (el motor de disponibilidad, que es el camino crítico), revisar, y recién ahí soltar el resto.

## Frentes en paralelo

`docs/FASE0-CHECKLIST.md` — dominio, correo con SPF/DKIM/DMARC, cuenta de calendario, aviso de privacidad, trabajos reales. Todos dependen de terceros y no se comprimen escribiendo código más rápido.
