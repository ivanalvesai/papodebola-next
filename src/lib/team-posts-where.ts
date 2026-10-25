// Posts de um time. O filtro do banco é largo (relação "Times" pelo id da API OU tag OU
// título contendo o nome) e postMatchesTeam refina em JS: no título o nome tem que ser
// PALAVRA inteira (o `contains` do Payload é ILIKE %x%: "Sport" casava "SporTV") e nomes
// que também são palavras comuns só valem por relação/tag.
export function teamPostsWhere(teamId: number, teamName: string): { or: Record<string, unknown>[] } {
  const name = teamName.trim();
  const or: Record<string, unknown>[] = [{ "teams.sofascoreId": { equals: teamId } }];
  if (name) or.push({ "tags.tag": { like: name } }, { title: { contains: name } });
  return { or };
}

// Nomes de time que aparecem como palavra comum em manchete de futebol.
const AMBIGUOUS = new Set(["vitória", "internacional", "juventude", "américa", "athletic", "remo", "goiás", "ceará"]);

const RE_SPECIAL = new Set([..."\\^$.*+?()[]{}|/"]);
const escapeRe = (s: string) => [...s].map((c) => (RE_SPECIAL.has(c) ? `\\${c}` : c)).join("");

export function titleMentionsTeam(title: string, teamName: string): boolean {
  const name = teamName.trim();
  if (!name || AMBIGUOUS.has(name.toLowerCase())) return false;
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, "iu").test(title);
}

type PostLike = { title?: string | null; tags?: { tag?: string | null }[] | null; teams?: unknown[] | null };

export function postMatchesTeam(post: PostLike, teamId: number, teamName: string): boolean {
  const name = teamName.trim().toLowerCase();
  const byRelation = (post.teams || []).some(
    (t) => typeof t === "object" && t !== null && (t as { sofascoreId?: number }).sofascoreId === teamId
  );
  const byTag = !!name && (post.tags || []).some((t) => (t?.tag || "").trim().toLowerCase() === name);
  return byRelation || byTag || titleMentionsTeam(post.title || "", teamName);
}
