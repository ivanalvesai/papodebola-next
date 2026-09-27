// Jogo remarcado / time renomeado -> acha a URL certa do jogo (PURO, sem imports de servidor).
//
// URLs de jogo indexadas no Google dão 404 quando a API remarca a partida (a data do
// slug muda) ou renomeia um time (o slug do par muda: "penarol" -> "club-atletico-penarol").
// findRescheduled compara a URL pedida com os jogos do campeonato e devolve o href do
// único jogo compatível — a página faz 308 pra ele. Ambíguo ou nada compatível = null (404).

export interface RescheduleCandidate {
  dateSlug: string; // DD-MM-YYYY (Brasília), igual ao da URL
  timestamp: number;
  homeSlug: string;
  awaySlug: string;
  href: string;
}

// Palavras genéricas de nome de clube que não identificam o time. "atletico" e "city"
// ficam DE FORA de propósito: em "Atlético-GO" / "Atlético Mineiro" o "atletico" é o que
// sobra de distintivo (o "go" tem 2 letras).
const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "del", "la", "las", "el", "los", "le", "e", "y",
  "club", "clube", "fc", "ac", "cf", "sc", "ec", "cd", "ca", "afc", "sad", "esporte",
  "futebol",
]);

// Tokens distintivos: 3+ caracteres e fora das stopwords. Se o nome só tiver tokens
// genéricos, usa todos os tokens não vazios (pra não ficar sem identidade).
export function distinctiveTokens(slug: string): string[] {
  const all = slug.split("-").filter(Boolean);
  const dist = all.filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  return dist.length ? dist : all;
}

// "DD-MM-YYYY" -> número de dias (UTC). NaN se inválido.
function dayNumber(dateSlug: string): number {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateSlug);
  if (!m) return NaN;
  return Math.round(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])) / 86_400_000);
}

// O par da URL casa com (mandante, visitante) do candidato se existe um corte k tal que
// os tokens [0,k) são todos do mandante e [k,n) são todos do visitante (ambos não vazios).
// Isso garante: começa com o mandante (mando invertido não casa), tem o visitante, e todo
// token da URL pertence a um dos dois times.
function pairMatches(urlTokens: string[], homeSlug: string, awaySlug: string): boolean {
  const home = new Set(distinctiveTokens(homeSlug));
  const away = new Set(distinctiveTokens(awaySlug));
  const n = urlTokens.length;
  for (let k = 1; k < n; k++) {
    if (urlTokens.slice(0, k).every((t) => home.has(t)) && urlTokens.slice(k).every((t) => away.has(t))) {
      return true;
    }
  }
  return false;
}

export function findRescheduled(
  urlDate: string,
  urlPair: string,
  candidates: RescheduleCandidate[],
  maxDays = 7
): string | null {
  const urlDay = dayNumber(urlDate);
  if (!Number.isFinite(urlDay)) return null;
  const urlTokens = distinctiveTokens(urlPair);
  if (urlTokens.length < 2) return null;

  let best: string | null = null;
  let bestDiff = Infinity;
  let tie = false;
  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.href)) continue;
    seen.add(c.href);
    // a própria URL (já deveria ter resolvido): nunca redirecionar pra ela mesma
    if (c.dateSlug === urlDate && `${c.homeSlug}-${c.awaySlug}` === urlPair) continue;
    const diff = Math.abs(dayNumber(c.dateSlug) - urlDay);
    if (!Number.isFinite(diff) || diff > maxDays) continue;
    if (!pairMatches(urlTokens, c.homeSlug, c.awaySlug)) continue;
    if (diff < bestDiff) {
      best = c.href;
      bestDiff = diff;
      tie = false;
    } else if (diff === bestDiff) {
      tie = true;
    }
  }
  return tie ? null : best;
}
