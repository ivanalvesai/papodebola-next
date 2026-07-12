import { NextResponse } from "next/server";
import { fetchAllSports } from "@/lib/api/allsports";
import { getTeamPreviousEvents } from "@/lib/data/team";
import { getPayloadTeamsList } from "@/lib/data/payload-teams";
import { TEAMS } from "@/lib/config";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper do editor (bloco "Escalação no campo"):
//   ?teams=1        -> lista {id,name} de times conhecidos (config Série A/EU + Payload Série B)
//   ?teamId=1973    -> XI provável do jogo anterior: { teamName, formation, players[] }
// Público (dados esportivos, os mesmos das páginas de jogo). fetchAllSports já cacheia.

// Times do config (Série A + Europa) + Série B (Payload), deduplicado por id, ordenado por nome.
async function teamsList(): Promise<{ id: number; name: string }[]> {
  const fromConfig = TEAMS.map((t) => ({ id: t.id, name: t.name }));
  const fromPayload = await getPayloadTeamsList();
  const byId = new Map<number, string>();
  for (const t of [...fromConfig, ...fromPayload]) if (t.id && !byId.has(t.id)) byId.set(t.id, t.name);
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

type SuggestPlayer = { name: string; number: string; playerId: string };

// Titulares de um lado do lineup (não-substitutos), na ordem da API (goleiro -> ataque).
function starters(side: any): SuggestPlayer[] {
  const players: any[] = Array.isArray(side?.players) ? side.players : [];
  return players
    .filter((p) => !p?.substitute)
    .map((p) => ({
      name: p?.player?.name || "",
      number: String(p?.shirtNumber ?? p?.player?.jerseyNumber ?? ""),
      playerId: p?.player?.id ? String(p.player.id) : "",
    }))
    .filter((p) => p.name);
}

// Pega o XI provável = escalação do jogo anterior mais recente que TENHA lineup.
async function suggestLineup(teamId: number) {
  const prev = await getTeamPreviousEvents(teamId);
  // mais recentes primeiro
  const games = [...prev].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  for (const g of games.slice(0, 6)) {
    const raw = await fetchAllSports<any>(`match/${g.id}/lineups`, 86400);
    if (!raw) continue;
    const isHome = g.homeId === teamId;
    const side = isHome ? raw.home : raw.away;
    const list = starters(side);
    if (list.length >= 7) {
      return {
        teamName: isHome ? g.home : g.away,
        formation: side?.formation || "",
        players: list.slice(0, 11),
        fromMatch: g.id,
      };
    }
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("teams")) {
    const teams = await teamsList();
    return NextResponse.json({ teams });
  }

  const teamId = Number(searchParams.get("teamId"));
  if (!teamId) {
    return NextResponse.json({ error: "informe ?teamId= ou ?teams=1" }, { status: 400 });
  }

  const result = await suggestLineup(teamId);
  if (!result) {
    return NextResponse.json({ players: [], error: "sem escalação do jogo anterior" }, { status: 200 });
  }
  return NextResponse.json(result);
}
