import Image from 'next/image';

import { Section } from '@/components/layout/section';
import { WorkTour } from '@/components/sections/work-tour';
import { HEADINGS } from '@/content/site-copy';
import { WORKS_UI } from '@/content/works-ui';
import type { Client, Work } from '@/modules/portfolio/domain/portfolio';
import { services } from '@/shared/infrastructure/config/service-registry';

import styles from './works.module.css';

/**
 * Los trabajos entregados, alimentados por el portafolio.
 *
 * **Si no hay ni un trabajo publicado, la sección no se pinta.** Ese es el
 * cambio que importa y no es de implementación: la versión anterior mostraba
 * seis clientes inventados bajo un titular que afirmaba que ya estaban en línea,
 * y el párrafo de apoyo confesaba en la misma pantalla que eran marcadores. Un
 * hueco es mejor que una prueba falsa — y ahora el hueco se llena desde `/admin`
 * en el momento en que se entrega un trabajo de verdad.
 *
 * **Dejó de ser una grilla de tres columnas.** Un trabajo con recorrido no cabe
 * en un tercio de ancho: el vídeo se vería como un sello. Ahora cada trabajo
 * ocupa la fila entera, con la pieza a un lado y su ficha al otro, y los lados se
 * alternan para que dos trabajos seguidos no se lean como la misma tarjeta
 * repetida.
 *
 * Hay tres formas de enseñar un trabajo, en este orden: el recorrido en vídeo,
 * la portada fija, y la portada tipográfica. La última es el respaldo — un
 * trabajo real cuya captura todavía no está lista se publica igual y se ve como
 * pieza, no como imagen rota.
 */

const IMAGE_SIZES = '(max-width: 900px) 100vw, 60vw';

/** Los lados se alternan cada dos trabajos: uno a la izquierda, el siguiente a la derecha. */
const CADA_DOS = 2;

/** Cuatro tratamientos rotados por posición: la lista no queda monótona. */
const TREATMENTS = ['plain', 'inverted', 'italic', 'uppercase'] as const;

function treatmentOf(index: number): string {
  const name = TREATMENTS[index % TREATMENTS.length] ?? 'plain';
  return styles[name] ?? '';
}

function Piece({ work, index }: { readonly work: Work; readonly index: number }) {
  if (work.tourUrl !== null) {
    return <WorkTour src={work.tourUrl} poster={work.coverUrl} label={work.clientName} />;
  }

  if (work.coverUrl !== null) {
    return (
      <Image
        className={styles['image']}
        src={work.coverUrl}
        alt={work.coverAlt}
        fill
        sizes={IMAGE_SIZES}
        unoptimized
      />
    );
  }

  return <span className={`${styles['mark']} ${treatmentOf(index)}`}>{work.clientName}</span>;
}

/**
 * El nombre del cliente es el enlace cuando el sitio está publicado.
 *
 * Sin `href` no hay enlace ni flecha, y en su lugar se dice por qué: un trabajo
 * entregado puede estar todavía sin publicar, y callarlo deja al visitante
 * preguntándose si la tarjeta está rota.
 */
function Title({ work }: { readonly work: Work }) {
  if (work.href === null) {
    return (
      <>
        <h3>{work.clientName}</h3>
        <span className={styles['pending']}>{WORKS_UI.notPublished}</span>
      </>
    );
  }

  return (
    <h3>
      <a
        className={styles['live']}
        href={work.href}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor-grow
      >
        {work.clientName}
        <span aria-hidden="true">↗</span>
      </a>
    </h3>
  );
}

function WorkRow({ work, index }: { readonly work: Work; readonly index: number }) {
  return (
    <li className={styles['work']} data-anim data-flip={index % CADA_DOS === 1 ? 'true' : undefined}>
      <div className={styles['canvas']} data-curtain>
        <Piece work={work} index={index} />
      </div>
      <div className={styles['file']}>
        <Title work={work} />
        <p className={styles['summary']}>{work.summary}</p>
        <dl className={styles['meta']}>
          <div>
            <dt>{WORKS_UI.kind}</dt>
            <dd>{work.kind}</dd>
          </div>
          <div>
            <dt>{WORKS_UI.year}</dt>
            <dd>{work.year}</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

function ClientWall({ clients }: { readonly clients: readonly Client[] }) {
  const withLogo = clients.filter((client) => client.logoUrl !== null);
  if (withLogo.length === 0) return null;

  return (
    <ul className={styles['wall']} data-anim>
      {withLogo.map((client) => (
        <li key={client.id}>
          <Image src={client.logoUrl ?? ''} alt={client.name} width={132} height={44} unoptimized />
        </li>
      ))}
    </ul>
  );
}

export async function Works() {
  const [works, clients] = await Promise.all([
    services.portfolio.listWorks({ status: 'published' }),
    services.portfolio.listClients({ status: 'published' }),
  ]);

  if (works.length === 0) return null;

  return (
    <Section id="trabajos" heading={HEADINGS.works}>
      <ul className={styles['list']} data-owns-anim data-grid-wave>
        {works.map((work, index) => (
          <WorkRow key={work.id} work={work} index={index} />
        ))}
      </ul>
      <ClientWall clients={clients} />
    </Section>
  );
}
