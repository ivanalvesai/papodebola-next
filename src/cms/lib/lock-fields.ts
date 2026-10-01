// Papel `seo`: pode atualizar o documento (posts/pages/teams), mas só os campos de SEO.
// lockFieldsExceptSeo percorre a árvore de campos e põe `access.update = fieldEditorOrAdmin`
// em todo campo nomeado fora da allowlist. Grupos da allowlist (seo, seoJogoHoje…) ficam
// livres por inteiro; row/collapsible/abas sem nome são só layout → desce neles.
// Blocos/arrays/grupos fora da allowlist são travados inteiros (seo não mexe no layout).
// Não muta a entrada. Sem React: importado pela config do Payload e pelos testes.
import type { Field, Tab } from "payload";
import { fieldEditorOrAdmin } from "./access.ts";

export const SEO_FIELD_ALLOWLIST: readonly string[] = [
  "seo", "seoJogoHoje", "seoOndeAssistir", "seoEscalacao", "seoProximos", "seoEstatisticas",
  "metaTitle", "metaDescription", "noindex",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function lock<T>(f: T): T {
  const a = (f as any).access || {};
  return { ...f, access: { ...a, update: fieldEditorOrAdmin } };
}

function lockTab(tab: Tab): Tab {
  const name = (tab as any).name as string | undefined;
  if (name) return SEO_FIELD_ALLOWLIST.includes(name) ? tab : lock(tab);
  return { ...tab, fields: lockFieldsExceptSeo(tab.fields) };
}

export function lockFieldsExceptSeo(fields: Field[]): Field[] {
  return fields.map((field): Field => {
    const f = field as any;
    if (f.type === "ui") return field; // sem dado, sem access
    if (f.type === "tabs") return { ...f, tabs: (f.tabs as Tab[]).map(lockTab) };
    if (typeof f.name === "string" && f.name) {
      return SEO_FIELD_ALLOWLIST.includes(f.name) ? field : lock(field);
    }
    // row / collapsible (sem nome): só layout, desce.
    if (Array.isArray(f.fields)) return { ...f, fields: lockFieldsExceptSeo(f.fields) };
    return field;
  });
}
