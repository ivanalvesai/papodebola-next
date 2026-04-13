import type { StandingsGroup } from "./standings";
import type { ChampionshipMatch } from "./match";
import type { Scorer } from "./team";

export interface ChampionshipData {
  tournament: {
    id: number;
    seasonId: number;
    name: string;
  };
  rounds: number[];
  currentRound: number;
  standings: StandingsGroup[];
  matchesByRound: Record<number, ChampionshipMatch[]>;
  topScorers?: Scorer[];
  updatedAt: string;
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
