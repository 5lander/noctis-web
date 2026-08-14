import type { Work } from './types';

/**
 * Los seis trabajos del portafolio.
 *
 * **Todos son marcadores de posición** (`SPEC.md` §5.3, `DECISIONES.md` C1):
 * los nombres son inventados y las portadas, tipográficas. Cuando lleguen los
 * trabajos reales con nombre autorizado, enlace y captura, se cambia esta lista
 * y `cover` pasa a `{ kind: 'image' }`. **El componente no se toca**: acepta las
 * dos formas desde el primer día.
 */
export const WORKS: readonly Work[] = [
  {
    id: 'lubricadora-del-sur',
    client: 'Lubricadora del Sur',
    kind: 'Sitio + WhatsApp',
    year: '2026',
    href: '#trabajos',
    cover: { kind: 'typographic', lines: ['Lubricadora', 'del Sur'], treatment: 'plain' },
    placeholder: true,
  },
  {
    id: 'arrocera-andina',
    client: 'Arrocera Andina',
    kind: 'Catálogo y pedidos',
    year: '2026',
    href: '#trabajos',
    cover: { kind: 'typographic', lines: ['ARROCERA', 'ANDINA'], treatment: 'inverted' },
    placeholder: true,
  },
  {
    id: 'papeleria-central',
    client: 'Papelería Central',
    kind: 'Tienda en línea',
    year: '2026',
    href: '#trabajos',
    cover: { kind: 'typographic', lines: ['Papelería', 'Central'], treatment: 'italic' },
    placeholder: true,
  },
  {
    id: 'consultorio-vera',
    client: 'Consultorio Vera',
    kind: 'Agenda con Care',
    year: '2026',
    href: '#trabajos',
    cover: { kind: 'typographic', lines: ['Consultorio', 'Vera'], treatment: 'uppercase' },
    placeholder: true,
  },
  {
    id: 'distribuidora-bahia',
    client: 'Distribuidora Bahía',
    kind: 'Inventario y ventas',
    year: '2025',
    href: '#trabajos',
    cover: { kind: 'typographic', lines: ['Distribuidora', 'Bahía'], treatment: 'plain' },
    placeholder: true,
  },
  {
    id: 'estudio-marino',
    client: 'Estudio Marino',
    kind: 'Rediseño de sitio',
    year: '2025',
    href: '#trabajos',
    cover: { kind: 'typographic', lines: ['ESTUDIO', 'MARINO'], treatment: 'inverted' },
    placeholder: true,
  },
];
