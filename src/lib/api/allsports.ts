import { breakerOpen, readLastGood, recordResult, saveLastGood } from "./api-cache";
import { isSavableResponse, shouldDiskCache, shouldFallback } from "./cache-policy";

// Suporta as DUAS APIs, detectado pelo host (env ALLSPORTS_API_HOST):
//  - SportApi7 (Sofascore nativo): base /api/v1 + tradutor toSofascore.
//  - AllSportsApi antiga (allsportsapi2): base /api + caminhos originais (sem tradução).
// Assim, trocar entre elas é só mudar host+chave na env (sem mexer no código).
const ALLSPORTS_HOST = process.env.ALLSPORTS_API_HOST || "sportapi7.p.rapidapi.com";
const USE_SOFASCORE = ALLSPORTS_HOST.includes("sportapi7");
const DIRECT_BASE = `https://${ALLSPORTS_HOST}${USE_SOFASCORE ? "/api/v1" : "/api"}`;

function pad(n: string): string {
  return n.length === 1 ? "0" + n : n;
}

// Traduz o caminho estilo allsportsapi2 (que o resto do código usa) pro Sofascore
// /api/v1 (SportApi7). Mesmo schema de resposta, caminhos diferentes. Centralizado
// aqui pra não tocar nas ~15 funções de data. Ver docs da migração 22/06.
export function toSofascore(endpoint: string): string {
  const [rawPath, query] = endpoint.split("?");
  const q = query ? "?" + query : "";
  const path = rawPath.replace(/^\/+/, "");
  let m: RegExpMatchArray | null;

  // match/{id}/...  ->  event/{id}/...  (commentary -> comments)
  m = path.match(/^match\/(.+)$/);
  if (m) return `event/${m[1].replace(/\/commentary$/, "/comments")}${q}`;

  // matches/live -> sport/football/events/live
  if (path === "matches/live") return `sport/football/events/live${q}`;
  // matches/{d}/{m}/{y} e matches/top/{d}/{m}/{y} -> sport/football/scheduled-events/{YYYY-MM-DD}
  m = path.match(/^matches\/(?:top\/)?(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `sport/football/scheduled-events/${m[3]}-${pad(m[2])}-${pad(m[1])}${q}`;

  // tournament/... -> unique-tournament/...  (matches/round->events/round; statistics->top-players/overall)
  m = path.match(/^tournament\/(.+)$/);
  if (m) {
    const rest = m[1]
      .replace(/\/matches\/round\//, "/events/round/")
      .replace(/\/statistics$/, "/top-players/overall");
    return `unique-tournament/${rest}${q}`;
  }

  // team/{id}/matches/next|previous/{n} -> team/{id}/events/next|last/{n}
  m = path.match(/^team\/(\d+)\/matches\/(next|previous)\/(\d+)$/);
  if (m) return `team/${m[1]}/events/${m[2] === "previous" ? "last" : "next"}/${m[3]}${q}`;

  // {sport}/events|matches/live -> sport/{sport}/events/live
  m = path.match(/^([a-z-]+)\/(?:events|matches)\/live$/);
  if (m) return `sport/${m[1]}/events/live${q}`;
  // {sport}/events|matches/{d}/{m}/{y} -> sport/{sport}/scheduled-events/{YYYY-MM-DD}
  m = path.match(/^([a-z-]+)\/(?:events|matches)\/(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `sport/${m[1]}/scheduled-events/${m[4]}-${pad(m[3])}-${pad(m[2])}${q}`;

  // team/{id}/media, team/{id}/transfers e demais -> inalterado
  return `${path}${q}`;
}

const MAX_CONCURRENT = parseInt(process.env.ALLSPORTS_MAX_CONCURRENT || "2", 10);
let activeRequests = 0;
const waitQueue: (() => void)[] = [];

async function acquireSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT) {
    activeRequests++;
    return;
  }
  await new Promise<void>((resolve) => waitQueue.push(resolve));
  activeRequests++;
}

function releaseSlot(): void {
  activeRequests--;
  const next = waitQueue.shift();
  if (next) next();
}

// Throttle do log do disjuntor aberto (evita inundar os logs quando ~40 endpoints
// de uma página caem nele ao mesmo tempo — seja no corte de entrada, seja na fila
// do semáforo).
let lastBreakerLogAt = 0;
function logBreakerOpen(label: string): void {
  const now = Date.now();
  if (now - lastBreakerLogAt < 10_000) return;
  lastBreakerLogAt = now;
  console.warn(`API_BREAKER_OPEN ${label}`);
}

// reason: distingue "proxy respondeu erro (http)" de "proxy inacessível (unreachable)"
// de "disjuntor abriu enquanto esperava vaga no semáforo (breaker)".
// Só no caso "unreachable" o prod cai pro fetch direto — senão dobraria o hang num 429.
// status: código HTTP quando o servidor respondeu (classifica outage; no ok, um 404
// com corpo é renderizado mas não vira a última cópia boa no disco).
type FetchResult<T> = {
  ok: boolean;
  data: T | null;
  reason?: "http" | "unreachable" | "breaker";
  status?: number;
};

// Outage = falha que indica a API/proxy fora do ar (deve contar pro disjuntor):
// inacessível (DNS/conexão/timeout/abort) ou HTTP 401/403/429/5xx. Erros semânticos
// (404, endpoint deprecated com 404 text/plain, corpo "does not exist", outros 4xx)
// são permanentes pra aquele endpoint e não indicam outage — contam como NÃO-falha
// pro disjuntor (senão ele abriria sem nenhuma queda real da API).
function isOutage(result: FetchResult<unknown>): boolean {
  if (result.ok) return false;
  if (result.reason === "unreachable") return true;
  if (result.reason === "breaker") return false; // corte nosso, não resposta da API
  const s = result.status;
  return s === 401 || s === 403 || s === 429 || (s !== undefined && s >= 500);
}

// Retries de 429 com tempo TOTAL limitado: render nunca pendura.
// backoff: 300, 600, 1200ms (cap 1500) → ~2.1s no pior caso, não ~15s.
const MAX_RETRIES = 3;
const PER_FETCH_TIMEOUT_MS = 8000;

async function fetchFromUrl<T>(
  url: string,
  headers: Record<string, string>,
  revalidate: number,
  label: string,
  maxRetries: number = MAX_RETRIES
): Promise<FetchResult<T>> {
  await acquireSlot();
  try {
    // Re-checa o disjuntor DEPOIS de pegar a vaga: com ~40 endpoints disparados
    // juntos (Promise.all) e só 2 vagas no semáforo, todos passam pelo check de
    // entrada (fetchAllSports) antes de qualquer falha ser registrada — só as
    // primeiras chamadas de fato batem na rede e abrem o disjuntor; sem este
    // re-check, as ~35 que ficaram esperando vaga bateriam na rede uma a uma
    // mesmo depois de aberto (medido: 39.7s na 1ª leva vs 0.14s já com o disjuntor
    // quente). Não conta como falha nova — é um corte nosso, não resposta da API.
    if (breakerOpen(Date.now())) {
      logBreakerOpen(label);
      return { ok: false, data: null, reason: "breaker" };
    }
    return await fetchWithRetry<T>(url, headers, revalidate, label, maxRetries);
  } finally {
    releaseSlot();
  }
}

async function fetchWithRetry<T>(
  url: string,
  headers: Record<string, string>,
  revalidate: number,
  label: string,
  maxRetries: number
): Promise<FetchResult<T>> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // AbortSignal: aborta um socket pendurado (a API às vezes não responde).
      const res = await fetch(url, {
        headers,
        next: { revalidate },
        signal: AbortSignal.timeout(PER_FETCH_TIMEOUT_MS),
      });

      if (res.status === 429 && attempt < maxRetries) {
        const backoffMs = Math.min(1500, 300 * Math.pow(2, attempt)) + Math.floor(Math.random() * 200);
        console.warn(`${label} 429 rate-limited, retry ${attempt + 1}/${maxRetries} em ${backoffMs}ms`);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      // 429 esgotado OU 5xx: o servidor respondeu (http), não re-consulta direto.
      if (res.status === 429 || res.status >= 500) {
        console.error(`${label} ${res.status} (esgotado)`);
        return { ok: false, data: null, reason: "http", status: res.status };
      }

      if (res.status === 204) {
        return { ok: true, data: null, status: 204 };
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        console.error(`${label} non-JSON: ${res.status} ${ct}`);
        return { ok: false, data: null, reason: "http", status: res.status };
      }

      const data = await res.json();

      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string" &&
        /does not exist|not found|endpoint/i.test(data.message)
      ) {
        console.error(`${label} endpoint invalido: ${data.message}`);
        return { ok: false, data: null, reason: "http", status: res.status };
      }

      if (!res.ok && res.status !== 404) {
        console.error(`${label} ${res.status}`);
        return { ok: false, data: null, reason: "http", status: res.status };
      }

      return { ok: true, data: data as T, status: res.status };
    } catch (error) {
      const code = (error as { cause?: { code?: string }; code?: string })?.cause?.code
        ?? (error as { code?: string })?.code;
      const name = (error as { name?: string })?.name;
      // DNS/conexão recusada/timeout do socket = proxy/destino inacessível.
      if (code === "ENOTFOUND" || code === "ECONNREFUSED" || name === "TimeoutError" || name === "AbortError") {
        return { ok: false, data: null, reason: "unreachable" };
      }
      console.error(`${label} fetch failed (attempt ${attempt}):`, error);
      if (attempt === maxRetries) return { ok: false, data: null, reason: "unreachable" };
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return { ok: false, data: null, reason: "http" };
}

async function fetchAllSportsResult<T>(
  endpoint: string,
  revalidate: number = 1800
): Promise<{ ok: boolean; data: T | null; outage: boolean; skipped: boolean; status?: number }> {
  const proxyUrl = process.env.SPORTS_PROXY_URL;
  const proxyToken = process.env.SPORTS_PROXY_TOKEN;
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  // SportApi7: traduz pro formato Sofascore. AllSportsApi antiga: usa o caminho original.
  const sofa = USE_SOFASCORE ? toSofascore(endpoint) : endpoint;

  if (proxyUrl && proxyToken) {
    // Propaga o TTL pro proxy (senão ele cacheia 1800s fixos e o ao vivo trava).
    const sep = sofa.includes("?") ? "&" : "?";
    const result = await fetchFromUrl<T>(
      `${proxyUrl}/${sofa}${sep}_pdbttl=${revalidate}`,
      { "x-proxy-auth": proxyToken },
      revalidate,
      `SportsProxy[${sofa}]`
    );
    if (result.ok) return { ok: true, data: result.data, outage: false, skipped: false, status: result.status };

    // Disjuntor abriu enquanto essa chamada esperava vaga no semáforo: não é uma
    // falha nova (não recontar) e NÃO tenta o fetch direto — bater lá também
    // anularia o propósito do corte.
    if (result.reason === "breaker") return { ok: false, data: null, outage: false, skipped: true };

    if (isBuildPhase) {
      console.warn(`Build: proxy indisponivel (host.docker.internal nao resolve no builder), skip direct: ${endpoint}`);
      return { ok: false, data: null, outage: false, skipped: false };
    }
    // Só cai pro fetch DIRETO se o proxy (dev) estiver INACESSÍVEL. Se o proxy
    // respondeu erro (429/5xx), NÃO re-consulta direto: dobraria o hang e violaria
    // "só o dev consulta a API" (prod re-bateria no rapidapi e tomaria 429 também).
    // O cliente faz polling — a página renderiza com o que tiver.
    if (result.reason !== "unreachable") return { ok: false, data: null, outage: isOutage(result), skipped: false };
    console.warn(`SportsProxy unreachable, falling back to direct API: ${endpoint}`);
  }

  // No build SEM proxy (dev), pula o fetch direto: a AllSportsApi as vezes demora
  // >60s (ex: matches do dia ~17MB) e estoura o timeout do static generation,
  // quebrando o build inteiro. ISR popula em runtime no 1o acesso/revalidate.
  // (Prod ja pula porque o proxy nao resolve no builder — ver acima.)
  if (isBuildPhase) {
    console.warn(`Build: skip direct AllSports (dev), ISR popula em runtime: ${endpoint}`);
    return { ok: false, data: null, outage: false, skipped: false };
  }

  // Contador pra medir uso real (grep SPORTAPI_HIT nos logs por janela de tempo).
  console.log(`SPORTAPI_HIT ${sofa}`);
  const result = await fetchFromUrl<T>(
    `${DIRECT_BASE}/${sofa}`,
    {
      "x-rapidapi-key": process.env.ALLSPORTS_API_KEY!,
      "x-rapidapi-host": process.env.ALLSPORTS_API_HOST!,
    },
    revalidate,
    `SportApi7[${sofa}]`
  );
  if (result.reason === "breaker") return { ok: false, data: null, outage: false, skipped: true };
  return { ok: result.ok, data: result.data, outage: isOutage(result), skipped: false, status: result.status };
}

// Resultado com metadado: stale = o dado NÃO veio da API agora (cópia do disco no
// fallback, ou caminho do disjuntor aberto). Quem grava snapshot permanente (ex.:
// fetchMatchDetailLive) usa isso pra não congelar dado velho por cima de um bom.
export interface AllSportsMeta<T> {
  data: T | null;
  stale: boolean;
}

export async function fetchAllSports<T>(
  endpoint: string,
  revalidate: number = 1800
): Promise<T | null> {
  return (await fetchAllSportsMeta<T>(endpoint, revalidate)).data;
}

export async function fetchAllSportsMeta<T>(
  endpoint: string,
  revalidate: number = 1800
): Promise<AllSportsMeta<T>> {
  const now = Date.now();
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  // Disjuntor aberto: nem tenta a rede, vai direto pro fallback em disco (se o
  // endpoint aceitar dado velho) ou null. Sem isso, ~40 endpoints numa página
  // penduram um a um até cada timeout enquanto a API está fora. (Cobre a entrada;
  // o re-check dentro de fetchFromUrl cobre quem já estava esperando vaga no
  // semáforo quando o disjuntor abriu no meio da leva.)
  if (breakerOpen(now)) {
    logBreakerOpen(endpoint);
    const data = shouldFallback(false, revalidate, endpoint) ? await readLastGood<T>(endpoint) : null;
    return { data, stale: true };
  }

  const res = await fetchAllSportsResult<T>(endpoint, revalidate);
  // Build-phase skips e corte do disjuntor (skipped) não são falha nem sucesso
  // real da API — não contam pro disjuntor.
  if (!isBuildPhase && !res.skipped) recordResult(!res.outage, now);

  if (res.ok) {
    // Fora do disco: feeds /live, sub-endpoints de jogo (o snapshot do jogo cobre),
    // o "404 com corpo" do provedor e corpo com `error` (renderizam, mas não substituem
    // a última cópia boa).
    if (shouldDiskCache(endpoint) && isSavableResponse(res.status, res.data)) {
      void saveLastGood(endpoint, res.data);
    }
    return { data: res.data, stale: false };
  }
  if (!shouldFallback(res.ok, revalidate, endpoint)) return { data: null, stale: false };
  const stale = await readLastGood<T>(endpoint);
  if (stale != null) console.warn(`API_FALLBACK_DISK ${endpoint}`);
  return { data: stale, stale: stale != null };
}

export async function fetchSport<T>(
  sport: string,
  endpoint: string,
  revalidate: number = 86400
): Promise<T | null> {
  return fetchAllSports<T>(`${sport}/${endpoint}`, revalidate);
}
