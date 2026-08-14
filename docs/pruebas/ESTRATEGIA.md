# Estrategia de pruebas

Prioridades en `CLAUDE.md` §7.

## Principios

- El motor de disponibilidad se prueba **sin base de datos, sin red y sin Google Calendar**. Es la prueba de que las capas están bien
- La doble reserva se prueba con **concurrencia real**, no simulada en secuencia
- El bot se prueba contra un conjunto de casos conocidos que incluye **intentos de inyección de instrucciones**
- Nunca datos reales de personas. Solo sintéticos

## Capas

| Tipo | Alcance | Corre en |
|---|---|---|
| Unitarias | Dominio: disponibilidad, máquina de estados, tokens | Cada commit |
| Integración | Endpoints, límites, concurrencia, adaptadores simulados | Cada commit |
| Extremo a extremo | Recorridos: agendar, conversar, contactar | CI |
| Accesibilidad | Teclado, movimiento reducido, contraste | Pf |

## Herramienta y convención

**Vitest** (ADR-0003). `npm test` corre todo; `npm run test:watch` durante la
construcción. Las pruebas viven en `.spec.ts` **junto al archivo que prueban**,
no en una carpeta paralela: así se ven juntas al leer y se borran juntas al
borrar.

Playwright llega con la interfaz que lo justifique (P7 y Pf). Antes sería una
dependencia sin usuario.

Nada de relojes falsos donde se pueda evitar: lo que depende del tiempo recibe
`now` por parámetro y se prueba con aritmética. El limitador de P0 ya se prueba
así, y el motor de disponibilidad de P5 hará lo mismo.

## Qué hay cubierto hoy — 76 pruebas

### P1 — capa visual, 20 pruebas

| Archivo | Qué fija |
|---|---|
| `styles/contrast.spec.ts` | Lee `tokens.css` y **calcula** la razón WCAG: AA de `--texto` y `--texto-2` sobre los dos fondos, en los cuatro contextos. Además, que `.inv` invierta `--fondo-2` y que el marcador de posición no use el token decorativo |
| `components/theme/theme-script-source.spec.ts` | **Ejecuta** el script del modo con `node:vm` contra un documento falso: respeta lo elegido, sigue al sistema en la primera visita, ignora un valor inválido, sobrevive a un almacenamiento roto y nunca deja la página sin modo |
| `components/theme/theme.spec.ts` | El contrato del modo |

Los componentes no llevan prueba de render. No se trajo entorno de DOM ni
biblioteca de pruebas de React: la interfaz se cubre con recorridos reales en P7
y Pf, que es donde `CLAUDE.md` §7 la pone.

### P0 — infraestructura, 56 pruebas

| Archivo | Qué fija |
|---|---|
| `logger.spec.ts` | RN12: los campos personales salen `[redactado]`; saltos de línea saneados; valores recortados |
| `describe-error.spec.ts` | Un `unknown` capturado se describe sin traza |
| `correlation-id.spec.ts` | Siempre hay identificador, aunque la petición no pase por el proxy |
| `rate-limit.spec.ts` | Límite, recuperación de ventana, aislamiento entre orígenes y bordes exactos |
| `client-ip.spec.ts` | Clave de origen desde la cadena de proxies |
| `security-headers.spec.ts` | Las seis cabeceras; **en producción no hay `unsafe-*`**; nonce distinto por petición |
| `api-error.spec.ts` | Formato único; mensaje sin trazas; `no-store`; el error se registra sin dato del visitante |
| `environment.spec.ts` | Arranca en demo sin variables; rechaza valores inventados nombrando la variable |
| `proxy.spec.ts` | Cabeceras aplicadas; el nonce de la petición y el de la respuesta coinciden; el identificador del cliente se descarta |
| `app/api/estado/route.spec.ts` | Responde sin credenciales; solo devuelve `estado` y `modo`; corta en 429 por origen |
