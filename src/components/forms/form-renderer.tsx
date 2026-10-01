"use client";

import { useState, type FormEvent } from "react";
import { toSubmissionData, validateRequired, fieldWidthClass, messageKey, type FormField, type FormValues } from "@/lib/forms";

// Renderiza um formulário do plugin oficial (@payloadcms/plugin-form-builder) e envia a
// resposta pra collection `form-submissions` (POST público em /cms-api). Os textos ricos
// (confirmação, blocos "message") chegam já convertidos em HTML pelo servidor.

export interface FormRendererForm {
  id: number | string;
  title?: string;
  fields: FormField[];
  submitButtonLabel?: string;
  confirmationType?: "message" | "redirect";
  confirmationMessageHtml?: string;
  redirectUrl?: string;
  /** HTML dos blocos "message", indexado pelo id do bloco (ou índice) — pré-renderizado no servidor. */
  messagesHtml?: Record<string, string>;
}

const INPUT = "w-full rounded-lg border border-border-custom bg-card-bg px-3 py-2 text-sm text-text-primary";
const LABEL = "text-sm font-semibold";

function initialValues(fields: FormField[]): FormValues {
  const v: FormValues = {};
  for (const f of fields) {
    if (!f.name || f.blockType === "message") continue;
    if (f.blockType === "checkbox") v[f.name] = f.defaultValue === true;
    else if (f.defaultValue !== undefined && f.defaultValue !== null) v[f.name] = String(f.defaultValue);
  }
  return v;
}

export function FormRenderer({ form, compact }: { form: FormRendererForm; compact?: boolean }) {
  const [values, setValues] = useState<FormValues>(() => initialValues(form.fields));
  const [honeypot, setHoneypot] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");

  const set = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  const succeed = () => {
    if (form.confirmationType === "redirect" && form.redirectUrl) {
      window.location.assign(form.redirectUrl);
      return;
    }
    setStatus("done");
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    // Robô preencheu o campo escondido: finge sucesso sem gravar nada.
    if (honeypot.trim()) { succeed(); return; }
    const miss = validateRequired(form.fields, values);
    setMissing(miss);
    if (miss.length) return;
    setStatus("sending");
    try {
      const res = await fetch("/cms-api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: form.id, submissionData: toSubmissionData(form.fields, values) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      succeed();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return form.confirmationMessageHtml ? (
      <div className="prose-article rounded-lg border border-border-custom bg-card-bg p-4" dangerouslySetInnerHTML={{ __html: form.confirmationMessageHtml }} />
    ) : (
      <p className="rounded-lg border border-border-custom bg-card-bg p-4 text-sm font-semibold text-green">Enviado. Obrigado!</p>
    );
  }

  const gap = compact ? "mb-3" : "mb-4";
  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      {!compact && form.title && <h3 className="mb-3 text-lg font-bold text-text-primary">{form.title}</h3>}
      <div className="-mx-2 flex flex-wrap">
        {form.fields.map((f, i) => {
          const wrap = `w-full px-2 ${gap} ${fieldWidthClass(f.width)}`;
          if (f.blockType === "message") {
            const html = form.messagesHtml?.[messageKey(f, i)];
            return html ? <div key={i} className={`${wrap} prose-article text-sm`} dangerouslySetInnerHTML={{ __html: html }} /> : null;
          }
          if (!f.name) return null;
          const name = f.name;
          const id = `pdbf-${form.id}-${name}`;
          const isMissing = missing.includes(name);
          const label = (
            <>
              {f.label || name}
              {f.required && <span className="text-red"> *</span>}
            </>
          );
          const err = isMissing ? <p className="mt-1 text-sm text-red">Campo obrigatório.</p> : null;
          const value = String(values[name] ?? "");

          if (f.blockType === "checkbox") {
            return (
              <div key={i} className={wrap}>
                <label htmlFor={id} className="flex items-start gap-2 text-sm text-text-primary">
                  <input id={id} type="checkbox" checked={values[name] === true} onChange={(e) => set(name, e.target.checked)} className="mt-0.5 h-4 w-4 accent-green" />
                  <span>{label}</span>
                </label>
                {err}
              </div>
            );
          }
          if (f.blockType === "radio") {
            return (
              <fieldset key={i} className={wrap}>
                <legend className={`${LABEL} mb-1`}>{label}</legend>
                <div className="flex flex-col gap-1">
                  {(f.options || []).map((o, j) => (
                    <label key={j} className="flex items-center gap-2 text-sm text-text-primary">
                      <input type="radio" name={id} value={o.value ?? ""} checked={value === (o.value ?? "")} onChange={() => set(name, o.value ?? "")} className="accent-green" />
                      {o.label || o.value}
                    </label>
                  ))}
                </div>
                {err}
              </fieldset>
            );
          }
          let control;
          if (f.blockType === "textarea") {
            control = <textarea id={id} rows={compact ? 3 : 5} value={value} placeholder={f.placeholder ?? undefined} onChange={(e) => set(name, e.target.value)} className={INPUT} />;
          } else if (f.blockType === "select") {
            control = (
              <select id={id} value={value} onChange={(e) => set(name, e.target.value)} className={INPUT}>
                <option value="">Selecione…</option>
                {(f.options || []).map((o, j) => <option key={j} value={o.value ?? ""}>{o.label || o.value}</option>)}
              </select>
            );
          } else {
            const type = f.blockType === "email" ? "email" : f.blockType === "number" ? "number" : "text";
            control = <input id={id} type={type} value={value} placeholder={f.placeholder ?? undefined} onChange={(e) => set(name, e.target.value)} className={INPUT} />;
          }
          return (
            <div key={i} className={wrap}>
              <label htmlFor={id} className={`${LABEL} mb-1 block`}>{label}</label>
              {control}
              {err}
            </div>
          );
        })}
      </div>
      {/* Honeypot: escondido de gente, robôs preenchem. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" />
      {status === "error" && <p className="mb-3 text-sm text-red">Não foi possível enviar. Tente de novo.</p>}
      <button type="submit" disabled={status === "sending"} className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {status === "sending" ? "Enviando…" : form.submitButtonLabel || "Enviar"}
      </button>
    </form>
  );
}
