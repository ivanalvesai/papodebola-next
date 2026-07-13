import type { StandingsGroup } from "./standings";
import type { ChampionshipMatch } from "./match";
import type { Scorer } from "./team";

// Um round do campeonato (fase de grupos OU mata-mata). No mata-mata o `round` da API
// repete números da fase de grupos, então a IDENTIDADE é a `key` (nº do round de grupo
// ou o slug do mata-mata, ex.: "round-of-32").
export interface RoundRef {
  key: string; // "1".."N" (grupo) ou slug do mata-mata ("round-of-32")
  round: number; // número do round na API
  slug?: string; // slug do mata-mata (quando aplicável)
  label: string; // rótulo PT ("Rodada 6", "Oitavas de final")
  knockout: boolean;
}

export interface ChampionshipData {
  tournament: {
    id: number;
    seasonId: number;
    name: string;
  };
  rounds: number[]; // legado: números dos rounds da fase de grupos/liga
  roundList?: RoundRef[]; // rounds com rótulo (grupos + mata-mata) — fonte do seletor
  currentRound: number;
  currentRoundKey?: string; // key do round atual (slug no mata-mata)
  standings: StandingsGroup[];
  matchesByRound: Record<string, ChampionshipMatch[]>; // chave = RoundRef.key
  topScorers?: Scorer[];
  updatedAt: string;
  // id→slug dos times do Payload (Série B) p/ linkar na tabela (anexado pela API).
  payloadTeamSlugs?: Record<number, string>;
}

export interface CBFChampionship {
  name: string;
  slug: string;
  cbfId: string;
  totalMatches: number;
  rounds: number[];
  currentRound: number;
  today: import("./match").CBFMatch[];
  upcoming: import("./match").CBFMatch[];
  byRound: Record<number, import("./match").CBFMatch[]>;
}

export interface CBFCalendarData {
  championships: CBFChampionship[];
  updatedAt: string;
}
