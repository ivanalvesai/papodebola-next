// Recorte da tabela em volta de um time (radius linhas acima e abaixo), mantendo o
// tamanho fixo no topo/fundo. Time fora da tabela → [].
export function standingsWindow<T extends { teamId: number }>(rows: T[], teamId: number, radius: number): T[] {
  const i = rows.findIndex((r) => r.teamId === teamId);
  if (i < 0) return [];
  const size = radius * 2 + 1;
  const start = Math.max(0, Math.min(i - radius, rows.length - size));
  return rows.slice(start, start + size);
}
