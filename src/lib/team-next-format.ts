import type { TeamNextMatch } from "./team-seo.ts";

// Próximo jogo → texto curto pros títulos dinâmicos: adversário (pelo lado do time),
// "seg 26/10" e "20h"/"20h30" no horário de Brasília.
type M = { homeId: number; awayId: number; home: string; away: string; league: string; timestamp: number };
const TZ = "America/Sao_Paulo";

export function formatTeamNext(m: M | null, teamId: number): TeamNextMatch | null {
  if (!m || !m.timestamp) return null;
  const d = new Date(m.timestamp * 1000);
  const wd = d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: TZ }).replace(".", "");
  const dm = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ });
  const [h, min] = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).split(":");
  return {
    opponent: m.homeId === teamId ? m.away : m.home,
    date: `${wd} ${dm}`,
    time: min === "00" ? `${Number(h)}h` : `${Number(h)}h${min}`,
    league: m.league,
  };
}
