import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, MapPin, ChevronRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { TeamLogo } from "@/components/ui/team-logo";
import { getStandings } from "@/lib/data/standings";
import { TOURNAMENTS } from "@/lib/config";

export const revalidate = 21600; // 6h

export const metadata: Metadata = {
  title: "Futebol de São Paulo: Paulistão, Jogos e Times",
  description:
    "Futebol do estado de São Paulo: classificação do Campeonato Paulista, times paulistas, jogos e notícias no Papo de Bola.",
  alternates: { canonical: "/sp" },
};

const PAULISTA = TOURNAMENTS.PAULISTA;

export default async function SaoPauloPage() {
  const groups = PAULISTA.seasonId
    ? await getStandings(PAULISTA.id, PAULISTA.seasonId, 21600).catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[{ label: "Início", href: "/" }, { label: "São Paulo" }]}
      />

      <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-text-primary">
        <MapPin className="h-6 w-6 text-green" />
        Futebol de São Paulo
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        Campeonato Paulista, times do estado e o esporte das cidades paulistas.
      </p>

      {/* Cidades */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase text-text-secondary">Cidades</h2>
        <Link
          href="/sp/santana-de-parnaiba"
          className="group flex items-center gap-4 rounded-lg border border-border-custom bg-card-bg p-5 transition-colors hover:border-green"
        >
          <MapPin className="h-8 w-8 shrink-0 text-green" />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-text-primary group-hover:text-green">Santana de Parnaíba</h3>
            <p className="text-sm text-text-muted">
              Esportes da cidade e os campeonatos municipais (1ª, 2ª, 3ª divisões e veteranos).
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-text-muted group-hover:text-green" />
        </Link>
      </div>

      {/* Campeonato Paulista */}
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-text-secondary">
        <Trophy className="h-4 w-4 text-green" />
        Campeonato Paulista
      </h2>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-border-custom bg-card-bg p-8 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm text-text-muted">
            Classificação do Paulistão em breve — a competição começa no início do ano.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.name} className="rounded-lg border border-border-custom bg-card-bg">
              <h3 className="border-b border-border-custom px-4 py-3 text-sm font-bold uppercase text-green">
                {group.name}
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-light text-text-muted">
                    <th className="px-3 py-2 text-left font-semibold">#</th>
                    <th className="px-2 py-2 text-left font-semibold">Time</th>
                    <th className="px-1 py-2 text-center font-semibold">P</th>
                    <th className="px-1 py-2 text-center font-semibold">J</th>
                    <th className="px-1 py-2 text-center font-semibold">SG</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((r) => (
                    <tr
                      key={r.teamId || `${r.pos}-${r.team}`}
                      className="border-b border-border-light last:border-0 hover:bg-card-hover"
                    >
                      <td className="px-3 py-2 font-semibold text-text-muted">{r.pos}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamId={r.teamId || undefined} size={18} />
                          <span className="truncate font-semibold text-text-primary">{r.team}</span>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center font-bold">{r.pts}</td>
                      <td className="px-1 py-2 text-center text-text-muted">{r.matches}</td>
                      <td className="px-1 py-2 text-center text-text-muted">
                        {r.gd > 0 ? `+${r.gd}` : r.gd}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
