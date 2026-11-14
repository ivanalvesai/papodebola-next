import { fetchAllSports } from "@/lib/api/allsports";
import { withSnapshot } from "@/lib/data/snapshot-store";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Jogos de um campeonato de OUTRO ESPORTE (NBA, NFL...) pela temporada, sem depender do
// feed por data ({esporte}/matches/{d}/{m}/{y}), que devolve 0 jogos (bug do provedor).
//
// 1) A temporada atual sai de tournament/{id}/seasons (1ª da lista que não é copa/play-in),
//    então a virada de temporada (NBA em outubro, NFL em setembro) não exige mexer no código.
//    O seasonId do config fica só como reserva se a API falhar.
// 2) Próximos + últimos jogos da temporada ficam salvos em snapshots/sport-season/{id}.json
//    (regra de ouro: a página continua com dados se a API cair).

const NOT_MAIN_SEASON = /\b(cup|play-?in|pre-?season|all-?star|summer league|qualif)/i;

export async function currentSeasonId(tournamentId: number, fallback?: number): Promise<number | undefined> {
  const data = await fetchAllSports<any>(`tournament/${tournamentId}/seasons`, 86400).catch(() => null);
  const season = (data?.seasons || []).find((s: any) => s?.id && !NOT_MAIN_SEASON.test(String(s.name || "")));
  return season?.id ?? fallback;
}

export interface SeasonWindow {
  seasonId: number;
  events: any[]; // eventos crus da API (últimos + próximos), ordenados por horário
}

export async function getSeasonWindow(tournamentId: number, fallbackSeason?: number): Promise<SeasonWindow | null> {
  return withSnapshot<SeasonWindow>(
    "sport-season",
    tournamentId,
    async () => {
      const seasonId = await currentSeasonId(tournamentId, fallbackSeason);
      if (!seasonId) return null;
      const base = `tournament/${tournamentId}/season/${seasonId}/matches`;
      // next/0 traz 30 jogos (~3 dias de NBA); next/1 completa os 5 dias do calendário.
      const [last, next, next1] = await Promise.all([
        fetchAllSports<any>(`${base}/last/0`, 600).catch(() => null),
        fetchAllSports<any>(`${base}/next/0`, 600).catch(() => null),
        fetchAllSports<any>(`${base}/next/1`, 3600).catch(() => null),
      ]);
      const byId = new Map<number, any>();
      for (const e of [...(last?.events || []), ...(next?.events || []), ...(next1?.events || [])]) if (e?.id) byId.set(e.id, e);
      const events = [...byId.values()].sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0));
      return { seasonId, events };
    },
    (w) => w.events.length > 0
  ).catch(() => null);
}

const TZ = "America/Sao_Paulo";
// "AAAA-MM-DD" do dia em Brasília (os jogos da NBA às 22h não podem cair no dia seguinte UTC).
export function spDayKey(tsSeconds: number): string {
  return new Date(tsSeconds * 1000).toLocaleDateString("en-CA", { timeZone: TZ });
}
