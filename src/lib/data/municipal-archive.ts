// Regras puras (sem fs) do municipal: mescla do dado vivo com o arquivo congelado,
// limpeza de registros raspados com defeito e o campeão derivado dos dados.
// Importável no cliente (municipal-client.tsx) e testável com node --test.

interface ChampLike {
  name: string;
  slug?: string;
  matches?: { home: string; away: string }[];
}

const champKey = (c: ChampLike) => c.slug || c.name;
const hasUnknownTeam = (c: ChampLike) => (c.matches || []).some((m) => !m.home || !m.away || m.home === "?" || m.away === "?");

// Campeonatos: dado vivo primeiro. Campeonato que só existe no arquivo (a prefeitura
// trocou de temporada ou tirou do ar) continua servido. Se o vivo veio com time não
// identificado ("?", raspagem com defeito) e o arquivo do mesmo campeonato não, vale o arquivo.
export function mergeChampionships<T extends ChampLike>(live: T[], archived: T[]): T[] {
  const arch = new Map(archived.map((c) => [champKey(c), c]));
  const out = live.map((c) => {
    const a = arch.get(champKey(c));
    return a && hasUnknownTeam(c) && !hasUnknownTeam(a) ? a : c;
  });
  const seen = new Set(live.map(champKey));
  for (const a of archived) {
    if (seen.has(champKey(a))) continue;
    seen.add(champKey(a));
    out.push(a);
  }
  return out;
}

// Fichas de jogo (chave "DD-MM-YYYY/par"): vivo vence; o que só está no arquivo fica.
export function mergeMatchRecords<T>(live: Record<string, T>, archived: Record<string, T>): Record<string, T> {
  return { ...archived, ...live };
}

// Chave válida = "data/mandante-visitante". Fica de fora: chave antiga sem data, e par
// quebrado de quando o visitante do mata-mata não era lido ("19-09-2026/santana-").
export function isValidMatchKey(key: string): boolean {
  const [date, pair, extra] = key.split("/");
  return !!date && !!pair && extra === undefined && !pair.startsWith("-") && !pair.endsWith("-");
}

// URL antiga quebrada ("/jogo/19-09-2026/santana-") → a chave certa do mesmo dia que
// começa com o mesmo mandante, se for única.
export function fixBrokenMatchKey(dateSlug: string, pairSlug: string, keys: string[]): string | null {
  if (!pairSlug.endsWith("-")) return null;
  const prefix = `${dateSlug}/${pairSlug}`;
  const hits = keys.filter((k) => k.startsWith(prefix) && isValidMatchKey(k));
  return hits.length === 1 ? hits[0] : null;
}

// Local/arbitragem das fichas raspadas antes da correção do parser vinham como
// ">Local \r\n   CAMPO X \r\n RUA ..." e ">Arbitragem". Fica só o nome do campo / árbitro.
export function cleanVenue(v: string): string {
  const s = String(v || "").replace(/^\s*>?\s*Local\b/i, "");
  return s.split(/\r?\n/).map((x) => x.trim()).find(Boolean) || "";
}
export function cleanReferee(v: string): string {
  return String(v || "").replace(/^\s*>?\s*Arbitragem\b/i, "").replace(/\s+/g, " ").trim();
}

export interface MunicipalChampion {
  team: string;
  badge: string;
  score: string; // placar da final como foi jogada: "SANTANA 1 x 0 UNIÃO DO MORRO"
}

interface ChampionInput {
  groups?: { teams: { name: string; badge?: string }[] }[];
  matches?: {
    round: number;
    roundLabel?: string;
    home: string;
    away: string;
    homeScore: number | null;
    awayScore: number | null;
    homeBadgeLocal?: string;
    awayBadgeLocal?: string;
  }[];
  roundMeta?: Record<string, { label?: string }>;
}

const norm = (s: string) =>
  (s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Z0-9]/g, "");

// Campeão = vencedor da FINAL (última rodada com rótulo "Final", jogo único), só quando
// TODOS os jogos do campeonato estão encerrados. Empate na final (pênaltis não vêm nos
// dados) ou campeonato sem final → null: nada de campeão "no chute".
export function deriveChampion(c: ChampionInput): MunicipalChampion | null {
  const matches = c.matches || [];
  if (!matches.length) return null;
  if (matches.some((m) => m.homeScore == null || m.awayScore == null)) return null;
  const last = Math.max(...matches.map((m) => m.round || 0));
  const finals = matches.filter((m) => m.round === last);
  const label = c.roundMeta?.[String(last)]?.label || finals[0]?.roundLabel || "";
  if (!/\bfinal\b/i.test(label) || /semi|quartas|oitavas/i.test(label)) return null;
  if (finals.length !== 1) return null;
  const f = finals[0];
  if (f.home === "?" || f.away === "?" || f.homeScore === f.awayScore) return null;
  const homeWon = (f.homeScore as number) > (f.awayScore as number);
  const short = homeWon ? f.home : f.away;
  const badge = (homeWon ? f.homeBadgeLocal : f.awayBadgeLocal) || "";
  const score = `${f.home} ${f.homeScore} x ${f.awayScore} ${f.away}`;
  // O jogo usa o nome curto ("SANTANA"); a tabela, o completo ("S.C SANTANA"). Usa o da
  // tabela quando só um time dela contém o nome curto.
  const teams = (c.groups || []).flatMap((g) => g.teams);
  const ns = norm(short);
  const exact = teams.find((t) => norm(t.name) === ns);
  const partial = teams.filter((t) => norm(t.name).includes(ns));
  const full = exact || (partial.length === 1 ? partial[0] : null);
  return { team: full?.name || short, badge: full?.badge || badge, score };
}
