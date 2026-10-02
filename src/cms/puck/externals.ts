// Campos "external" do Puck (escolha de documentos das collections do /cms). Só o fetchList
// roda — no navegador, dentro do /cms (cookie de sessão). Compartilhado por fields.ts e
// fields-rich.ts (arquivo próprio pra não criar import circular entre os dois).
import { createElement } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

const getJson = (url: string) => fetch(url, { credentials: "include" }).then((x) => x.json());
const like = (field: string, query: string) => (query ? `&where[${field}][like]=${encodeURIComponent(query)}` : "");

export const teamExternal = {
  type: "external",
  label: "Time",
  placeholder: "Escolher time",
  fetchList: async ({ query }: { query: string }) => {
    const r = await getJson(`/cms-api/teams?limit=60&depth=0&sort=name${like("name", query)}`);
    return (r.docs || []).map((d: any) => ({ id: d.id, name: d.name, slug: d.slug }));
  },
  getItemSummary: (item: any) => item?.name || "",
  showSearch: true,
} as const;

// Imagem da biblioteca de Mídia. Guarda só { id, url, alt, filename } no puckData.
export const mediaExternal = (label = "Imagem") =>
  ({
    type: "external",
    label,
    placeholder: "Escolher da Mídia",
    fetchList: async ({ query }: { query: string }) => {
      const r = await getJson(`/cms-api/media?limit=40&depth=0&sort=-createdAt&where[mimeType][like]=image${like("filename", query)}`);
      return (r.docs || []).map((d: any) => ({ id: d.id, url: d.url, alt: d.alt || "", filename: d.filename || "" }));
    },
    mapRow: (i: any) => ({
      Imagem: createElement("img", { src: i.url, alt: "", width: 48, height: 48, style: { objectFit: "cover", borderRadius: 4 } }),
      Arquivo: i.filename || "",
    }),
    getItemSummary: (i: any) => i?.filename || i?.url || "",
    showSearch: true,
  }) as any;

export const formExternal = {
  type: "external",
  label: "Formulário",
  placeholder: "Escolher formulário",
  fetchList: async ({ query }: { query: string }) => {
    const r = await getJson(`/cms-api/forms?limit=50&depth=0${like("title", query)}`);
    return (r.docs || []).map((d: any) => ({ id: d.id, title: d.title || `Formulário ${d.id}` }));
  },
  getItemSummary: (i: any) => i?.title || "",
  showSearch: true,
} as any;

export const snippetExternal = {
  type: "external",
  label: "Trecho",
  placeholder: "Escolher trecho",
  fetchList: async ({ query }: { query: string }) => {
    const r = await getJson(`/cms-api/snippets?limit=100&depth=0${like("title", query)}`);
    return (r.docs || []).map((d: any) => ({ id: d.id, title: d.title || d.name || `Trecho ${d.id}` }));
  },
  getItemSummary: (i: any) => i?.title || "",
  showSearch: true,
} as any;
