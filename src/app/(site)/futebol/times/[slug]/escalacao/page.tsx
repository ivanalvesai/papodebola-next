import type { Metadata } from "next";
import { TEAM_BY_SLUG } from "@/lib/config";
import { getTeamPageData, getTeamLastLineup } from "@/lib/data/team";
import { getTeam } from "@/lib/data/payload-teams";
import { TeamCmsView, teamRouteStaticParams } from "@/components/payload/team-cms-page";
import { ClassicTeamEscalacao } from "@/components/team/classic/escalacao";
import { notFound } from "next/navigation";
import { teamSeo, TEAM_PAGE_PATH } from "@/lib/team-seo";

export const revalidate = 43200;

export async function generateStaticParams() {
  return teamRouteStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getTeam(slug);
  const name = doc?.name || TEAM_BY_SLUG[slug]?.name;
  if (!name) return {};
  const { title, description } = teamSeo(doc, "escalacao", name);
  return { title, description, alternates: { canonical: `/futebol/times/${slug}${TEAM_PAGE_PATH.escalacao}` } };
}

export default async function EscalacaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getTeam(slug);
  if (doc) return <TeamCmsView doc={doc} page="escalacao" />;
  const data = await getTeamPageData(slug);
  if (!data) notFound();
  // XI do último jogo (base da provável). Poucas tentativas pra não pendurar o render.
  const lineup = await getTeamLastLineup(data.id, 3).catch(() => null);
  return <ClassicTeamEscalacao data={data} lineup={lineup} />;
}
