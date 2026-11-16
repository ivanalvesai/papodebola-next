// PDB_API_MODE=1 (container papodebola-api): se o proxy do dev estiver inacessível, NÃO consulta a
// RapidAPI direto — a camada de snapshot serve o disco. Só o dev fala com o fornecedor.
export function allowDirectFallback(env: Record<string, string | undefined>): boolean {
  return env.PDB_API_MODE !== "1";
}
