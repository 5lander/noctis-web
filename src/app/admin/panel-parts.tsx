import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ADMIN_TEXT } from "@/content/admin";
import type { PublicationStatus } from "@/modules/portfolio/domain/portfolio";

import styles from "./admin.module.css";
import { signOut } from "./actions";

/**
 * Las piezas que se repiten en las tres pantallas del panel.
 *
 * Están acá y no dentro de cada página porque `jscpd` mide duplicación y una
 * barra copiada tres veces la dispara — pero sobre todo porque el rótulo de
 * estado tiene que decir lo mismo en la lista y en el formulario, y dos copias
 * garantizan que un día no lo diga.
 */

export function PanelBar() {
  return (
    <header className={styles["bar"]}>
      <strong>{ADMIN_TEXT.brand}</strong>
      <nav>
        <Link href="/">{ADMIN_TEXT.nav.site}</Link>
        <form action={signOut}>
          <button type="submit">{ADMIN_TEXT.signOut}</button>
        </form>
      </nav>
    </header>
  );
}

export function StatusPill({ status }: { readonly status: PublicationStatus }) {
  const published = status === "published";
  const className = published
    ? `${styles["pill"]} ${styles["pillOn"]}`
    : styles["pill"];
  return (
    <span className={className}>
      {published ? ADMIN_TEXT.status.published : ADMIN_TEXT.status.draft}
    </span>
  );
}

export interface SectionHeadProps {
  readonly title: string;
  readonly support: string;
  readonly newHref: string;
  readonly newLabel: string;
}

export function SectionHead(props: SectionHeadProps) {
  return (
    <div className={styles["head"]}>
      <div>
        <h2>{props.title}</h2>
        <p>{props.support}</p>
      </div>
      <Button href={props.newHref}>{props.newLabel}</Button>
    </div>
  );
}

/**
 * El armazón de las dos pantallas de edición: barra, título y aviso.
 *
 * Lo que quedaba duplicado entre `trabajo/[id]` y `cliente/[id]` después de
 * extraer los botones era justamente esto, y `jscpd` lo volvió a marcar. La
 * forma de una pantalla del panel es una decisión, y una decisión vive en un
 * sitio.
 */
export function EditorShell({
  title,
  error,
  children,
}: {
  readonly title: string;
  readonly error: string | string[] | undefined;
  readonly children: ReactNode;
}) {
  return (
    <div className={styles["shell"]}>
      <PanelBar />
      <main className={styles["main"]}>
        <div className={styles["head"]}>
          <h2>{title}</h2>
        </div>
        <Notice error={error} />
        {children}
      </main>
    </div>
  );
}

/**
 * El aviso de error y la fila de botones de los dos editores.
 *
 * Estaban copiados en `trabajo/[id]` y en `cliente/[id]`, y `jscpd` los marcó
 * como clon. La duplicación importa acá por una razón concreta: si mañana el
 * botón de borrar necesita confirmación, hay dos sitios donde ponerla y uno se
 * va a quedar sin ella.
 */
function Notice({
  error,
}: {
  readonly error: string | string[] | undefined;
}) {
  if (error === "invalid")
    return <p className={styles["notice"]}>{ADMIN_TEXT.errors.invalid}</p>;
  if (error === "upload")
    return <p className={styles["notice"]}>{ADMIN_TEXT.errors.upload}</p>;
  return null;
}

/**
 * Los tres botones del pie de un editor: guardar, cancelar y eliminar.
 *
 * **Eliminar no puede ser un `ActionButton` acá.** Esta fila vive dentro del
 * `<form>` de guardado, y `ActionButton` trae su propio `<form>`: anidar uno
 * dentro de otro es HTML inválido y el navegador no lo perdona en silencio —
 * descarta la etiqueta interna, deja sus campos `$ACTION_*` colgando del
 * formulario de fuera y cierra ese formulario en el `</form>` de la etiqueta que
 * descartó. El resultado no era un aviso de consola: el botón de eliminar
 * enviaba el formulario de guardar, con los dos identificadores de acción
 * mezclados en el mismo envío. Se arregla con `formAction`, que es el mecanismo
 * que HTML tiene para que un botón envíe su formulario a otro destino.
 */
export function FormActions({ drop }: { readonly drop: () => Promise<void> }) {
  return (
    <div className={styles["formActions"]}>
      <Button type="submit">{ADMIN_TEXT.actions.save}</Button>
      <Button href="/admin" variant="outline">
        {ADMIN_TEXT.actions.cancel}
      </Button>
      <span className={styles["danger"]}>
        <Button type="submit" variant="outline" formAction={drop} formNoValidate>
          {ADMIN_TEXT.actions.remove}
        </Button>
      </span>
    </div>
  );
}

/**
 * Un botón que dispara una acción de servidor sin JavaScript en el cliente.
 *
 * **Solo fuera de un formulario.** Trae el suyo propio, así que dentro de otro
 * produce el anidamiento que documenta `FormActions`. Para un botón con acción
 * propia dentro de un formulario existente, `Button` con `formAction`.
 */
export function ActionButton({
  action,
  label,
}: {
  readonly action: () => Promise<void>;
  readonly label: string;
}) {
  return (
    <form action={action}>
      <Button type="submit" variant="outline">
        {label}
      </Button>
    </form>
  );
}
