import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG } from "@/lib/config";
import { getTeam } from "@/lib/data/payload-teams";
import { teamRouteStaticParams } from "@/components/payload/team-cms-page";
import { notFound } from "next/navigation";
import { TeamBreadcrumb } from "@/components/seo/team-breadcrumb";
import { SportsTeamSchema } from "@/components/seo/sports-team-schema";

export async function generateStaticParams() {
  return teamRouteStaticParams();
}

function ClusterNav({ slug, teamName }: { slug: string; teamName: string }) {
  const links = [
    { href: `/futebol/times/${slug}`, label: teamName },
    { href: `/futebol/times/${slug}/jogo-hoje`, label: "Jogo de Hoje" },
    { href: `/futebol/times/${slug}/onde-assistir`, label: "Onde Assistir" },
    { href: `/futebol/times/${slug}/escalacao`, label: "Escalação" },
    { href: `/futebol/times/${slug}/proximos-jogos`, label: "Próximos Jogos" },
    { href: `/futebol/times/${slug}/estatisticas`, label: "Estatísticas 2026" },
  ];

  return (
    <nav className="bg-surface border-b border-border-custom overflow-x-auto scrollbar-hide">
      <div className="mx-auto max-w-[1240px] px-4 flex items-center gap-0">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2.5 text-xs font-semibold text-text-secondary hover:text-green whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-green"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Identidade do config (Série A/EU) OU do doc do Payload (Série B). 404 se nenhum.
  const cfg = TEAM_BY_SLUG[slug];
  let team: { name: string; id: number } | null = cfg ? { name: cfg.name, id: cfg.id } : null;
  if (!team) {
    const doc = await getTeam(slug);
    if (doc) team = { name: doc.name, id: doc.sofascoreId };
  }
  if (!team) notFound();

  return (
    <div>
      <SportsTeamSchema name={team.name} teamId={team.id} slug={slug} />
      {/* Team header with breadcrumb */}
      <div className="bg-surface border-b border-border-custom">
        <div className="mx-auto max-w-[1240px] px-4 pt-3">
          <TeamBreadcrumb teamSlug={slug} teamName={team.name} />
        </div>
        <div className="mx-auto max-w-[1240px] px-4 py-4 flex items-center gap-4">
          <Image
            src={`/img/team/${team.id}/image`}
            alt={team.name}
            width={48}
            height={48}
            className="rounded-full"
            unoptimized
          />
          <div>
            <h1 className="text-xl font-bold text-text-primary">{team.name}</h1>
            <p className="text-sm text-text-muted">Futebol</p>
          </div>
        </div>
      </div>

      {/* Cluster navigation */}
      <ClusterNav slug={slug} teamName={team.name} />

      {/* Page content */}
      {children}
    </div>
  );
}
