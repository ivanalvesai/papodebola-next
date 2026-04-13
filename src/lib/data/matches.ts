import { fetchAllSports } from "@/lib/api/allsports";
import { getLeagueCategory } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import type { NormalizedMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapStatus(event: any): {
  status: NormalizedMatch["status"];
  statusText: string;
  minute: string;
} {
  const type = event.status?.type;
  const code = event.status?.code;
  const desc = event.status?.description;

  if (type === "inprogress") {
    if (code === 6) return { status: "live", statusText: "1º Tempo", minute: `${desc || ""}` };
    if (code === 7) return { status: "live", statusText: "2º Tempo", minute: `${desc || ""}` };
    if (code === 41) return { status: "live", statusText: "Prorrogação", minute: `${desc || ""}` };
    return { status: "live", statusText: "Ao Vivo", minute: `${desc || ""}` };
  }

  if (type === "finished") {
    if (code === 120) return { status: "finished", statusText: "AP", minute: "AP" };
    if (code === 110) return { status: "finished", statusText: "Pen.", minute: "Pen." };
    return { status: "finished", statusText: "Encerrado", minute: "Encerrado" };
  }

  if (code === 31) return { status: "halftime", statusText: "Intervalo", minute: "Intervalo" };
  if (type === "postponed") return { status: "postponed", statusText: "Adiado", minute: "Adiado" };
  if (type === "canceled") return { status: "cancelled", statusText: "Cancelado", minute: "Cancelado" };

  return { status: "scheduled", statusText: translateStatus(desc) || "Não iniciado", minute: "" };
}

function normalizeEvent(event: any): NormalizedMatch {
  const { status, statusText, minute } = mapStatus(event);
  const homeId = event.homeTeam?.id;
  const awayId = event.awayTeam?.id;
  const leagueId = event.tournament?.uniqueTournament?.id;

  const ts = event.startTimestamp ? new Date(event.startTimestamp * 1000) : new Date();

  return {
    id: `api_${event.id}`,
    apiId: event.id,
    league: event.tournament?.uniqueTournament?.name || event.tournament?.name || "",
    leagueId,
    country: event.tournament?.category?.name || "",
    homeTeam: event.homeTeam?.name || "",
    awayTeam: event.awayTeam?.name || "",
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    homeLogo: homeId ? `/img/team/${homeId}/image` : null,
    awayLogo: awayId ? `/img/team/${awayId}/image` : null,
    time: ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    date: ts.toISOString().split("T")[0],
    status,
    statusText,
    minute,
    category: leagueId ? getLeagueCategory(leagueId) : "all",
  };
}

export async function getTodayMatches(): Promise<NormalizedMatch[]> {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  const data = await fetchAllSports<any>(
    `matches/${d}/${m}/${y}`,
    3600
  );

  if (!data?.events) return [];
  return data.events.map(normalizeEvent);
}

export async function getTomorrowMatches(): Promise<NormalizedMatch[]> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = tomorrow.getDate();
  const m = tomorrow.getMonth() + 1;
  const y = tomorrow.getFullYear();

  const data = await fetchAllSports<any>(
    `matches/${d}/${m}/${y}`,
    3600
  );

  if (!data?.events) return [];
  return data.events.map(normalizeEvent);
}

export async function getLiveMatches(): Promise<NormalizedMatch[]> {
  const data = await fetchAllSports<any>("matches/live", 300);
  if (!data?.events) return [];
  return data.events.map(normalizeEvent);
}
