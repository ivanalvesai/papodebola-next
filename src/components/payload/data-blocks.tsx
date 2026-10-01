import { getPayload } from "payload";
import config from "@payload-config";
import { getTeamPageDataFor } from "@/lib/data/team";
import { teamInfoFromDoc, type PayloadTeam } from "@/lib/data/payload-teams";
import { getStandings, getWorldCupStandings } from "@/lib/data/standings";
import { getScorersFor, getWorldCupScorers } from "@/lib/data/scorers";
import { getArticles } from "@/lib/data/articles";
import { getMatchDetail, type MatchDetail } from "@/lib/data/match-detail";
import { getStoredFootballAgenda } from "@/lib/data/agenda";
import { TeamBlock } from "./team-blocks";
import { StandingsWidget } from "@/components/sidebar/standings-widget";
import { ScorersWidget } from "@/components/sidebar/scorers-widget";
import { StandingsTableBlock } from "./standings-table-block";
import { FeedItem } from "@/components/news/news-feed";
import { FeaturedCard } from "@/components/home/news-section";
import { LiveMatch } from "@/components/world-cup/live-match";
import { TodayGamesBlock } from "./agenda-blocks";
import { widgetToBlockType, resolveTournament } from "@/lib/cms-render";
import { tournamentLabel } from "@/cms/blocks/summary";

/* eslint-disable @typescript-eslint/no-explicit-any */
const card = "rounded-lg border border-border-custom bg-card-bg";

export async function resolveTeam(team: any): Promise<PayloadTeam | null> {
  if (team && typeof team === "object" && team.sofascoreId) return team as PayloadTeam;
  const id = typeof team === "number" ? team : Number(team?.id);
  if (!id) return null;
  try {
    const payload = await getPayload({ config });
    return (await payload.findByID({ collection: "teams", id, depth: 0 })) as unknown as PayloadTeam;
  } catch { return null; }
}

export async function TeamWidgetBlock({ block }: { block: any }) {
  const doc = await resolveTeam(block.team);
  const blockType = widgetToBlockType(block.widget);
  if (!doc || !blockType) return null;
  try {
    const data = await getTeamPageDataFor(teamInfoFromDoc(doc));
    return <TeamBlock block={{ blockType, title: block.title, limit: block.limit }} data={data} page="hub" lineup={null} />;
  } catch { return null; }
}

export async function StandingsBlock({ block }: { block: any }) {
  const r = resolveTournament(block.tournament);
  if (!r) return null;
  try {
    const groups = r.kind === "worldcup" ? await getWorldCupStandings() : (r.t.seasonId ? await getStandings(r.t.id, r.t.seasonId) : []);
    const title = block.title || `Classificação · ${tournamentLabel(block.tournament)}`;
    const href = r.kind === "worldcup" ? "/futebol/copa-do-mundo" : `/futebol/${r.t.slug}`;
    if (block.compact) return <StandingsWidget standings={groups} />;
    return <StandingsTableBlock groups={groups} title={title} href={href} rows={block.rows || 20} />;
  } catch { return null; }
}

export async function ScorersBlock({ block }: { block: any }) {
  const r = resolveTournament(block.tournament);
  if (!r) return null;
  try {
    // Orçamento de 4s: a página não pendura esperando a API; o próximo render ISR pega o cache quente.
    const fetchScorers = () => (r.kind === "worldcup" ? getWorldCupScorers() : getScorersFor(r.t));
    const scorers = await Promise.race([fetchScorers(), new Promise<null>((res) => setTimeout(() => res(null), 4000))]);
    if (!scorers) return null;
    return (
      <div className="space-y-2">
        {block.title && <h2 className="text-base font-bold text-text-primary">{block.title}</h2>}
        <ScorersWidget scorers={scorers.slice(0, block.limit || 10)} />
      </div>
    );
  } catch { return null; }
}

export async function NewsFeedBlock({ block }: { block: any }) {
  let opts: { category?: string; tag?: string } = {};
  if (block.source === "category" && block.value) opts = { category: block.value };
  else if (block.source === "tag" && block.value) opts = { tag: block.value };
  else if (block.source === "team") { const t = await resolveTeam(block.team); if (!t) return null; opts = { tag: t.name }; }
  const limit = block.limit || 6;
  let articles: any[] = [];
  try { articles = (await getArticles({ ...opts, perPage: limit })).articles.slice(0, limit); } catch { return null; }
  if (!articles.length) return null;
  const header = (block.title || block.seeAllHref) && (
    <div className="mb-3 flex items-center justify-between">
      {block.title && <h2 className="text-base font-bold text-text-primary">{block.title}</h2>}
      {block.seeAllHref && <a href={block.seeAllHref} className="text-sm font-semibold text-green hover:underline">Ver todas</a>}
    </div>
  );
  if (block.layout === "list") return <div className={`${card} p-5`}>{header}<div>{articles.map((a) => <FeedItem key={a.slug} article={a} />)}</div></div>;
  if (block.layout === "featured") {
    const [first, ...rest] = articles;
    return <div>{header}<div className="grid gap-3 lg:grid-cols-[2fr_1fr]"><FeaturedCard article={first} big /><div className="grid gap-3">{rest.slice(0, 2).map((a) => <FeaturedCard key={a.slug} article={a} />)}</div></div></div>;
  }
  return <div>{header}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{articles.map((a) => <FeaturedCard key={a.slug} article={a} />)}</div></div>;
}

export async function LiveMatchBlock({ block }: { block: any }) {
  const id = Number(block.matchId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const detail = await getMatchDetail(id).catch(() => null);
  if (!detail) return null;
  return (
    <div className="space-y-2">
      {block.title && <h2 className="text-base font-bold text-text-primary">{block.title}</h2>}
      <LiveMatch matchId={id} initial={detail as MatchDetail} group={null} competition={block.competition || ""} />
    </div>
  );
}

export async function TodayGamesDataBlock({ block }: { block: any }) {
  const leagues = await getStoredFootballAgenda().catch(() => []);
  return <TodayGamesBlock block={block} leagues={leagues} />;
}
