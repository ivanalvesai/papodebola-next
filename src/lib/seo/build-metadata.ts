import type { Metadata } from "next";
import { getPageTextsExact } from "@/lib/data/site-texts";
import { mergeMetadata } from "./merge-metadata";

export { mergeMetadata, matchRoute } from "./merge-metadata";

// Metadata da rota = defaults do código + SEO editado no /cms (doc pageTexts cuja
// `route` é exatamente a chave). Rotas dinâmicas passam o PADRÃO como chave
// ("/noticias/:categoria"). Busca só exata de propósito: com fallback por padrão,
// um doc "/futebol/:slug" (campeonatos) vazaria pra "/futebol/onde-assistir" e
// "/futebol/selecao-brasileira", que têm 2 segmentos também.
// Sem doc / erro → exatamente os defaults.
export async function buildMetadata(route: string, defaults: Metadata): Promise<Metadata> {
  try {
    return mergeMetadata(defaults, await getPageTextsExact(route));
  } catch {
    return defaults;
  }
}
