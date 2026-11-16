import type { MatchLive } from "@/lib/data/match-detail";

// /v1/jogos/{id}/ao-vivo: jogo encerrado (ou feed ao vivo que falhou) sai do getMatchDetail, que
// tem snapshot protegido. getMatchLive não tem: um 429 em incidents viraria "lances: []" por 24 h.
export function preferSnapshot(live: Pick<MatchLive, "event"> | null): boolean {
  return !live || live.event.statusType === "finished";
}
