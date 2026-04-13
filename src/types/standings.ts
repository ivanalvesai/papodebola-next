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
}

export interface StandingsGroup {
  name: string;
  rows: StandingRow[];
}
