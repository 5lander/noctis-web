import { AnimationLayer } from '@/components/animation/animation-layer';
import { NavBar, type NavLink } from '@/components/layout/nav-bar';
import { NavContrast } from '@/components/layout/nav-contrast';
import { SiteFooter } from '@/components/layout/site-footer';
import { WhatsAppFloating } from '@/components/layout/whatsapp-link';
import { Contact } from '@/components/sections/contact';
import { DesignLanguages } from '@/components/sections/design-languages';
import { Hero } from '@/components/sections/hero';
import { Marquee } from '@/components/sections/marquee';
import { NightLogSection } from '@/components/sections/night-log-section';
import { Process } from '@/components/sections/process';
import { Products } from '@/components/sections/products';
import { ProofBand } from '@/components/sections/proof-band';
import { Questions } from '@/components/sections/questions';
import { Quote } from '@/components/sections/quote';
import { Services } from '@/components/sections/services';
import { Works } from '@/components/sections/works';
import { NAV_LINKS } from '@/content/site-copy';
import { services } from '@/shared/infrastructure/config/service-registry';
import {
  readSentOutcome,
  SENT_PARAM,
  type SentOutcome,
} from '@/shared/infrastructure/http/contact-redirect';
import { requestStartedAt } from '@/shared/infrastructure/http/request-clock';

/**
 * La página, en el orden exacto del prototipo (`SPEC.md` §6).
 *
 * Solo composición: ni un texto, ni una clase visual, ni una decisión. Cada
 * sección sabe cómo se pinta y saca su contenido de `content/`.
 *
 * Los dos envoltorios son el andamio que `ScrollSmoother` necesita para desfasar
 * el contenido (RA-08). Están siempre, aunque el suavizado no arranque: dos
 * `div` sin estilo no cambian nada y evitan que la estructura del documento
 * dependa de si un plugin llegó a ejecutarse. La barra queda **fuera** a
 * propósito — es fija, y lo que está dentro del envoltorio se desplaza.
 *
 * `Quote` puede devolver nada: el testimonio no se publica hasta tener el
 * nombre real (C2).
 *
 * `ProofBand` va entre la marquesina y los productos porque ese es el punto
 * donde el visitante decide si sigue bajando, y lo que decide eso es si cree
 * que hay alguien detrás. Sus cifras son comprobables: ver `content/proof.ts`.
 *
 * La página lee un solo parámetro de la URL, y solo por una razón: cuando el
 * formulario se envía **sin JavaScript**, la ruta contesta con una redirección
 * de vuelta acá y el resultado viaja ahí. Cualquier otro valor se ignora — lo
 * que llega por la URL es dato y no instrucción, así que `readSentOutcome`
 * devuelve `null` para todo lo que no sea uno de los dos que conoce.
 */
type SearchParams = Promise<Record<string, string | readonly string[] | undefined>>;

interface PageState {
  readonly outcome: SentOutcome | null;
  readonly startedAt: number;
  readonly hasWorks: boolean;
  readonly links: readonly NavLink[];
}

/**
 * Todo lo que la página necesita saber antes de pintar, resuelto de una vez.
 *
 * Si no hay trabajos publicados la sección no se pinta, así que su enlace
 * tampoco: un ancla hacia un `id` que no está en el documento no hace nada. La
 * misma condición gobierna el segundo botón de la portada, que llegó a salir
 * siempre — el botón que promete la prueba del sitio no llevaba a ninguna parte
 * mientras el portafolio estuviera vacío.
 */
async function readPageState(searchParams: SearchParams): Promise<PageState> {
  const enviado = (await searchParams)[SENT_PARAM];
  const works = await services.portfolio.listWorks({ status: 'published' });
  const hasWorks = works.length > 0;

  return {
    outcome: readSentOutcome(typeof enviado === 'string' ? enviado : undefined),
    startedAt: await requestStartedAt(),
    hasWorks,
    links: NAV_LINKS.filter((link) => link.id !== 'trabajos' || hasWorks),
  };
}

export default async function HomePage({
  searchParams,
}: {
  readonly searchParams: SearchParams;
}) {
  const { outcome, startedAt, hasWorks, links } = await readPageState(searchParams);

  return (
    <>
      <NavBar links={links} />
      <NavContrast />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Hero showWorksLink={hasWorks} />
            <NightLogSection />
            <Marquee />
            <ProofBand />
            <Products />
            <Works />
            <DesignLanguages />
            <Services />
            <Process />
            <Quote />
            <Questions />
            <Contact outcome={outcome} startedAt={startedAt} />
          </main>
          <SiteFooter />
        </div>
      </div>
      <WhatsAppFloating />
      <AnimationLayer />
    </>
  );
}
