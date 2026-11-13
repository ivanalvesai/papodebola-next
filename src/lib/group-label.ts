// Rótulo do grupo a partir do nome da API:
// "UEFA Nations League 26/27, League A, Group 1" -> "Liga A · Grupo 1"
// "Brasileiro Serie D 2026, Group A1"            -> "Grupo A1"
// "UEFA Nations League, League A, Gr. 2"         -> "Liga A · Grupo 2" (match/{id})
// sem "Group" -> "" (tabela única: sem cabeçalho de grupo)
export function groupLabel(name: string): string {
  const g = name.match(/(?:Group\s+|Gr\.\s*)([A-Za-z]?\d+[A-Za-z]?)/i);
  if (!g) return "";
  const grupo = `Grupo ${g[1].toUpperCase()}`;
  const l = name.match(/League\s+([A-D])\b/i);
  return l ? `Liga ${l[1].toUpperCase()} · ${grupo}` : grupo;
}
