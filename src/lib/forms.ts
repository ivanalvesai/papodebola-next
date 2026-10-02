// Helpers PUROS dos formulários (plugin oficial @payloadcms/plugin-form-builder).
// Sem React nem Payload: usados pelo FormRenderer (cliente) e testados com node:test.

export type FormFieldType = "text" | "textarea" | "select" | "radio" | "email" | "checkbox" | "number" | "message";

export interface FormField {
  blockType: FormFieldType | string;
  name?: string | null;
  label?: string | null;
  required?: boolean | null;
  width?: number | string | null;
  defaultValue?: unknown;
  placeholder?: string | null;
  options?: { label?: string | null; value?: string | null }[] | null;
  id?: string | null;
}

export type FormValues = Record<string, unknown>;

const isDataField = (f: FormField) => f.blockType !== "message" && !!f.name;

/** `[{ field, value }]` no formato que a collection `form-submissions` espera. */
export function toSubmissionData(fields: FormField[], values: FormValues): { field: string; value: string }[] {
  return fields.filter(isDataField).map((f) => {
    const v = values[f.name as string];
    if (f.blockType === "checkbox") return { field: f.name as string, value: v === true ? "true" : "false" };
    return { field: f.name as string, value: String(v ?? "") };
  });
}

/** Nomes dos campos obrigatórios não preenchidos (checkbox obrigatório = precisa estar marcado). */
export function validateRequired(fields: FormField[], values: FormValues): string[] {
  return fields
    .filter((f) => isDataField(f) && f.required)
    .filter((f) => {
      const v = values[f.name as string];
      if (f.blockType === "checkbox") return v !== true;
      return String(v ?? "").trim() === "";
    })
    .map((f) => f.name as string);
}

/** Largura (porcentagem do plugin) → classe Tailwind a partir de `sm`. */
export function fieldWidthClass(width: number | string | null | undefined): string {
  const n = Math.round(Number(width));
  switch (n) {
    case 50: return "sm:w-1/2";
    case 33: return "sm:w-1/3";
    case 25: return "sm:w-1/4";
    case 66:
    case 67: return "sm:w-2/3";
    case 75: return "sm:w-3/4";
    default: return "w-full";
  }
}

/** Chave do HTML pré-renderizado de um bloco "message" (id do bloco, senão o índice). */
export function messageKey(f: FormField, i: number): string {
  return f.id ? String(f.id) : String(i);
}
