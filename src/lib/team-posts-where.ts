// Filtro Payload dos posts de um time: campo "Times" (relação, pelo id da API) OU os
// posts antigos sem o campo — tag com o nome do time ou o nome no título (frase exata:
// `contains`, não `like`, que casaria "São Paulo" com qualquer "Paulo").
export function teamPostsWhere(teamId: number, teamName: string): { or: Record<string, unknown>[] } {
  const name = teamName.trim();
  const or: Record<string, unknown>[] = [{ "teams.sofascoreId": { equals: teamId } }];
  if (name) or.push({ "tags.tag": { like: name } }, { title: { contains: name } });
  return { or };
}
