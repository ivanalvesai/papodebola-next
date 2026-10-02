/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPayload } from "payload";
import config from "@payload-config";
import { lexicalToHtml } from "@/lib/data/articles-payload";
import { ProseBody } from "@/components/article/prose-body";
import { ProseStyles } from "@/components/article/prose-styles";
import { dedicatedPageRoute } from "@/lib/dedicated-pages";
import { messageKey, type FormField } from "@/lib/forms";
import { FormRenderer, type FormRendererForm } from "@/components/forms/form-renderer";

// SERVER-ONLY. Bloco "Formulário" (plugin oficial @payloadcms/plugin-form-builder): carrega o
// form (a collection `forms` exige login pra ler via REST → Local API, que ignora o access),
// converte os textos ricos em HTML e entrega ao FormRenderer (cliente). As respostas vão pra
// `form-submissions` e ficam no /cms. Qualquer erro → null (a página segue no ar).

const toHtml = (rich: any): string => {
  try { return rich ? lexicalToHtml(rich) : ""; } catch { return ""; }
};

async function loadForm(ref: any): Promise<any | null> {
  if (ref && typeof ref === "object" && Array.isArray(ref.fields)) return ref;
  const id = ref && typeof ref === "object" ? ref.id : ref;
  if (id === undefined || id === null || id === "") return null;
  const payload = await getPayload({ config });
  return (await payload.findByID({ collection: "forms" as any, id, depth: 1 })) ?? null;
}

async function pageUrl(value: any): Promise<string | undefined> {
  let page = value && typeof value === "object" ? value : null;
  if (!page && value !== undefined && value !== null && value !== "") {
    const payload = await getPayload({ config });
    page = await payload.findByID({ collection: "pages" as any, id: value, depth: 0 }).catch(() => null);
  }
  if (!page) return undefined;
  if (page.path) return String(page.path);
  if (!page.slug) return undefined;
  return dedicatedPageRoute(page.slug) || `/paginas/${page.slug}`;
}

async function redirectUrl(form: any): Promise<string | undefined> {
  if (form.confirmationType !== "redirect") return undefined;
  const r = form.redirect || {};
  if (r.type === "reference") return pageUrl(r.reference?.value ?? r.reference);
  return r.url ? String(r.url) : undefined;
}

export async function FormBlockView({ block }: { block: any }) {
  let form: any;
  let props: FormRendererForm;
  try {
    form = await loadForm(block?.form);
    if (!form) return null;
    const fields: FormField[] = Array.isArray(form.fields) ? form.fields : [];
    const messagesHtml: Record<string, string> = {};
    fields.forEach((f: any, i) => {
      if (f?.blockType === "message") messagesHtml[messageKey(f, i)] = toHtml(f.message);
    });
    props = {
      id: form.id,
      title: form.title || undefined,
      fields,
      submitButtonLabel: form.submitButtonLabel || undefined,
      confirmationType: form.confirmationType === "redirect" ? "redirect" : "message",
      confirmationMessageHtml: toHtml(form.confirmationMessage) || undefined,
      redirectUrl: await redirectUrl(form),
      messagesHtml,
    };
  } catch {
    return null;
  }
  const intro = toHtml(block?.intro);
  return (
    <div className="my-6">
      <ProseStyles />
      {intro && <ProseBody html={intro} />}
      <FormRenderer form={props} compact={!!block?.compact} />
    </div>
  );
}
