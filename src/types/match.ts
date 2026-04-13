export interface NormalizedMatch {
  id: string;
  apiId: number;
  league: string;
  leagueId: number | undefined;
  country: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homeLogo: string | null;
  awayLogo: string | null;
  time: string;
  date: string;
  status: "live" | "scheduled" | "finished" | "halftime" | "postponed" | "cancelled";
  statusText: string;
  minute: string;
  category: string;
}

export interface ChampionshipMatch {
  id: number;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  statusDesc: string;
  timestamp: number;
  round: number;
}

export interface CBFMatch {
  id: number;
  round: number;
  home: string;
  away: string;
  homeId: number | null;
  awayId: number | null;
  homeShield: string | null;
  awayShield: string | null;
  date: string;
  time: string;
  timestamp: number;
  venue: string;
  isPast: boolean;
  championship?: string;
}

export interface TopMatch {
  id: number;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  homeScore: number | null;
  awayScore: number | null;
  league: string;
  status: string;
  time: string;
}
