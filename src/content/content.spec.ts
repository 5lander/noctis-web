import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PROCESS_STEPS } from './process';
import { PRODUCTS } from './products';
import { QUESTIONS } from './questions';
import { SERVICES } from './services';
import { CONTACT, FOOTER, HEADINGS, HERO, MARQUEE_ITEMS, QUOTE } from './site-copy';
import { WORKS } from './works';

/**
 * Reglas de negocio que viven en el contenido.
 *
 * Son las que ninguna comprobación de tipos puede hacer cumplir: que no aparezca
 * una palabra, que no se ofrezca algo que quedó fuera de alcance, que ningún
 * texto se escape a un componente. Un texto se cambia en cinco segundos y estas
 * pruebas son lo único que se entera.
 */

/** Todo el texto del sitio, aplanado, para poder buscar sobre el conjunto. */
const ALL_COPY: readonly string[] = [
  ...PRODUCTS.flatMap((p) => [p.scope, p.name, p.summary, p.audience, p.stageLabel, ...p.capabilities]),
  ...WORKS.flatMap((w) => [w.client, w.kind, w.year]),
  ...SERVICES.flatMap((s) => [s.name, s.description]),
  ...PROCESS_STEPS.flatMap((s) => [s.stage, s.title, s.description]),
  ...QUESTIONS.flatMap((q) => [q.question, q.answer]),
  // `satisfies` conserva el literal de cada encabezado, así que unos tienen
  // `support` y otros no: hay que estrechar antes de leerlo.
  ...Object.values(HEADINGS).flatMap((h) => [h.label, h.title, 'support' in h ? h.support : '']),
  HERO.headline,
  HERO.support,
  HERO.place,
  ...MARQUEE_ITEMS,
  CONTACT.title,
  CONTACT.support,
  ...CONTACT.interestOptions,
  FOOTER.phrase,
  FOOTER.company,
  QUOTE.text,
];

const JOINED = ALL_COPY.join(' ').toLowerCase();

describe('RN8 — el sitio no menciona lo que todavía no existe', () => {
  it('no aparece la facturación electrónica ni el organismo tributario', () => {
    expect(JOINED).not.toMatch(/\bsri\b/);
    expect(JOINED).not.toContain('facturación electrónica');
    expect(JOINED).not.toContain('facturacion electronica');
  });
});

describe('alcance comercial — SPEC §5.2', () => {
  it('no se ofrece software a medida ni integraciones', () => {
    const offered = SERVICES.map((s) => `${s.name} ${s.description}`)
      .join(' ')
      .toLowerCase();

    // "a medida que el negocio crece" es otra cosa: lo vetado es el servicio.
    expect(offered).not.toMatch(/(?:software|desarrollo|sistema)s? a (?:la )?medida/);
    expect(offered).not.toMatch(/\bintegracion(?:es)?\b/);
  });
});

describe('precios — RN5 y la primera pregunta', () => {
  it('ningún texto del sitio da una cifra', () => {
    expect(JOINED).not.toMatch(/\$|\busd\b|\bdólares\b/);
  });

  it('la pregunta del precio deriva a proforma en vez de contestar con un número', () => {
    const price = QUESTIONS.find((q) => q.id === 'precio');

    expect(price?.answer).toContain('proforma');
  });
});

describe('las listas tienen la cantidad que dice el SPEC', () => {
  it.each([
    ['productos', PRODUCTS.length, 4],
    ['trabajos', WORKS.length, 6],
    ['servicios', SERVICES.length, 5],
    ['pasos del proceso', PROCESS_STEPS.length, 3],
    ['preguntas', QUESTIONS.length, 4],
  ])('%s: %i', (_name, actual, expected) => {
    expect(actual).toBe(expected);
  });

  it('no hay identificadores repetidos', () => {
    for (const list of [PRODUCTS, WORKS, SERVICES, PROCESS_STEPS, QUESTIONS]) {
      const ids = list.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('estado de los productos — RN6', () => {
  it('cada producto declara su estado y su rótulo', () => {
    for (const product of PRODUCTS) {
      expect(product.stageLabel).not.toBe('');
      expect(['disponible', 'en-pruebas', 'en-desarrollo', 'proyecto-futuro']).toContain(
        product.stage,
      );
    }
  });

  it('solo Automatización está disponible hoy (SPEC §5.1)', () => {
    const available = PRODUCTS.filter((p) => p.stage === 'disponible');

    expect(available.map((p) => p.id)).toEqual(['automatizacion']);
  });
});

describe('trabajos — pendientes del cliente (C1)', () => {
  it('los seis siguen siendo marcadores de posición', () => {
    expect(WORKS.every((w) => w.placeholder)).toBe(true);
  });

  it('todos tienen tipo y año, que es lo que se muestra bajo la portada', () => {
    for (const work of WORKS) {
      expect(work.kind).not.toBe('');
      expect(work.year).toMatch(/^\d{4}$/);
    }
  });
});

describe('testimonio — pendiente del cliente (C2)', () => {
  it('sigue marcado como pendiente, así que la sección no se publica', () => {
    expect(QUOTE.pending).toBe(true);
  });

  it('el nombre sigue entre corchetes: si alguien lo quita sin poner el real, esto avisa', () => {
    expect(QUOTE.author).toMatch(/^\[.*\]$/);
  });
});

/**
 * El criterio de aceptación de P2: **ningún texto de cara al usuario vive dentro
 * de un componente.** Se busca texto suelto entre etiquetas JSX.
 */
const COMPONENT_DIRS = ['src/components', 'src/app'];
const JSX_TEXT = />\s*([^<>{}\n]*[a-záéíóúñ]{3,}[^<>{}]*)\s*</gi;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const LINE_COMMENT = /^\s*\/\/.*$/gm;

/** Los comentarios explican el porqué en español; no son texto de la interfaz. */
function withoutComments(source: string): string {
  return source.replace(BLOCK_COMMENT, '').replace(LINE_COMMENT, '');
}

function tsxFilesIn(directory: string, found: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) tsxFilesIn(path, found);
    else if (entry.endsWith('.tsx')) found.push(path);
  }
  return found;
}

describe('ningún texto de cara al usuario dentro de un componente', () => {
  it('no hay texto suelto entre etiquetas JSX', () => {
    const offenders: string[] = [];

    for (const directory of COMPONENT_DIRS) {
      for (const file of tsxFilesIn(directory)) {
        for (const match of withoutComments(readFileSync(file, 'utf8')).matchAll(JSX_TEXT)) {
          offenders.push(`${file}: ${match[1]?.trim() ?? ''}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
