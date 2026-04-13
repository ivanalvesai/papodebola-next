import { fetchCBF } from "@/lib/api/cbf";
import { CBF_IDS } from "@/lib/config";
import type { CBFCalendarData } from "@/types/tournament";
import type { CBFMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Team name → Sofascore ID mapping
const TEAM_MAP: Record<string, number> = {
  "Palmeiras": 1963, "Flamengo": 5981, "Corinthians": 1957, "São Paulo": 1981,
  "Santos": 1968, "Fluminense": 1961, "Botafogo": 1958, "Vasco da Gama": 1974,
  "Vasco": 1974, "Grêmio": 5926, "Internacional": 1966, "Atlético Mineiro": 1977,
  "Atlético-MG": 1977, "Cruzeiro": 1954, "Bahia": 1955, "Fortaleza": 2020,
  "Athletico Paranaense": 1967, "Athletico-PR": 1967, "Red Bull Bragantino": 1999,
  "Bragantino": 1999, "Coritiba": 1982, "Goiás": 1996, "Ceará": 2001,
  "Sport": 1947, "Vitória": 1962, "EC Vitória": 1962, "Juventude": 1998, "Cuiabá": 7315,
  "América-MG": 1997, "Avaí": 2002, "Chapecoense": 21845, "Ponte Preta": 2004,
  "Guarani": 2003, "CRB": 2006, "CSA": 2008, "Náutico": 1945,
  "ABC": 1942, "Remo": 2012, "Sampaio Corrêa": 2012, "Londrina": 2013, "Operário-PR": 2014,
  "Tombense": 7316, "Mirassol": 21982, "Novorizontino": 7317,
  "Vila Nova": 2005, "Paysandu": 1964, "Ituano": 7318, "Amazonas": 390895,
  "Athletic": 448023, "Botafogo-SP": 7319, "Ceará SC": 2001,
  "Santos FC": 1968, "São Paulo FC": 1981, "Sport Recife": 1947,
  "Fluminense FC": 1961, "Fortaleza EC": 2020,
};

function getTeamId(name: string): number | null {
  if (TEAM_MAP[name]) return TEAM_MAP[name];
  // Fuzzy: normalize and try
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [key, id] of Object.entries(TEAM_MAP)) {
    const keyNorm = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (keyNorm.toLowerCase() === normalized.toLowerCase()) return id;
  }
  return null;
}

function parseMatch(jogo: any): CBFMatch {
  const dateStr = (jogo.data || "").trim();
  const timeStr = (jogo.hora || "").trim();

  let timestamp = 0;
  if (dateStr && timeStr) {
    const [day, month, year] = dateStr.split("/").map(Number);
    const [hour, min] = timeStr.split(":").map(Number);
    const d = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00-03:00`);
    timestamp = Math.floor(d.getTime() / 1000);
  }

  const homeName = jogo.mandante?.nome || jogo.mandante?.sigla || "";
  const awayName = jogo.visitante?.nome || jogo.visitante?.sigla || "";

  return {
    id: jogo.id || 0,
    round: jogo.rodada || 0,
    home: homeName,
    away: awayName,
    homeId: getTeamId(homeName),
    awayId: getTeamId(awayName),
    homeShield: jogo.mandante?.escudo || null,
    awayShield: jogo.visitante?.escudo || null,
    date: dateStr,
    time: timeStr,
    timestamp,
    venue: jogo.estadio?.nome || "",
    isPast: timestamp > 0 && timestamp < Date.now() / 1000 - 10800,
  };
}

const CBF_CHAMPIONSHIPS = [
  { name: "Brasileirão Série A", slug: "brasileirao-serie-a", cbfId: String(CBF_IDS.BRASILEIRAO_A) },
  { name: "Brasileirão Série B", slug: "brasileirao-serie-b", cbfId: String(CBF_IDS.BRASILEIRAO_B) },
  { name: "Copa do Brasil", slug: "copa-do-brasil", cbfId: String(CBF_IDS.COPA_DO_BRASIL) },
];

export async function getCBFCalendar(): Promise<CBFCalendarData> {
  const championships = [];
  const now = Date.now() / 1000;

  for (const champ of CBF_CHAMPIONSHIPS) {
    const data = await fetchCBF<any>(`jogos/campeonato/${champ.cbfId}`, 43200);
    if (!data) continue;

    const jogos = Array.isArray(data) ? data : data.jogos || [];
    const matches: CBFMatch[] = jogos.map(parseMatch);

    const roundSet = new Set<number>(matches.map((m) => m.round));
    const rounds = Array.from(roundSet).sort((a, b) => a - b);
    const today = matches.filter(
      (m) => m.timestamp > 0 && Math.abs(m.timestamp - now) < 43200 && !m.isPast
    );
    const upcoming = matches
      .filter((m) => m.timestamp > now)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 30);

    const byRound: Record<number, CBFMatch[]> = {};
    for (const m of matches) {
      if (!byRound[m.round]) byRound[m.round] = [];
      byRound[m.round].push(m);
    }

    // Find current round: last round with past matches
    let currentRound = 1;
    for (const r of rounds) {
      if (byRound[r]?.some((m) => m.isPast)) currentRound = r;
    }

    championships.push({
      name: champ.name,
      slug: champ.slug,
      cbfId: champ.cbfId,
      totalMatches: matches.length,
      rounds,
      currentRound,
      today,
      upcoming,
      byRound,
    });

    await new Promise((r) => setTimeout(r, 300));
  }

  return {
    championships,
    updatedAt: new Date().toISOString(),
  };
}

export async function getCBFTodayMatches(): Promise<CBFMatch[]> {
  const calendar = await getCBFCalendar();
  const allToday: CBFMatch[] = [];

  for (const champ of calendar.championships) {
    for (const match of champ.today) {
      allToday.push({ ...match, championship: champ.name });
    }
  }

  return allToday.sort((a, b) => a.timestamp - b.timestamp);
}

export async function getCBFUpcomingMatches(): Promise<CBFMatch[]> {
  const calendar = await getCBFCalendar();
  const allUpcoming: CBFMatch[] = [];

  for (const champ of calendar.championships) {
    for (const match of champ.upcoming) {
      allUpcoming.push({ ...match, championship: champ.name });
    }
  }

  return allUpcoming.sort((a, b) => a.timestamp - b.timestamp).slice(0, 20);
}
