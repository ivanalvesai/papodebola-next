import { fetchCBF } from "@/lib/api/cbf";
import { CBF_IDS } from "@/lib/config";
import type { CBFCalendarData } from "@/types/tournament";
import type { CBFMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Team name → Sofascore ID. IDs de Série A/B validados contra a classificação
// (tournament 325/390) em 2026-06-15 — a numeração antiga da Série B estava errada
// (ex: Avaí vinha vazio e Cuiabá pegava o escudo do Avaí).
const TEAM_MAP: Record<string, number> = {
  // Série A
  "Palmeiras": 1963, "Flamengo": 5981, "Corinthians": 1957, "São Paulo": 1981,
  "Santos": 1968, "Fluminense": 1961, "Botafogo": 1958, "Vasco da Gama": 1974, "Vasco": 1974,
  "Grêmio": 5926, "Internacional": 1966, "Atlético Mineiro": 1977, "Atlético-MG": 1977,
  "Cruzeiro": 1954, "Bahia": 1955, "Athletico Paranaense": 1967, "Athletico-PR": 1967,
  "Athletico": 1967, "Red Bull Bragantino": 1999, "Bragantino": 1999, "Coritiba": 1982,
  "Vitória": 1962, "EC Vitória": 1962, "Mirassol": 21982, "Chapecoense": 21845, "Remo": 2012,
  // Série B (ids corrigidos pela classificação)
  "Fortaleza": 2020, "Ceará": 2001, "Goiás": 1960, "Avaí": 7315, "Criciúma": 1984,
  "Juventude": 1980, "Náutico": 2011, "Ponte Preta": 1969, "Vila Nova": 2021,
  "Sport Recife": 1959, "Sport": 1959, "Botafogo-SP": 1979, "Cuiabá": 49202,
  "Operário-PR": 39634, "Operário": 39634, "Athletic": 342775, "Athletic Club": 342775,
  "Atlético Goianiense": 7314, "CRB": 22032, "Londrina": 2022, "São Bernardo": 47504,
  "Grêmio Novorizontino": 135514, "Novorizontino": 135514,
  "América-MG": 1973, "América Mineiro": 1973, "América": 1973,
  // Outros (Copa do Brasil / divisões menores — best-effort, não validados na classificação)
  "Paysandu": 1964, "Amazonas": 390895, "ABC": 1942,
};

// Tokens genéricos removidos antes de casar o nome: a CBF passou a mandar sufixos
// como "SAF", "F.C.", "S.A.F." que quebravam o match exato ("Londrina SAF" etc.).
const SUFFIX_TOKENS = new Set([
  "saf", "fc", "ec", "sc", "ac", "f", "c", "s", "a",
  "futebol", "clube", "esporte", "esportivo", "esportes", "regatas", "de", "do", "da",
]);

function smartKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((t) => t && !SUFFIX_TOKENS.has(t))
    .join(" ");
}

// Mapa normalizado (1ª ocorrência vence). Resolve nomes com sufixo/pontuação sem
// precisar de uma entrada por variação.
const TEAM_MAP_SMART: Record<string, number> = {};
for (const [name, id] of Object.entries(TEAM_MAP)) {
  const k = smartKey(name);
  if (k && !(k in TEAM_MAP_SMART)) TEAM_MAP_SMART[k] = id;
}

function getTeamId(name: string): number | null {
  if (TEAM_MAP[name] != null) return TEAM_MAP[name];
  const k = smartKey(name);
  return TEAM_MAP_SMART[k] ?? null;
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

// Ligas BR cobertas pela CBF que têm página de lance-a-lance (Sofascore).
const CBF_HREF_LEAGUES = ["brasileirao-serie-a", "brasileirao-serie-b", "copa-do-brasil"];

export async function getCBFUpcomingMatches(): Promise<CBFMatch[]> {
  const calendar = await getCBFCalendar();
  const allUpcoming: CBFMatch[] = [];

  for (const champ of calendar.championships) {
    for (const match of champ.upcoming) {
      allUpcoming.push({ ...match, championship: champ.name });
    }
  }

  const upcoming = allUpcoming.sort((a, b) => a.timestamp - b.timestamp).slice(0, 20);

  // Enriquece cada jogo com o href do lance-a-lance (Sofascore). Casa pelo PAR DE IDS
  // do time (os nomes da CBF divergem dos do Sofascore, que é a base da página de jogo),
  // garantindo que o link resolve. Sem match → fica sem href (card não-clicável, sem regressão).
  try {
    const { getChampionshipData } = await import("./championship");
    const { matchDateSlug, matchPairSlug } = await import("@/lib/world-cup-match-url");
    const index = new Map<string, string>();
    const datas = await Promise.all(
      CBF_HREF_LEAGUES.map((s) => getChampionshipData(s).catch(() => null))
    );
    CBF_HREF_LEAGUES.forEach((slug, i) => {
      const data = datas[i];
      if (!data) return;
      for (const ms of Object.values(data.matchesByRound)) {
        for (const m of ms) {
          if (!m.homeId || !m.awayId) continue;
          index.set(
            `${m.homeId}-${m.awayId}`,
            `/futebol/${slug}/jogo/${matchDateSlug(m.timestamp)}/${matchPairSlug(
              m.homeId,
              m.awayId,
              m.home,
              m.away
            )}`
          );
        }
      }
    });
    for (const u of upcoming) {
      if (u.homeId && u.awayId) {
        const href = index.get(`${u.homeId}-${u.awayId}`);
        if (href) u.href = href;
      }
    }
  } catch {
    /* sem enrich → cards seguem sem link, igual antes */
  }

  return upcoming;
}
