import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { TeamInfo } from "@/lib/config";

// Doc da collection `teams` (Série B no piloto). Identidade + SEO + 6 layouts (blocos).
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PayloadTeam {
  name: string;
  slug: string;
  sofascoreId: number;
  tournament: "serie-a" | "serie-b";
  layoutHub?: any[];
  layoutJogoHoje?: any[];
  layoutOndeAssistir?: any[];
  layoutEscalacao?: any[];
  layoutProximos?: any[];
  layoutEstatisticas?: any[];
  seo?: { metaTitle?: string; metaDescription?: string };
}

// Busca um time publicado por slug. null em QUALQUER erro/ausência (banco fora, sem doc)
// → a rota faz fallback pro time do config (Série A/EU) ou 404. cache() dedup por request.
export const getTeam = cache(async (slug: string): Promise<PayloadTeam | null> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "teams",
      where: { slug: { equals: slug }, _status: { equals: "published" } },
      limit: 1,
      depth: 1,
    });
    return (res.docs[0] as unknown as PayloadTeam) || null;
  } catch {
    return null;
  }
});

// Slugs de todos os times publicados (pra generateStaticParams das rotas de time).
export const getPayloadTeamSlugs = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "teams",
      where: { _status: { equals: "published" } },
      limit: 500,
      depth: 0,
      pagination: false,
    });
    return res.docs.map((d: any) => d.slug).filter(Boolean);
  } catch {
    return [];
  }
});

// Mapa sofascoreId → slug dos times publicados (Série B). Usado pra linkar os times
// na tabela de classificação (que só conhece o teamId), já que eles não estão no config.
export const getPayloadTeamSlugMap = cache(async (): Promise<Record<number, string>> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "teams",
      where: { _status: { equals: "published" } },
      limit: 500,
      depth: 0,
      pagination: false,
    });
    const map: Record<number, string> = {};
    for (const d of res.docs as unknown as PayloadTeam[]) {
      if (d.sofascoreId && d.slug) map[d.sofascoreId] = d.slug;
    }
    return map;
  } catch {
    return {};
  }
});

// Lista {id, name} de todos os times publicados (Série B). Usada pelo dropdown do bloco
// "Escalação no campo" no editor (junto com os times do config = Série A/EU).
export const getPayloadTeamsList = cache(async (): Promise<{ id: number; name: string }[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "teams",
      where: { _status: { equals: "published" } },
      limit: 500,
      depth: 0,
      pagination: false,
    });
    return (res.docs as unknown as PayloadTeam[])
      .filter((d) => d.sofascoreId && d.name)
      .map((d) => ({ id: d.sofascoreId, name: d.name }));
  } catch {
    return [];
  }
});

// Identidade usada pela camada de dados (getTeamPageDataFor) a partir do doc do CMS.
export function teamInfoFromDoc(doc: PayloadTeam): TeamInfo {
  return { id: doc.sofascoreId, name: doc.name, slug: doc.slug, tournament: doc.tournament };
}
