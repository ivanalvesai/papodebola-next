import { readFile } from "fs/promises";
import { join } from "path";

// Detalhe estático de um jogo municipal (SisGel), lido do arquivo raspado no volume
// (data/sisgel-matches.json). Gols, escalação, local, arbitragem — sem tempo real.
export interface MunicipalPlayer {
  name: string;
  yellow: number;
  red: number;
}
export interface MunicipalGoal {
  player: string;
  goals: number;
  isHome: boolean;
  ownGoal?: boolean;
}
export interface MunicipalMatch {
  slug: string;
  dateSlug: string;
  token: string;
  division: string;
  divisionSlug: string;
  round: number;
  phase?: string;
  roundLabel?: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  venue: string;
  status: string;
  homeBadge: string;
  awayBadge: string;
  goals: MunicipalGoal[];
  lineups: { home: MunicipalPlayer[]; away: MunicipalPlayer[] };
  referee: string;
  scrapedAt: string;
}

async function readMatches(): Promise<Record<string, MunicipalMatch>> {
  try {
    const raw = await readFile(join(process.cwd(), "data", "sisgel-matches.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const teamKey = (name: string) => (name || "").trim().toUpperCase();
// Elenco é por DIVISÃO + time: o mesmo clube (ex.: VIRACOPOS) joga em campeonatos
// diferentes (1ª divisão, veterano, veteraníssimo) com elencos distintos — misturar por
// nome inflaria a lista. Escopado por divisão, a lista fica consistente (~29) em cada.
const rosterKey = (divisionSlug: string, team: string) => `${divisionSlug || ""}::${teamKey(team)}`;

// Elenco = UNIÃO de todos os jogadores vistos nos jogos daquele time NAQUELA divisão.
// Como o municipal é amador (não filtram titular/reserva; muitos faltam), a lista de
// nomes é praticamente a mesma em todo jogo — o superset é o elenco completo.
function buildRosters(all: Record<string, MunicipalMatch>): Record<string, string[]> {
  const sets: Record<string, Map<string, string>> = {}; // key -> (nomeUpper -> nomeOriginal)
  for (const m of Object.values(all)) {
    for (const [team, players] of [
      [m.home, m.lineups?.home],
      [m.away, m.lineups?.away],
    ] as const) {
      const k = rosterKey(m.divisionSlug, team);
      if (!teamKey(team)) continue;
      (sets[k] ||= new Map());
      for (const p of players || []) {
        const n = (p.name || "").trim();
        if (n) sets[k].set(n.toUpperCase(), n);
      }
    }
  }
  const out: Record<string, string[]> = {};
  for (const k of Object.keys(sets)) {
    out[k] = [...sets[k].values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }
  return out;
}

// Aplica o elenco completo do time à escalação do jogo, mantendo os cartões DESTE jogo.
function applyRoster(
  divisionSlug: string,
  team: string,
  gamePlayers: MunicipalPlayer[],
  rosters: Record<string, string[]>
): MunicipalPlayer[] {
  const names = rosters[rosterKey(divisionSlug, team)];
  if (!names || names.length === 0) return gamePlayers || [];
  const cardByName = new Map((gamePlayers || []).map((p) => [teamKey(p.name), p]));
  return names.map((name) => {
    const c = cardByName.get(teamKey(name));
    return { name, yellow: c?.yellow || 0, red: c?.red || 0 };
  });
}

// Chave composta no arquivo: "DD-MM-YYYY/home-away" (padrão da URL /jogo/[data]/[slug]).
export async function getMunicipalMatch(dateSlug: string, pairSlug: string): Promise<MunicipalMatch | null> {
  const all = await readMatches();
  const m = all[`${dateSlug}/${pairSlug}`];
  if (!m) return null;
  // Escalação = elenco completo do time na divisão (superset dos jogos) + cartões deste jogo.
  const rosters = buildRosters(all);
  return {
    ...m,
    lineups: {
      home: applyRoster(m.divisionSlug, m.home, m.lineups?.home || [], rosters),
      away: applyRoster(m.divisionSlug, m.away, m.lineups?.away || [], rosters),
    },
  };
}

// Retorna as chaves compostas "data/par" (o sitemap monta /jogo/{data}/{par}).
export async function getMunicipalMatchKeys(): Promise<string[]> {
  const all = await readMatches();
  return Object.keys(all);
}
