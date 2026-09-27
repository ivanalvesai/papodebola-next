// Regras PURAS do cache em disco da API esportiva (data/api-cache). Sem import de
// módulo de servidor: testadas com `node --test --experimental-strip-types` e usadas
// por fetchAllSports (allsports.ts) e pela limpeza da rotina /api/archive/run.

// Abaixo disso o endpoint é tratado como ao vivo: dado velho engana mais do que vazio.
export const LIVE_TTL_LIMIT = 60;

// Caminho sem query e sem barras nas pontas: "/matches/live?x=1" -> "matches/live".
function endpointPath(endpoint: string): string {
  return endpoint.split("?")[0].replace(/^\/+/, "").replace(/\/+$/, "");
}

// Feed ao vivo (matches/live, {sport}/matches/live, tennis/events/live...): o caminho
// termina em /live. Chamado com revalidate 60/300 em alguns lugares, então o TTL
// sozinho não o identifica (incidente de 16/07: "ao vivo" congelado servido do disco).
export function isLiveEndpoint(endpoint: string): boolean {
  return /(^|\/)live$/.test(endpointPath(endpoint));
}

// Sub-endpoints de jogo (match/{id}/incidents|lineups|statistics|commentary|...): já
// ficam no snapshot do jogo (data/snapshots/matches) e eram ~90% dos arquivos do cache.
// O match/{id} em si continua no cache.
export function isMatchSubEndpoint(endpoint: string): boolean {
  return /^match\/\d+\/.+/.test(endpointPath(endpoint));
}

// O endpoint entra no cache em disco (grava e serve de lá)?
export function shouldDiskCache(endpoint: string): boolean {
  return !isLiveEndpoint(endpoint) && !isMatchSubEndpoint(endpoint);
}

// Serve do disco só quando a API falhou, o TTL não é de ao vivo e o endpoint é cacheável.
export function shouldFallback(ok: boolean, revalidate: number, endpoint: string): boolean {
  return !ok && revalidate >= LIVE_TTL_LIMIT && shouldDiskCache(endpoint);
}

// Resposta "ok" que pode virar a última cópia boa: nunca null, nunca o "404 com corpo"
// do provedor (renderiza, mas não substitui o dado bom) nem corpo com chave `error`.
export function isSavableResponse(status: number | undefined, data: unknown): boolean {
  if (data == null) return false;
  if (status === 404) return false;
  if (typeof data === "object" && !Array.isArray(data) && "error" in (data as object)) return false;
  return true;
}
