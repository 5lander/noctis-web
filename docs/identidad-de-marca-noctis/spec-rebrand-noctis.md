# Spec: Actualización de identidad visual — Sitio web Noctis

## Contexto
El sitio web de Noctis debe actualizarse para reflejar la nueva identidad de marca definida (estrategia, personalidad, sistema visual y logo). Este documento es la fuente de verdad para esa actualización. Adjunto al mismo paquete van los archivos de logo en SVG (`logo-final.svg`, `logo-final-modo-oscuro.svg`, `logo-final-apilado.svg`, `logo-final-monocromo.svg`, `favicon.svg`) y el manual de marca completo en PDF (`manual-de-marca.pdf`) con el detalle de cada decisión.

## 1. Paleta de colores — reemplazar completamente la paleta actual

Usar tokens semánticos (no hardcodear hex sueltos por el código):

```css
:root {
  /* Modo claro (default) */
  --color-fondo: #FAFAFA;
  --color-superficie: #FFFFFF;
  --color-texto-primario: #18181B;
  --color-texto-secundario: #52525B;
  --color-marca: #3730A3;
  --color-accion: #3730A3;
  --color-acento: #C4B5FD;
}

[data-theme="dark"] {
  /* Modo oscuro — fondo con tinte violeta, nunca negro puro */
  --color-fondo: #0A0A12;
  --color-superficie: #14131F;
  --color-texto-primario: #F4F4F5;
  --color-texto-secundario: #A1A1AA;
  --color-marca: #4338CA;
  --color-accion: #C4B5FD;
  --color-acento: #C4B5FD;
}
```

Todas las combinaciones de texto/fondo pasan WCAG AA (ratio ≥4.5:1) — no ajustar los tonos sin volver a verificar contraste.

## 2. Tipografía — reemplazar la tipografía actual

- **Títulos (h1-h4):** Source Serif 4, peso 600 (SemiBold). Google Fonts: `Source Serif 4`.
- **Texto/UI (body, botones, nav):** Inter, pesos 400/500/600.
- Cargar solo los pesos usados para no penalizar performance (400, 500, 600 de Inter; 600 de Source Serif 4).

## 3. Logo — reemplazar el logo actual en todo el sitio

- Usar `logo-final.svg` en modo claro y `logo-final-modo-oscuro.svg` en modo oscuro (togglear según `data-theme`).
- `favicon.svg` reemplaza el favicon actual.
- `logo-final-apilado.svg` para espacios cuadrados (ej. compartir en redes, si aplica).
- **Nunca** deformar, rotar, ni recolorear el logo fuera de estos archivos provistos.
- Área de seguridad mínima alrededor del logo: equivalente a la altura de la "N" del logotipo.
- Tamaño mínimo: 90px de ancho para la versión horizontal completa.

## 4. Modo claro/oscuro
- El sitio ya contempla ambos modos — mantener el toggle existente, pero migrar todos los colores hardcodeados a los tokens de la sección 1.
- El modo oscuro nunca debe usar negro puro (`#000000`) como fondo — siempre `#0A0A12` (con el tinte violeta) o `#14131F` para superficies/tarjetas.

## 5. Estilo general y motion
- Minimalista, mucho espacio en blanco, inspirado en Vercel (geometría técnica) + Notion (calidez editorial).
- Acabado premium tipo iPhone: transiciones y animaciones suaves (nada abrupto), materiales tipo vidrio esmerilado (`backdrop-filter: blur()` con superficies semitransparentes) en tarjetas/paneles flotantes, navbar, modales.
- Mantener GSAP para las animaciones existentes/planeadas — las transiciones deben sentirse fluidas, no bruscas, coherente con el tono "Gobernante + Cuidador" (estructurado, pero cálido).

## 6. Tono de contenido (copy)
Todo el copy del sitio debe seguir estas reglas al reescribirse o redactarse:
- **Cercana pero no confianzuda** — trato profesional, no informal de más.
- **Meticulosa pero no obsesiva al punto de frenar** — clara y precisa, sin párrafos eternos.
- **Estructurada pero no rígida.**
- **Constante pero no dispersa.**
- Mismo tono en todos los textos del sitio; más sobrio y directo solo en mensajes de error o estados delicados (ej. "no pudimos procesar tu solicitud").
- Mensaje central que debe aparecer en el hero o cerca: la idea de **"todo bajo una sola relación"** — web, automatización, infraestructura y acompañamiento en un solo lugar.
- Nunca prometer plazos que no se puedan cumplir en ningún copy de CTA o formulario.

## 7. Activos distintivos — no negociables en el rediseño
Estos 5 elementos deben estar presentes y ser consistentes en todo el sitio:
1. Índigo (`#3730A3`) + lavanda (`#C4B5FD`) como par de color de marca.
2. Tinte violeta del fondo oscuro (nunca negro puro).
3. Contraste Source Serif 4 (títulos) / Inter (texto).
4. Transiciones suaves + vidrio esmerilado en superficies flotantes.
5. El mensaje "todo bajo una sola relación" presente en el sitio.

## 8. Qué NO tocar en este pase
- La estructura de contenido/productos a mostrar (Commerce, Care, automatización, agendamiento) — eso ya está definido aparte y no es parte de este rebrand visual.
- El módulo de agendamiento + bot conversacional — funcionalidad ya especificada por separado.

## Archivos adjuntos a este spec
- `logo-final.svg`, `logo-final-modo-oscuro.svg`, `logo-final-apilado.svg`, `logo-final-monocromo.svg`, `favicon.svg`
- `manual-de-marca.pdf` (referencia completa de la identidad, con ejemplos aplicados y reglas de uso del logo)
