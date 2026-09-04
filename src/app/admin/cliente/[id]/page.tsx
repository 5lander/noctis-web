import { Field } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/content/admin";
import type { Client } from "@/modules/portfolio/domain/portfolio";

import styles from "../../admin.module.css";
import { removeClient, saveClient } from "../../actions";
import { EditorShell, FormActions } from "../../panel-parts";
import { loadClient } from "../../queries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

type Params = Promise<{ id: string }>;

type Query = Promise<Record<string, string | string[] | undefined>>;

function Logo({ client }: { readonly client: Client }) {
  return (
    <>
      <Field htmlFor="logo" label={ADMIN_TEXT.clientForm.logo}>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
        />
        <small className={styles["hint"]}>
          {ADMIN_TEXT.clientForm.logoHint}
        </small>
      </Field>
      <input type="hidden" name="logoUrl" value={client.logoUrl ?? ""} />
    </>
  );
}

function Identity({ client }: { readonly client: Client }) {
  return (
    <div className={styles["row"]}>
      <Field htmlFor="name" label={ADMIN_TEXT.clientForm.name}>
        <input id="name" name="name" defaultValue={client.name} required />
      </Field>
      <Field htmlFor="city" label={ADMIN_TEXT.clientForm.city}>
        <input id="city" name="city" defaultValue={client.city} required />
      </Field>
    </div>
  );
}

function Publication({ client }: { readonly client: Client }) {
  return (
    <div className={styles["row"]}>
      <Field htmlFor="status" label={ADMIN_TEXT.clientForm.status}>
        <select id="status" name="status" defaultValue={client.status}>
          <option value="draft">{ADMIN_TEXT.status.draft}</option>
          <option value="published">{ADMIN_TEXT.status.published}</option>
        </select>
      </Field>
      <Field htmlFor="sortOrder" label={ADMIN_TEXT.clientForm.order}>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={client.sortOrder}
        />
      </Field>
    </div>
  );
}

export default async function ClientEditor({
  params,
  searchParams,
}: {
  readonly params: Params;
  readonly searchParams: Query;
}) {
  const { id } = await params;
  const query = await searchParams;
  const client = await loadClient(id);
  const save = saveClient.bind(null, client.id);
  const drop = removeClient.bind(null, client.id);
  const error = query["error"];

  return (
    <EditorShell title={ADMIN_TEXT.clientForm.title} error={error}>
      {/* Sin `encType`: cuando la acción es una función, React pone
          `multipart/form-data` por su cuenta y avisa por consola si además se
          declara a mano, porque el valor escrito se descarta. */}
      <form className={styles["form"]} action={save}>
        <Identity client={client} />
        <Field htmlFor="sector" label={ADMIN_TEXT.clientForm.sector}>
          <input id="sector" name="sector" defaultValue={client.sector} />
        </Field>
        <Logo client={client} />
        <Publication client={client} />
        <FormActions drop={drop} />
      </form>
    </EditorShell>
  );
}
