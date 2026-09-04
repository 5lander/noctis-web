import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { NIGHT_LOG_CAPTION } from './night-log';
import { PROCESS_STEPS } from './process';
import { PRODUCTS } from './products';
import { QUESTIONS } from './questions';
import { SERVICES } from './services';
import { CONTACT, FOOTER, HEADINGS, HERO, MARQUEE_ITEMS, QUOTE } from './site-copy';

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
  ...PRODUCTS.flatMap((p) => [p.name, p.summary, p.audience, p.stageLabel, p.shot.alt, ...p.capabilities]),
  ...SERVICES.flatMap((s) => [s.name, s.description]),
  ...PROCESS_STEPS.flatMap((s) => [s.title, s.description]),
  ...QUESTIONS.flatMap((q) => [q.question, q.answer]),
  // `satisfies` conserva el literal de cada encabezado, así que unos tienen
  // `support` y otros no: hay que estrechar antes de leerlo.
  ...Object.values(HEADINGS).flatMap((h) => [h.title, 'support' in h ? h.support : '']),
  HERO.headline,
  HERO.support,
  HERO.place,
  ...MARQUEE_ITEMS,
  CONTACT.title,
  CONTACT.support,
  ...CONTACT.interestOptions,
  FOOTER.phrase,
  FOOTER.company,
  FOOTER.city,
  FOOTER.hours,
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

/**
 * La distinción entre método y catálogo, fijada.
 *
 * El titular dice «Software hecho a la medida de cómo trabaja su negocio», que es
 * una afirmación sobre cómo se construye. La lista de servicios no vende el
 * encargo abierto, y `SPEC.md` §5.2 lo deja fuera del alcance comercial.
 *
 * Las dos cosas conviven, pero la frontera es fina: basta con que alguien
 * reescriba el titular como «desarrollamos el sistema a la medida que usted
 * necesite» para que la página empiece a prometer lo que nadie vende. Esta prueba
 * es la que avisa.
 *
 * Lo que se prohíbe es el **ofrecimiento**, no la palabra: «a la medida de cómo
 * trabaja su negocio» describe el ajuste; «software a medida» a secas, precedido
 * de un verbo de oferta, es el servicio que quedó fuera.
 */
describe('el titular describe un método, no ofrece un encargo abierto', () => {
  const OFRECIMIENTO = /(?:hacemos|desarrollamos|creamos|construimos|ofrecemos)[^.]{0,40}\b(?:software|sistemas?|desarrollos?) a (?:la )?medida/i;

  it('el titular no ofrece desarrollo a medida como servicio', () => {
    expect(HERO.headline).not.toMatch(OFRECIMIENTO);
  });

  it('la bajada tampoco lo ofrece', () => {
    expect(HERO.support).not.toMatch(OFRECIMIENTO);
  });

  /*
   * La otra mitad de la afirmación: si el titular dice que el software se ajusta
   * al negocio, la lista tiene que sostenerlo. Con servicios genéricos —«página
   * web», «CRM», a secas— el titular sería una promesa que nada respalda.
   */
  it('los servicios sostienen la promesa de ajuste', () => {
    const offered = SERVICES.map((service) => service.description).join(' ').toLowerCase();

    expect(offered).toMatch(/su negocio|que ya tiene|le sirva|nadie llena/);
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

/**
 * El sitio pasó a dar montos, y esta prueba cambió con esa decisión en vez de
 * borrarse.
 *
 * Hasta el 3 de septiembre de 2026 ningún texto podía llevar una cifra: D13 de
 * `DECISIONES.md` decía «los precios no se muestran» y acá se comprobaba que no
 * apareciera ni `$` ni `USD` ni «dólares». D13 pasó a verde con tres montos
 * anotados, así que lo que se vigila ahora es otra cosa.
 *
 * **Lo que no cambió es el fondo de RN5.** Un piso filtra; un precio cerrado
 * compromete. Por eso se sigue exigiendo que la respuesta derive a proforma, y
 * se añade que los montos vengan dichos como pisos: si alguien reescribe la
 * respuesta como tarifa fija, esto avisa.
 *
 * Los montos se comprueban uno por uno. No es celo: es que son la única cifra
 * del sitio que compromete dinero, y un dedo de más en un número publicado es un
 * problema comercial, no un error de copia.
 */
describe('precios — RN5 y la primera pregunta', () => {
  const price = QUESTIONS.find((question) => question.id === 'precio');

  it('los montos publicados son los que aprobó D13', () => {
    expect(price?.answer).toContain('USD 890');
    expect(price?.answer).toContain('USD 39');
    expect(price?.answer).toContain('USD 90');
  });

  it('los montos son pisos, no tarifas cerradas', () => {
    expect(price?.answer).toContain('desde USD 890');
    expect(price?.answer).toContain('desde USD 39');
  });

  it('la respuesta sigue derivando a proforma', () => {
    expect(price?.answer).toContain('proforma');
  });

  /*
   * Los montos viven en una sola respuesta. Sueltos por la página envejecen sin
   * que nadie se entere, y el día que suban habría que ir a buscarlos.
   */
  it('ningún otro texto del sitio repite una cifra de dinero', () => {
    const withoutPrice = ALL_COPY.filter((text) => text !== price?.answer).join(' ');

    expect(withoutPrice).not.toMatch(/\$|\bUSD\b|\bdólares\b/i);
  });
});

/*
 * Los productos bajaron de cuatro a tres: «Reclutamiento por chat» salió del
 * catálogo por decisión del usuario, porque es un proyecto aparte y no uno de los
 * productos que esta página vende. `SPEC.md` §5.1 ya lo refleja.
 *
 * Los servicios subieron de cinco a seis y las preguntas de cuatro a siete, en
 * la pasada de textos del 3 de septiembre de 2026. El servicio nuevo es «Página
 * web nueva», que era lo más raro que tenía el sitio: lo que más se enseñaba no
 * estaba a la venta. Las tres preguntas nuevas contestan objeciones humanas
 * —quiénes son, si un negocio chico les interesa, si atienden fuera de Loja—
 * mientras que las cuatro viejas contestaban solo técnicas.
 */
describe('las listas tienen la cantidad que dice el SPEC', () => {
  it.each([
    ['productos', PRODUCTS.length, 3],
    ['servicios', SERVICES.length, 6],
    ['pasos del proceso', PROCESS_STEPS.length, 3],
    ['preguntas', QUESTIONS.length, 7],
  ])('%s: %i', (_name, actual, expected) => {
    expect(actual).toBe(expected);
  });

  it('no hay identificadores repetidos', () => {
    for (const list of [PRODUCTS, SERVICES, PROCESS_STEPS, QUESTIONS]) {
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

/**
 * Los seis trabajos inventados se fueron: la sección se alimenta del portafolio
 * y solo pinta lo que alguien publicó desde el panel. Lo que sí hay que fijar es
 * que **no vuelvan** por la puerta de atrás — que nadie reintroduzca una lista de
 * clientes escrita a mano en `content/`, que es exactamente lo que la auditoría
 * marcó como hallazgo crítico.
 */
describe('trabajos — ya no son contenido escrito a mano', () => {
  it('no existe una lista de trabajos en content/', () => {
    const files = readdirSync('src/content');

    expect(files).not.toContain('works.ts');
  });

  it('el apoyo de la sección no anuncia marcadores de posición', () => {
    expect(HEADINGS.works.support.toLowerCase()).not.toContain('marcador');
  });
});

describe('identidad — la empresa es de Loja', () => {
  it('la portada y el pie dicen Loja, no otra ciudad', () => {
    expect(HERO.place).toContain('Loja');
    expect(FOOTER.city).toContain('Loja');
    expect(FOOTER.address).toContain('Loja');
  });

  it('ningún texto del sitio sigue diciendo Guayaquil', () => {
    expect(JOINED).not.toContain('guayaquil');
  });
});

/**
 * El titular cambió de estrategia el 3 de septiembre de 2026 y esta prueba
 * cambió con él.
 *
 * Antes exigía las palabras «horas» y «ventas», porque la portada abría por la
 * pérdida. Ahora abre por la categoría: dice qué es Noctis antes de decir qué se
 * gana. Exigir las dos palabras habría obligado a torcer el titular nuevo para
 * cumplir una decisión que ya no rige.
 *
 * Lo que se sigue vigilando es lo que hacía valiosa la regla vieja: **que el
 * titular nombre algo que se compra**. Si alguien lo reescribe en abstracto
 * —«optimizamos sus procesos», «impulsamos su transformación digital»— esto
 * avisa, que era el punto desde el principio.
 */
describe('titular — dice qué se compra, no una abstracción', () => {
  it('el titular nombra una categoría concreta de trabajo', () => {
    const concreto = /software|página|páginas|sistema|sistemas|automatización/i;

    expect(HERO.headline).toMatch(concreto);
  });

  /*
   * La lista negra son las frases que dice cualquier proveedor y que no
   * significan nada para un dueño de negocio. No es exhaustiva: es la vacuna
   * contra las tres que aparecen solas cuando alguien «pule» un titular.
   */
  it('no cae en la jerga que no dice nada', () => {
    const vacio = /transformación digital|soluciones integrales|optimizamos sus procesos|potenciamos/i;

    expect(HERO.headline).not.toMatch(vacio);
    expect(HERO.support).not.toMatch(vacio);
  });

  /*
   * La bajada tiene un tope de veinte palabras y hasta hoy solo estaba escrito en
   * un comentario. La portada ya se pasó una vez —treinta y dos palabras
   * empujaron los botones fuera del primer pantallazo— y un comentario no impidió
   * que pasara.
   */
  it('la bajada no pasa de veinte palabras', () => {
    expect(HERO.support.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(20);
  });

  it('cierra con el estado al que se llega, no con la pérdida', () => {
    expect(FOOTER.phrase).not.toBe(HERO.headline);
    expect(FOOTER.phrase.toLowerCase()).not.toContain('cuesta');
  });

  it('el registro nocturno sigue declarándose ejemplo', () => {
    expect(NIGHT_LOG_CAPTION.toLowerCase()).toContain('ejemplo');
  });
});

describe('jerarquía de llamadas a la acción', () => {
  it('la acción principal de la portada es contactar, no ver el portafolio', () => {
    expect(HERO.primary.href).toBe('#contacto');
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

/**
 * Una flecha de función no es una etiqueta que cierra.
 *
 * El buscador de texto suelto es una heurística sobre `>` … `<`, y el `>` de
 * `=>` la engaña dos veces: `(c) => c.logoUrl !== null)` y
 * `action: () => Promise<void>` se leen como texto entre etiquetas. Quitar solo
 * el `>` de la flecha desarma las dos sin aflojar nada de lo que la prueba
 * busca: en JSX real, `=>` nunca precede a texto visible.
 */
const ARROW = /=>/g;

/**
 * Un argumento de tipo tampoco es una etiqueta.
 *
 * `useState<Estado>(...)`, `Promise<void>` y `FormEvent<HTMLFormElement>` le dan
 * al buscador un `>` y un `<` con código en medio, y lo que hay en medio se
 * lee como texto de interfaz. Aparecieron todos juntos al conectar el
 * formulario, que es el primer componente de cliente con estado tipado.
 *
 * La regla que los distingue es exacta y no una lista de excepciones: **un
 * argumento de tipo va pegado a su nombre** —`useState<`— mientras que una
 * etiqueta JSX siempre viene después de un espacio, un salto, un paréntesis o
 * una llave. Por eso solo se descarta el `<` precedido de un carácter de
 * identificador. Se aplica dos veces por los genéricos anidados, que es todo lo
 * que se anida en este proyecto.
 */
const TYPE_ARGUMENT = /(?<=[A-Za-z0-9_])<[^<>]*>/g;

/** Los comentarios explican el porqué en español; no son texto de la interfaz. */
function withoutComments(source: string): string {
  return source
    .replace(BLOCK_COMMENT, '')
    .replace(LINE_COMMENT, '')
    .replace(ARROW, '= ')
    .replace(TYPE_ARGUMENT, '')
    .replace(TYPE_ARGUMENT, '');
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
