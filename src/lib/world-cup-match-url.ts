import { selecaoSlugById } from "@/lib/selecoes";

// Helpers PUROS de URL do jogo da Copa (sem imports de servidor) — seguros de
// usar tanto em server quanto em client components.

// timestamp (s) -> "DD-MM-YYYY" no fuso de Brasília (UTC-3 fixo).
export function matchDateSlug(timestamp: number): string {
  const d = new Date((timestamp - 3 * 3600) * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}-${p(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;
}

// slug do confronto: "{casa}-{fora}" (ex: "mexico-africa-do-sul")
export function matchPairSlug(
  homeId: number,
  awayId: number,
  homeName?: string,
  awayName?: string
): string {
  return `${selecaoSlugById(homeId, homeName)}-${selecaoSlugById(awayId, awayName)}`;
}

// href completo da página do jogo
export function worldCupMatchHref(
  timestamp: number,
  homeId: number,
  awayId: number,
  homeName?: string,
  awayName?: string
): string {
  return `/futebol/copa-do-mundo/jogo/${matchDateSlug(timestamp)}/${matchPairSlug(
    homeId,
    awayId,
    homeName,
    awayName
  )}`;
}
