// Placar de um evento da API (Sofascore). `current` SOMA os pênaltis da disputa (um 0x1 decidido
// por 5x3 nos pênaltis vira "5 x 4"); `display` é o placar do jogo sem eles. Usar sempre estes
// helpers ao normalizar homeScore/awayScore (bug visto em 18/11: Palmeiras x Fluminense, Libertadores).
type RawScore = { current?: number | null; display?: number | null; penalties?: number | null } | null | undefined;

export function scoreOf(s: RawScore): number | null {
  // A API às vezes manda display negativo (Blumenau x São Luiz, Série D: display -1 com current 2
  // e 3 pênaltis); nesse caso o current já vem sem os pênaltis.
  const d = s?.display;
  if (typeof d === "number" && d >= 0) return d;
  return s?.current ?? null;
}

export function pensOf(s: RawScore): number | null {
  return typeof s?.penalties === "number" ? s.penalties : null;
}
