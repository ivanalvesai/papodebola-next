// De onde buscar escudo/foto que não está no disco. No container da API (PDB_API_MODE=1) só com
// PDB_IMG_ORIGIN explícito (o dev): o padrão 127.0.0.1:3000 seria o próprio container, cujo
// /api/team-img chama a RapidAPI direto. Sem origem = 404 (falha fechada).
export function imageOrigin(env: Record<string, string | undefined>): string | null {
  if (env.PDB_IMG_ORIGIN) return env.PDB_IMG_ORIGIN;
  return env.PDB_API_MODE === "1" ? null : "http://127.0.0.1:3000";
}
