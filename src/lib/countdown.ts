// Contagem regressiva (bloco "countdown" das Páginas) — funções puras, sem React.

export interface CountdownParts {
  d: number;
  h: number;
  m: number;
  s: number;
}

// Quebra os milissegundos restantes em dias/horas/min/seg (arredonda pra baixo, nunca negativo).
export function splitCountdown(msLeft: number): CountdownParts {
  const total = Number.isFinite(msLeft) && msLeft > 0 ? Math.floor(msLeft / 1000) : 0;
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

// Próximo jogo do time: o de hoje, senão o primeiro dos próximos.
export function nextMatchFor<T>(data: { todayMatch: T | null; upcomingMatches: T[] } | null | undefined): T | null {
  if (!data) return null;
  return data.todayMatch ?? data.upcomingMatches?.[0] ?? null;
}
