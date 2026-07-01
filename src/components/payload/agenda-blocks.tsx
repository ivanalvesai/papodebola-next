import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { MatchCarousel } from "@/components/match-bar/match-carousel";
import { PageBlock } from "./page-blocks";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import type { AgendaLeagueGroup, AgendaEvent } from "@/lib/data/agenda";
import type { MatchBarCardProps } from "@/components/match-bar/match-bar-card";

// Renderer dos blocos da página "Jogos de hoje / Futebol" (collection `pages`). O bloco
// DINÂMICO `todayGames` lê os jogos do dia (do store — nunca bate na API) e pode ser
// filtrado por liga (o editor põe um bloco por campeonato, na ordem que quiser). Blocos
// estáticos (título/texto/lista/FAQ) reusam o `PageBlock` do page-blocks.
/* eslint-disable @typescript-eslint/no-explicit-any */

function toCard(e: AgendaEvent): MatchBarCardProps {
  const status =
    e.statusType === "inprogress" ? "live" : e.statusType === "finished" ? "finished" : "scheduled";
  return {
    id: `api_${e.id}`,
    homeTeam: e.home,
    awayTeam: e.away,
    homeLogo: e.homeId ? `/api/team-img/${e.homeId}` : null,
    awayLogo: e.awayId ? `/api/team-img/${e.awayId}` : null,
    homeScore: e.homeScore,
    awayScore: e.awayScore,
    time: e.time,
    timestamp: e.timestamp,
    status,
    statusText: e.status || (status === "live" ? "Ao Vivo" : ""),
    league: e.league,
    href: e.href,
  };
}

// slug da liga (campo do bloco) -> nome como vem no store (league). "copa-do-mundo" é
// especial (o store usa "Copa do Mundo"); o resto vem do TOURNAMENT_BY_SLUG.
function leagueNameForSlug(slug: string): string | null {
  if (slug === "copa-do-mundo") return "Copa do Mundo";
  return TOURNAMENT_BY_SLUG[slug]?.name || null;
}

function EmptyState({ block }: { block: any }) {
  const ctas = [
    block.primaryCtaLabel && { label: block.primaryCtaLabel, href: block.primaryCtaHref || "/jogos-de-hoje", primary: true },
    block.secondaryCtaLabel && { label: block.secondaryCtaLabel, href: block.secondaryCtaHref || "/jogos-de-hoje?d=amanha", primary: false },
  ].filter(Boolean) as { label: string; href: string; primary: boolean }[];
  return (
    <div className="rounded-lg border border-border-custom bg-card-bg px-4 py-10 text-center">
      <CalendarDays className="mx-auto mb-3 h-9 w-9 text-text-muted" />
      {block.emptyTitle && (
        <p className="text-base font-bold text-text-primary">{block.emptyTitle}</p>
      )}
      {block.emptyText && <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">{block.emptyText}</p>}
      {ctas.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {ctas.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                c.primary
                  ? "bg-green text-white hover:opacity-90"
                  : "border border-border-custom text-text-secondary hover:border-green hover:text-green"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TodayGamesBlock({ block, leagues }: { block: any; leagues: AgendaLeagueGroup[] }) {
  const slug = String(block.league || "all").trim();
  const isAll = slug === "" || slug === "all";
  const filtered = isAll
    ? leagues
    : leagues.filter((l) => l.league === leagueNameForSlug(slug));

  if (filtered.length === 0) {
    // empty-state só no bloco "todos" (com campos preenchidos); bloco de 1 liga sem jogo some.
    return isAll && (block.emptyTitle || block.emptyText) ? <EmptyState block={block} /> : null;
  }
  return (
    <div className="space-y-4">
      {block.title && <h2 className="text-base font-bold uppercase text-text-primary">{block.title}</h2>}
      {filtered.map((lg) => (
        <MatchCarousel
          key={lg.league}
          title={lg.league}
          count={lg.events.length}
          matches={lg.events.map(toCard)}
        />
      ))}
    </div>
  );
}

export function AgendaBlockRenderer({
  leagues,
  blocks,
}: {
  leagues: AgendaLeagueGroup[];
  blocks: any[];
}) {
  return (
    <div className="space-y-6">
      {(blocks || []).map((b, i) =>
        b.blockType === "todayGames" ? (
          <TodayGamesBlock key={i} block={b} leagues={leagues} />
        ) : (
          <PageBlock key={i} block={b} />
        )
      )}
    </div>
  );
}

// Layout PADRÃO (fallback quando a Página do CMS não existe) — o seed cria a Página com
// esse mesmo conteúdo (textos ricos). Aqui fica o mínimo pra renderizar completo.
export const DEFAULT_AGENDA_LAYOUT: any[] = [
  {
    blockType: "todayGames",
    league: "all",
    emptyTitle: "Nenhum jogo de futebol programado para hoje.",
    emptyText: "Confira os jogos de outras modalidades ou veja a agenda dos próximos dias.",
    primaryCtaLabel: "Ver jogos de hoje (Geral)",
    primaryCtaHref: "/jogos-de-hoje",
    secondaryCtaLabel: "Ver próximos jogos",
    secondaryCtaHref: "/jogos-de-hoje?d=amanha",
  },
];
