import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/content/admin";
import type { Client, Work } from "@/modules/portfolio/domain/portfolio";

import { notFound } from "next/navigation";

import styles from "./admin.module.css";
import { signIn, toggleClient, toggleWork } from "./actions";
import { ActionButton, PanelBar, SectionHead, StatusPill } from "./panel-parts";
import { hasSession, loadClients, loadWorks } from "./queries";
import { isAdminEnabled } from "@/shared/infrastructure/http/admin-session";

export const dynamic = "force-dynamic";

/** El panel no se indexa ni se sigue: no es contenido, es una puerta. */
export const metadata = { robots: { index: false, follow: false } };

type Query = Promise<Record<string, string | string[] | undefined>>;

const THUMB_WIDTH = 68;
const THUMB_HEIGHT = 44;

/**
 * `unoptimized` porque la fuente es una ruta de datos servida por `/media` y no
 * un estático conocido en tiempo de build: el optimizador tendría que
 * reprocesar la imagen en cada petición para una miniatura de 68 px. Se usa
 * `next/image` igual —y no `<img>`— porque desactivar el linter está prohibido
 * (`CLAUDE.md` §8) y la regla tiene razón: `<img>` sin dimensiones es
 * desplazamiento de diseño esperando a ocurrir.
 */
function Thumb({
  src,
  alt,
}: {
  readonly src: string | null;
  readonly alt: string;
}) {
  if (src === null) return null;
  return (
    <Image
      className={styles["thumb"]}
      src={src}
      alt={alt}
      width={THUMB_WIDTH}
      height={THUMB_HEIGHT}
      unoptimized
    />
  );
}

function SignIn({ error }: { readonly error: string | undefined }) {
  const message =
    error === "throttled"
      ? ADMIN_TEXT.signIn.throttled
      : ADMIN_TEXT.signIn.error;

  return (
    <main className={styles["signIn"]}>
      <form className={styles["signInCard"]} action={signIn}>
        <h1>{ADMIN_TEXT.signIn.title}</h1>
        <p>{ADMIN_TEXT.signIn.support}</p>
        {error !== undefined && <p className={styles["notice"]}>{message}</p>}
        <Field htmlFor="clave" label={ADMIN_TEXT.signIn.label}>
          <input
            id="clave"
            name="clave"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Button type="submit">{ADMIN_TEXT.signIn.submit}</Button>
      </form>
    </main>
  );
}

function WorkRow({ work }: { readonly work: Work }) {
  const toggle = toggleWork.bind(null, work.id);
  const label =
    work.status === "published"
      ? ADMIN_TEXT.actions.unpublish
      : ADMIN_TEXT.actions.publish;

  return (
    <tr>
      <td>
        <Thumb src={work.coverUrl} alt={work.coverAlt} />
      </td>
      <td>{work.clientName}</td>
      <td>{work.kind}</td>
      <td>{work.year}</td>
      <td>
        <StatusPill status={work.status} />
      </td>
      <td>
        <div className={styles["rowActions"]}>
          <ActionButton action={toggle} label={label} />
          <Button href={`/admin/trabajo/${work.id}`} variant="outline">
            {ADMIN_TEXT.actions.edit}
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ClientRow({ client }: { readonly client: Client }) {
  const toggle = toggleClient.bind(null, client.id);
  const label =
    client.status === "published"
      ? ADMIN_TEXT.actions.unpublish
      : ADMIN_TEXT.actions.publish;

  return (
    <tr>
      <td>
        <Thumb src={client.logoUrl} alt={client.name} />
      </td>
      <td>{client.name}</td>
      <td>{client.city}</td>
      <td>{client.sector}</td>
      <td>
        <StatusPill status={client.status} />
      </td>
      <td>
        <div className={styles["rowActions"]}>
          <ActionButton action={toggle} label={label} />
          <Button href={`/admin/cliente/${client.id}`} variant="outline">
            {ADMIN_TEXT.actions.edit}
          </Button>
        </div>
      </td>
    </tr>
  );
}

function WorksTable({ works }: { readonly works: readonly Work[] }) {
  if (works.length === 0)
    return <p className={styles["empty"]}>{ADMIN_TEXT.works.empty}</p>;

  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          <th aria-label={ADMIN_TEXT.workForm.cover} />
          <th>{ADMIN_TEXT.works.columns.client}</th>
          <th>{ADMIN_TEXT.works.columns.kind}</th>
          <th>{ADMIN_TEXT.works.columns.year}</th>
          <th>{ADMIN_TEXT.works.columns.status}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {works.map((work) => (
          <WorkRow key={work.id} work={work} />
        ))}
      </tbody>
    </table>
  );
}

function ClientsTable({ clients }: { readonly clients: readonly Client[] }) {
  if (clients.length === 0)
    return <p className={styles["empty"]}>{ADMIN_TEXT.clients.empty}</p>;

  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          <th aria-label={ADMIN_TEXT.clientForm.logo} />
          <th>{ADMIN_TEXT.clients.columns.name}</th>
          <th>{ADMIN_TEXT.clients.columns.city}</th>
          <th>{ADMIN_TEXT.clients.columns.sector}</th>
          <th>{ADMIN_TEXT.clients.columns.status}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <ClientRow key={client.id} client={client} />
        ))}
      </tbody>
    </table>
  );
}

async function Dashboard() {
  const [works, clients] = await Promise.all([loadWorks(), loadClients()]);

  return (
    <div className={styles["shell"]}>
      <PanelBar />
      <main className={styles["main"]}>
        <section>
          <SectionHead
            title={ADMIN_TEXT.works.title}
            support={ADMIN_TEXT.works.support}
            newHref="/admin/trabajo/nuevo"
            newLabel={ADMIN_TEXT.actions.newWork}
          />
          <WorksTable works={works} />
        </section>
        <section>
          <SectionHead
            title={ADMIN_TEXT.clients.title}
            support={ADMIN_TEXT.clients.support}
            newHref="/admin/cliente/nuevo"
            newLabel={ADMIN_TEXT.actions.newClient}
          />
          <ClientsTable clients={clients} />
        </section>
      </main>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  readonly searchParams: Query;
}) {
  // Sin clave configurada el panel no existe. Un 404 no confirma que la ruta
  // esté ahí, que es más de lo que dice un formulario de acceso.
  if (!isAdminEnabled()) notFound();

  const query = await searchParams;
  if (await hasSession()) return <Dashboard />;

  const error = typeof query["error"] === "string" ? query["error"] : undefined;
  return <SignIn error={error} />;
}
