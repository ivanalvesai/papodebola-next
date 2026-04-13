import { fetchAllSports } from "@/lib/api/allsports";
import { translateStatus } from "@/lib/translations";
import type { HomeData, HomeNews } from "@/types/home";
import type { Highlight, Transfer } from "@/types/team";
import type { TopMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Brasileirão Série A 2026 - 20 clubes (IDs verificados via API standings)
const TEAM_IDS = [
  1963, 5981, 1981, 1961, 1955, 1967, 1982, 1977,
  1999, 1962, 1958, 5926, 1974, 1966, 1968, 1957,
  1954, 2012, 21845, 21982,
];

const TEAM_NAMES: Record<number, string> = {
  1963: "Palmeiras", 5981: "Flamengo", 1981: "São Paulo", 1961: "Fluminense",
  1955: "Bahia", 1967: "Athletico-PR", 1982: "Coritiba", 1977: "Atlético-MG",
  1999: "Bragantino", 1962: "Vitória", 1958: "Botafogo", 5926: "Grêmio",
  1974: "Vasco", 1966: "Internacional", 1968: "Santos", 1957: "Corinthians",
  1954: "Cruzeiro", 2012: "Remo", 21845: "Chapecoense", 21982: "Mirassol",
};

export async function getHighlights(): Promise<Highlight[]> {
  const highlights: Highlight[] = [];

  for (const teamId of TEAM_IDS.slice(0, 7)) {
    const data = await fetchAllSports<any>(`team/${teamId}/media`, 86400);
    const media = data?.media || [];

    for (const item of media) {
      if (item.mediaType === 6 || (item.url && item.url.includes("youtube"))) {
        highlights.push({
          title: item.title || "",
          subtitle: item.subtitle || "",
          thumbnail: item.thumbnailUrl || item.url || "",
          url: item.url || "",
          team: TEAM_NAMES[teamId] || "",
          teamId,
          date: item.createdAtTimestamp
            ? new Date(item.createdAtTimestamp * 1000).toISOString()
            : new Date().toISOString(),
        });
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  return highlights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getTransfers(): Promise<Transfer[]> {
  const transfers: Transfer[] = [];
  const TYPE_MAP: Record<number, string> = {
    1: "Compra", 2: "Empréstimo", 3: "Fim de empréstimo", 4: "Transferência",
  };

  for (const teamId of TEAM_IDS.slice(0, 6)) {
    const data = await fetchAllSports<any>(`team/${teamId}/transfers`, 86400);
    const items = data?.transfersIn || [];

    for (const t of items.slice(0, 5)) {
      transfers.push({
        player: t.player?.name || "",
        playerId: t.player?.id || 0,
        position: t.player?.position || "",
        fromTeam: t.transferFrom?.name || "",
        toTeam: TEAM_NAMES[teamId] || "",
        toTeamId: teamId,
        fee: t.transferFee?.value || 0,
        feeCurrency: t.transferFee?.currency || "EUR",
        type: TYPE_MAP[t.type] || "Transferência",
        date: t.transferDateTimestamp
          ? new Date(t.transferDateTimestamp * 1000).toISOString()
          : new Date().toISOString(),
      });
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  return transfers
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);
}

export async function getTopMatches(): Promise<TopMatch[]> {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  const data = await fetchAllSports<any>(`matches/top/${d}/${m}/${y}`, 3600);
  if (!data?.events) return [];

  return data.events.slice(0, 10).map((event: any) => ({
    id: event.id,
    home: event.homeTeam?.name || "",
    away: event.awayTeam?.name || "",
    homeId: event.homeTeam?.id || 0,
    awayId: event.awayTeam?.id || 0,
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    league: event.tournament?.uniqueTournament?.name || "",
    status: translateStatus(event.status?.description) || "",
    time: event.startTimestamp
      ? new Date(event.startTimestamp * 1000).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        })
      : "",
  }));
}

export async function getHomeData(): Promise<HomeData> {
  const [highlights, transfers, topMatches] = await Promise.all([
    getHighlights(),
    getTransfers(),
    getTopMatches(),
  ]);

  return {
    highlights,
    transfers,
    news: [], // News come from WordPress via getArticles()
    topMatches,
    updatedAt: new Date().toISOString(),
  };
}
