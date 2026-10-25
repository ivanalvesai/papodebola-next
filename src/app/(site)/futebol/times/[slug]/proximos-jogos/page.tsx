import type { Metadata } from "next";
import { TEAM_BY_SLUG } from "@/lib/config";
import { getTeamPageData, getTeamNextForSeo } from "@/lib/data/team";
import { getTeam } from "@/lib/data/payload-teams";
import { TeamCmsView, TeamTabFooter, teamRouteStaticParams } from "@/components/payload/team-cms-page";
import { ClassicTeamProximos } from "@/components/team/classic/proximos";
import { notFound } from "next/navigation";
import { teamSeo, TEAM_PAGE_PATH } from "@/lib/team-seo";

// 1h: o título traz o próximo adversário (a chamada à API segue em cache de 12h).
export const revalidate = 3600;

export async function generateStaticParams() {
  return teamRouteStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getTeam(slug);
  const name = doc?.name || TEAM_BY_SLUG[slug]?.name;
  if (!name) return {};
  const teamId = doc?.sofascoreId || TEAM_BY_SLUG[slug]?.id;
  const next = teamId ? await getTeamNextForSeo(teamId) : null;
  const { title, description } = teamSeo(doc, "proximos", name, next);
  return { title, description, alternates: { canonical: `/futebol/times/${slug}${TEAM_PAGE_PATH.proximos}` } };
}

export default async function ProximosJogosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getTeam(slug);
  if (doc) return <TeamCmsView doc={doc} page="proximos" />;
  const data = await getTeamPageData(slug);
  if (!data) notFound();
  return (
    <>
      <ClassicTeamProximos data={data} />
      <TeamTabFooter data={data} page="proximos" />
    </>
  );
}
