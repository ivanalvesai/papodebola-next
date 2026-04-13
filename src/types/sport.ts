export interface SportEvent {
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
  timestamp: number;
}

export interface SportCalendarDay {
  date: string;
  label: string;
  events: SportEvent[];
}

export interface RankingEntry {
  pos: number;
  name: string;
  teamId: number;
  points: number;
}

export interface SportData {
  live: SportEvent[];
  today: SportEvent[];
  calendar: SportCalendarDay[];
  standings: import("./standings").StandingsGroup[] | null;
  rankings: RankingEntry[] | null;
  updated: string;
}

export interface AthleteData {
  info: Record<string, unknown> | null;
  previous: SportEvent[];
  next: SportEvent[];
  updated: string;
}

export interface SportConfig {
  slug: string;
  api: string;
  tournamentId?: number;
  seasonId?: number;
  hasStandings?: boolean;
  rankingType?: string;
  hasRankings?: boolean;
}
