// Onde a /v1 responde:
//  "api" = container papodebola-api (PDB_API_MODE=1), atrás do nginx que sobrescreve X-Real-IP.
//  "dev" = development em modo de teste (PDB_API_DEV=1): só chaves com IP "*" (a do parceiro não vale).
//  "off" = qualquer outro container (prod do site): /v1 dá 404. A porta do app é alcançável de fora,
//          então o IP de origem só é confiável no container da API.
export type ApiGate = "api" | "dev" | "off";

export function apiGate(env: Record<string, string | undefined>): ApiGate {
  if (env.PDB_API_MODE === "1") return "api";
  if (env.PDB_API_DEV === "1") return "dev";
  return "off";
}
