import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG, TEAMS } from "@/lib/config";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return TEAMS.map((t) => ({ slug: t.slug }));
}

function ClusterNav({ slug, teamName }: { slug: string; teamName: string }) {
  const links = [
    { href: `/times/${slug}`, label: teamName },
    { href: `/times/${slug}/jogo-hoje`, label: "Jogo de Hoje" },
    { href: `/times/${slug}/onde-assistir`, label: "Onde Assistir" },
    { href: `/times/${slug}/escalacao`, label: "Escalacao" },
    { href: `/times/${slug}/proximos-jogos`, label: "Proximos Jogos" },
    { href: `/times/${slug}/estatisticas`, label: "Estatisticas 2026" },
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
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  return (
    <div>
      {/* Team header */}
      <div className="bg-surface border-b border-border-custom">
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
