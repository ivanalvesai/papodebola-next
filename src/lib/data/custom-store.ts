import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

async function ensureDir() {
  try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* exists */ }
}

async function readJSON<T>(filename: string, fallback: T): Promise<T> {
  try {
    const data = await readFile(join(DATA_DIR, filename), "utf-8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await ensureDir();
  await writeFile(join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// ==================== CUSTOM TEAMS ====================

export interface CustomTeam {
  id: string;
  name: string;
  shortName: string;
  badge: string; // path to badge image e.g. /escudos/time-abc.png
  createdAt: string;
}

export async function getCustomTeams(): Promise<CustomTeam[]> {
  return readJSON("custom-teams.json", []);
}

export async function addCustomTeam(team: Omit<CustomTeam, "id" | "createdAt">): Promise<CustomTeam> {
  const teams = await getCustomTeams();
  const newTeam: CustomTeam = {
    ...team,
    id: `ct_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  teams.push(newTeam);
  await writeJSON("custom-teams.json", teams);
  return newTeam;
}

export async function deleteCustomTeam(id: string): Promise<boolean> {
  const teams = await getCustomTeams();
  const filtered = teams.filter((t) => t.id !== id);
  if (filtered.length === teams.length) return false;
  await writeJSON("custom-teams.json", filtered);
  return true;
}

// ==================== CUSTOM LEAGUES ====================

export interface CustomLeague {
  id: string;
  name: string;
  createdAt: string;
}

export async function getCustomLeagues(): Promise<CustomLeague[]> {
  return readJSON("custom-leagues.json", []);
}

export async function addCustomLeague(name: string): Promise<CustomLeague> {
  const leagues = await getCustomLeagues();
  const newLeague: CustomLeague = {
    id: `cl_${Date.now().toString(36)}`,
    name,
    createdAt: new Date().toISOString(),
  };
  leagues.push(newLeague);
  await writeJSON("custom-leagues.json", leagues);
  return newLeague;
}

export async function deleteCustomLeague(id: string): Promise<boolean> {
  const leagues = await getCustomLeagues();
  const filtered = leagues.filter((l) => l.id !== id);
  if (filtered.length === leagues.length) return false;
  await writeJSON("custom-leagues.json", filtered);
  return true;
}

// ==================== CUSTOM GAMES ====================

export interface CustomGame {
  id: string;
  leagueId: string;
  leagueName: string;
  homeTeamId: string;
  homeTeamName: string;
  homeBadge: string;
  awayTeamId: string;
  awayTeamName: string;
  awayBadge: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: "scheduled" | "live" | "finished";
  homeScore: number;
  awayScore: number;
  featured: boolean;
  embeds: { name: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export async function getCustomGames(): Promise<CustomGame[]> {
  return readJSON("custom-games.json", []);
}

export async function addCustomGame(game: Omit<CustomGame, "id" | "createdAt" | "updatedAt">): Promise<CustomGame> {
  const games = await getCustomGames();
  const newGame: CustomGame = {
    ...game,
    id: `cg_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  games.push(newGame);
  await writeJSON("custom-games.json", games);
  return newGame;
}

export async function updateCustomGame(id: string, updates: Partial<CustomGame>): Promise<CustomGame | null> {
  const games = await getCustomGames();
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;
  games[index] = { ...games[index], ...updates, updatedAt: new Date().toISOString() };
  await writeJSON("custom-games.json", games);
  return games[index];
}

export async function deleteCustomGame(id: string): Promise<boolean> {
  const games = await getCustomGames();
  const filtered = games.filter((g) => g.id !== id);
  if (filtered.length === games.length) return false;
  await writeJSON("custom-games.json", filtered);
  return true;
}
