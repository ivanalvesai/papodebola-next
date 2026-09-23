import { NextResponse } from "next/server";
import { getTeamLastLineup } from "@/lib/data/team";
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

  const result = await getTeamLastLineup(teamId);
  if (!result) {
    return NextResponse.json({ players: [], error: "sem escalação do jogo anterior" }, { status: 200 });
  }
  return NextResponse.json(result);
}
