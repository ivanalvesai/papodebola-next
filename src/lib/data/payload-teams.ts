import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { TeamInfo } from "@/lib/config";
import type { TeamSeoDoc } from "@/lib/team-seo";

// Doc da collection `teams` (Série B no piloto). Identidade + SEO + 6 layouts (blocos).
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PayloadTeam extends TeamSeoDoc {
  name: string;
  slug: string;
  sofascoreId: number;
  tournament: "serie-a" | "serie-b" | "europa";
  layoutHub?: any[];
  layoutJogoHoje?: any[];
  layoutOndeAssistir?: any[];
  layoutEscalacao?: any[];
  layoutProximos?: any[];
  layoutEstatisticas?: any[];
}

// TEAMS_CMS_DRAFTS=1 (só no dev): getTeam e getPayloadTeamSlugs enxergam também os
// rascunhos, pra conferir a migração dos times no dev antes de publicar. Prod não seta.
const DRAFTS = process.env.TEAMS_CMS_DRAFTS === "1";

// Busca um time publicado por slug (no dev com TEAMS_CMS_DRAFTS=1, também rascunho).
// null em QUALQUER erro/ausência (banco fora, sem doc)
// → a rota faz fallback pro time do config (Série A/EU) ou 404. cache() dedup por request.
export const getTeam = cache(async (slug: string): Promise<PayloadTeam | null> => {
  try {
    const payload = await getPayload({ config });
    const res = DRAFTS
      ? await payload.find({
          collection: "teams",
          draft: true,
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
        })
      : await payload.find({
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

// Versão rascunho (sempre draft:true, sem filtro de status) — só pro preview privado do /cms.
export const getTeamDraft = cache(async (slug: string): Promise<PayloadTeam | null> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "teams",
      draft: true,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return (res.docs[0] as unknown as PayloadTeam) || null;
  } catch {
    return null;
  }
});

// Slugs de todos os times publicados (pra generateStaticParams das rotas de time).
// No dev com TEAMS_CMS_DRAFTS=1, inclui os rascunhos.
export const getPayloadTeamSlugs = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayload({ config });
    const res = DRAFTS
      ? await payload.find({
          collection: "teams",
          draft: true,
          limit: 500,
          depth: 0,
          pagination: false,
        })
      : await payload.find({
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
