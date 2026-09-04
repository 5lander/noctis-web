import { Field } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/content/admin";
import type { Work } from "@/modules/portfolio/domain/portfolio";

import styles from "../../admin.module.css";
import { removeWork, saveWork } from "../../actions";
import { EditorShell, FormActions } from "../../panel-parts";
import { loadWork } from "../../queries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

type Params = Promise<{ id: string }>;

type Query = Promise<Record<string, string | string[] | undefined>>;

function Hint({ children }: { readonly children: string }) {
  return <small className={styles["hint"]}>{children}</small>;
}

function Identity({ work }: { readonly work: Work }) {
  return (
    <div className={styles["row"]}>
      <Field htmlFor="clientName" label={ADMIN_TEXT.workForm.client}>
        <input
          id="clientName"
          name="clientName"
          defaultValue={work.clientName}
          required
        />
        <Hint>{ADMIN_TEXT.workForm.clientHint}</Hint>
      </Field>
      <Field htmlFor="kind" label={ADMIN_TEXT.workForm.kind}>
        <input id="kind" name="kind" defaultValue={work.kind} required />
        <Hint>{ADMIN_TEXT.workForm.kindHint}</Hint>
      </Field>
    </div>
  );
}

function Details({ work }: { readonly work: Work }) {
  return (
    <div className={styles["row"]}>
      <Field htmlFor="year" label={ADMIN_TEXT.workForm.year}>
        <input
          id="year"
          name="year"
          inputMode="numeric"
          defaultValue={work.year}
          required
        />
      </Field>
      <Field htmlFor="href" label={ADMIN_TEXT.workForm.href}>
        <input
          id="href"
          name="href"
          type="url"
          defaultValue={work.href ?? ""}
        />
        <Hint>{ADMIN_TEXT.workForm.hrefHint}</Hint>
      </Field>
    </div>
  );
}

function Cover({ work }: { readonly work: Work }) {
  return (
    <>
      <Field htmlFor="cover" label={ADMIN_TEXT.workForm.cover}>
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
        />
        <Hint>{ADMIN_TEXT.workForm.coverHint}</Hint>
      </Field>
      <input type="hidden" name="coverUrl" value={work.coverUrl ?? ""} />
      <Field htmlFor="coverAlt" label={ADMIN_TEXT.workForm.coverAlt}>
        <input id="coverAlt" name="coverAlt" defaultValue={work.coverAlt} />
        <Hint>{ADMIN_TEXT.workForm.coverAltHint}</Hint>
      </Field>
      <Field htmlFor="tour" label={ADMIN_TEXT.workForm.tour}>
        <input id="tour" name="tour" type="file" accept="video/mp4" />
        <Hint>{ADMIN_TEXT.workForm.tourHint}</Hint>
      </Field>
      <input type="hidden" name="tourUrl" value={work.tourUrl ?? ""} />
    </>
  );
}

function Publication({ work }: { readonly work: Work }) {
  return (
    <div className={styles["row"]}>
      <Field htmlFor="status" label={ADMIN_TEXT.workForm.status}>
        <select id="status" name="status" defaultValue={work.status}>
          <option value="draft">{ADMIN_TEXT.status.draft}</option>
          <option value="published">{ADMIN_TEXT.status.published}</option>
        </select>
      </Field>
      <Field htmlFor="sortOrder" label={ADMIN_TEXT.workForm.order}>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={work.sortOrder}
        />
        <Hint>{ADMIN_TEXT.workForm.orderHint}</Hint>
      </Field>
    </div>
  );
}

export default async function WorkEditor({
  params,
  searchParams,
}: {
  readonly params: Params;
  readonly searchParams: Query;
}) {
  const { id } = await params;
  const query = await searchParams;
  const work = await loadWork(id);
  const save = saveWork.bind(null, work.id);
  const drop = removeWork.bind(null, work.id);
  const error = query["error"];

  return (
    <EditorShell title={ADMIN_TEXT.workForm.title} error={error}>
      {/* Sin `encType`: cuando la acción es una función, React pone
          `multipart/form-data` por su cuenta y avisa por consola si además se
          declara a mano, porque el valor escrito se descarta. */}
      <form className={styles["form"]} action={save}>
        <Identity work={work} />
        <Details work={work} />
        <Field htmlFor="summary" label={ADMIN_TEXT.workForm.summary}>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            defaultValue={work.summary}
          />
          <Hint>{ADMIN_TEXT.workForm.summaryHint}</Hint>
        </Field>
        <Cover work={work} />
        <Publication work={work} />
        <FormActions drop={drop} />
      </form>
    </EditorShell>
  );
}
