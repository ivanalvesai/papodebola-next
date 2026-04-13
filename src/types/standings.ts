export type FormResult = "W" | "D" | "L";

export interface StandingRow {
  pos: number;
  team: string;
  teamId: number;
  pts: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  promo: string;
  posChange: number; // positive = subiu, negative = caiu, 0 = manteve
  recentForm: FormResult[]; // últimos 5 jogos, do mais recente ao mais antigo
}

export interface StandingsGroup {
  name: string;
  rows: StandingRow[];
}
