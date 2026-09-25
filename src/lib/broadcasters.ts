// Mapeamento aproximado de transmissão por campeonato. Atualizar conforme acordos contratuais.
//
// A API manda o nome comercial do torneio ("Brasileirão Betano", "Copa Betano do Brasil",
// "LaLiga", "Serie A"), então o nome é normalizado antes: sem acento, sem patrocinador e
// sem espaço duplicado.
function normalizeLeague(league: string): string {
  return league
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(betano|superbet|assai|ea sports|conmebol|uefa)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBroadcasters(league: string): string[] {
  const l = normalizeLeague(league);
  const brasileirao = l.includes("brasileir");
  if (brasileirao && /serie b\b/.test(l)) return ["Premiere", "ESPN", "Disney+"];
  if (brasileirao && !/serie [cd]\b/.test(l)) return ["Premiere", "Globoplay", "Record", "SporTV"];
  if (l.includes("copa do brasil")) return ["Globo", "SporTV", "Premiere", "Amazon Prime Video"];
  if (l.includes("libertadores")) return ["SBT", "Paramount+", "ESPN", "Disney+"];
  if (l.includes("sudamericana")) return ["ESPN", "Disney+", "Paramount+"];
  if (l.includes("champions")) return ["TNT Sports", "HBO Max", "SBT"];
  if (l.includes("europa league") || l.includes("conference")) return ["ESPN", "Disney+"];
  if (l.includes("premier league")) return ["ESPN", "Disney+"];
  if (l.replace(/\s/g, "") === "laliga") return ["ESPN", "Disney+"];
  if (l === "serie a" || (l.includes("serie a") && l.includes("itali"))) return ["ESPN", "Disney+"];
  if (l.includes("bundesliga")) return ["OneFootball", "CazéTV"];
  if (l.includes("ligue 1")) return ["CazéTV"];
  if (l.includes("copa do mundo") || l.includes("world cup")) return ["Globo", "SporTV", "FIFA+"];
  if (l.includes("eliminat") || l.includes("sul-americ")) return ["SporTV", "Globoplay"];
  return [];
}
