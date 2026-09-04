import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { FOOTER } from '@/content/site-copy';

import styles from './site-footer.module.css';

/**
 * El pie repite el titular de portada como cierre (`SPEC.md` §6.11) y **ahora
 * también dice quién es la empresa**.
 *
 * Antes era logotipo, una razón social sin explicar y el año. Para un dueño de
 * PYME que no conoce a Noctis, ese pie no contesta ninguna de las tres preguntas
 * que decide ahí: dónde están, cómo les escribo y a qué hora contestan. Sin
 * ciudad, sin RUC, sin teléfono y sin correo, una empresa de software que vende
 * a distancia se parece demasiado a nadie.
 *
 * **Ya están los datos.** RUC, dirección, correo y WhatsApp entraron el 3 de
 * septiembre de 2026 y viven en `content/site.ts`. Hasta ese día el pie salía
 * con logotipo, ciudad y año, y el sitio era anónimo.
 *
 * **Sin razón social, a pedido.** El RUC identifica la actividad comercial, que
 * es lo que un cliente comprueba, y lo hace sin publicar el nombre de una
 * persona. La firma del estudio no va en esa columna sino en la última línea,
 * junto al año: es crédito de autoría, no un dato de identidad, y mezclarla con
 * el RUC la hacía parecer lo segundo.
 *
 * La regla de omitir la línea vacía se queda igual. No era del momento en que
 * faltaban los datos: es la que impide publicar un marcador de posición donde va
 * un dato de identidad.
 *
 * **El WhatsApp no está acá, y es a propósito.** El botón flotante ya ofrece ese
 * canal, está siempre a la vista y lleva el mensaje precargado. Repetirlo en el
 * pie ponía dos destinos idénticos a pocos píxeles uno de otro y obligaba al
 * visitante a mirar si eran lo mismo. El pie se queda con lo que el botón no
 * puede dar: dónde están, a qué hora contestan y a qué correo se les escribe.
 */

function Line({ value }: { readonly value: string }) {
  if (value === '') return null;
  return <span>{value}</span>;
}

/**
 * El destino y lo que se lee son dos cosas distintas: el correo coinciden, el
 * teléfono no. El visitante lee «WhatsApp 098 010 5699» y el marcador recibe el
 * formato internacional, porque un `tel:` con espacios depende del capricho de
 * cada aplicación.
 *
 * Sigue devolviendo `null` con valor vacío. La regla no era del momento en que
 * faltaban los datos: es la que impide publicar un enlace de contacto que no
 * lleva a ninguna parte.
 */
function Contact({ href, value }: { readonly href: string; readonly value: string }) {
  if (value === '') return null;
  return <a href={href}>{value}</a>;
}

function Contacts() {
  return (
    <div className={styles['contacts']}>
      {/*
        La ciudad no lleva línea propia: la dirección termina en «Loja, Ecuador»
        y dos renglones seguidos diciendo lo mismo se leen como un error de
        maquetación, no como énfasis. `FOOTER.city` sigue existiendo porque lo
        consume el dato estructurado y la prueba de identidad.
      */}
      <Line value={FOOTER.address} />
      <Line value={FOOTER.hours} />
      <Contact href={`mailto:${FOOTER.email}`} value={FOOTER.email} />
    </div>
  );
}

function Legal() {
  return (
    <div className={styles['legal']}>
      <Line value={FOOTER.taxId} />
      <a href={FOOTER.privacyHref}>{FOOTER.privacyLabel}</a>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles['footer']} data-reveal-root>
      <Container>
        <p className={styles['phrase']} data-anim>
          {FOOTER.phrase}
        </p>
        <div className={styles['columns']} data-anim>
          <div className={styles['identity']}>
            <Logo />
            <span>{FOOTER.company}</span>
          </div>
          <Contacts />
          <Legal />
        </div>
        <div className={styles['inner']}>
          {/*
            La firma va en la última línea, con el año, y no en la columna de
            identidad. Ahí arriba se leía como un dato más de la empresa, al lado
            del RUC; acá abajo se lee como lo que es, el crédito de quien hizo la
            página. Es el sitio donde el visitante lo busca sin pensarlo.
          */}
          <span className={styles['credit']}>{FOOTER.credit}</span>
          <span className={styles['rights']}>{FOOTER.rights}</span>
        </div>
      </Container>
    </footer>
  );
}
