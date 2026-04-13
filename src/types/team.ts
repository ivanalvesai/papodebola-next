export interface Highlight {
  title: string;
  subtitle: string;
  thumbnail: string;
  url: string;
  team: string;
  teamId: number;
  date: string;
}

export interface Transfer {
  player: string;
  playerId: number;
  position: string;
  fromTeam: string;
  toTeam: string;
  toTeamId: number;
  fee: string | number;
  feeCurrency: string;
  type: string;
  date: string;
}

export interface Scorer {
  player: {
    id: number;
    name: string;
    shortName: string;
  };
  team: {
    id: number;
    name: string;
  };
  goals: number;
  rating: number | null;
}
