import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";

// Transmissão de cada jogo (canal exato), preenchida no painel (/painel-pdb-9x/transmissoes)
// toda semana a partir da tabela detalhada da CBF / grade das emissoras. Nem a AllSportsApi
// nem a API da CBF trazem o canal. Arquivo no volume compartilhado (dev e prod leem o mesmo).
// Ordem nas páginas: guia "onde assistir" publicado > este arquivo > lista de direitos do campeonato.
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "match-broadcasts.json");

export interface MatchBroadcast {
  channels: string; // ex.: "Premiere" ou "Globo, SporTV e Premiere"
  home: string;
  away: string;
  league: string;
  timestamp: number;
  updatedBy: string;
  updatedAt: string;
}

export type BroadcastMap = Record<string, MatchBroadcast>;

export async function getBroadcastMap(): Promise<BroadcastMap> {
  try {
    return JSON.parse(await readFile(FILE, "utf-8")) as BroadcastMap;
  } catch {
    return {};
  }
}

export async function getMatchBroadcast(matchId: number | string | undefined | null): Promise<MatchBroadcast | null> {
  if (!matchId) return null;
  const map = await getBroadcastMap();
  const b = map[String(matchId)];
  return b?.channels?.trim() ? b : null;
}

export async function setMatchBroadcast(matchId: number | string, data: Omit<MatchBroadcast, "updatedAt">): Promise<void> {
  const map = await getBroadcastMap();
  const key = String(matchId);
  if (!data.channels.trim()) delete map[key];
  else map[key] = { ...data, channels: data.channels.trim(), updatedAt: new Date().toISOString() };
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await writeFile(FILE, JSON.stringify(map, null, 1));
}

// Jogos não encerrados dos próximos `days` dias, lidos dos snapshots de campeonato no volume
// (data/snapshots/championships/*.json). Sem chamada à API.
export interface UpcomingMatch {
  id: number;
  home: string;
  away: string;
  timestamp: number;
  league: string;
  champSlug: string;
}

export async function listUpcomingMatches(days = 10): Promise<UpcomingMatch[]> {
  const dir = join(DATA_DIR, "snapshots", "championships");
  const now = Date.now() / 1000;
  const until = now + days * 86400;
  const out = new Map<number, UpcomingMatch>();
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  for (const f of files) {
    try {
      const d = JSON.parse(await readFile(join(dir, f), "utf-8")) as {
        tournament?: { name?: string };
        matchesByRound?: Record<string, { id: number; home: string; away: string; timestamp: number; status?: string }[]>;
      };
      for (const list of Object.values(d.matchesByRound || {})) {
        for (const m of list || []) {
          if (!m?.id || !m.timestamp || m.timestamp < now - 3 * 3600 || m.timestamp > until) continue;
          if (m.status === "finished" || m.status === "canceled" || m.status === "postponed") continue;
          out.set(m.id, {
            id: m.id,
            home: m.home,
            away: m.away,
            timestamp: m.timestamp,
            league: d.tournament?.name || f.replace(/\.json$/, ""),
            champSlug: f.replace(/\.json$/, ""),
          });
        }
      }
    } catch {
      /* snapshot corrompido: ignora */
    }
  }
  return [...out.values()].sort((a, b) => a.timestamp - b.timestamp || a.league.localeCompare(b.league));
}
