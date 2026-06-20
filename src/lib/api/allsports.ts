const DIRECT_BASE = "https://allsportsapi2.p.rapidapi.com/api";

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

// reason: distingue "proxy respondeu erro (http)" de "proxy inacessível (unreachable)".
// Só no segundo caso o prod cai pro fetch direto — senão dobraria o hang num 429.
type FetchResult<T> = { ok: boolean; data: T | null; reason?: "http" | "unreachable" };

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
        return { ok: false, data: null, reason: "http" };
      }

      if (res.status === 204) {
        return { ok: true, data: null };
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        console.error(`${label} non-JSON: ${res.status} ${ct}`);
        return { ok: false, data: null, reason: "http" };
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
        return { ok: false, data: null, reason: "http" };
      }

      if (!res.ok && res.status !== 404) {
        console.error(`${label} ${res.status}`);
        return { ok: false, data: null, reason: "http" };
      }

      return { ok: true, data: data as T };
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

export async function fetchAllSports<T>(
  endpoint: string,
  revalidate: number = 1800
): Promise<T | null> {
  const proxyUrl = process.env.SPORTS_PROXY_URL;
  const proxyToken = process.env.SPORTS_PROXY_TOKEN;
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  if (proxyUrl && proxyToken) {
    // Propaga o TTL pro proxy (senão ele cacheia 1800s fixos e o ao vivo trava).
    const sep = endpoint.includes("?") ? "&" : "?";
    const result = await fetchFromUrl<T>(
      `${proxyUrl}/${endpoint}${sep}_pdbttl=${revalidate}`,
      { "x-proxy-auth": proxyToken },
      revalidate,
      `SportsProxy[${endpoint}]`
    );
    if (result.ok) return result.data;

    if (isBuildPhase) {
      console.warn(`Build: proxy indisponivel (host.docker.internal nao resolve no builder), skip direct: ${endpoint}`);
      return null;
    }
    // Só cai pro fetch DIRETO se o proxy (dev) estiver INACESSÍVEL. Se o proxy
    // respondeu erro (429/5xx), NÃO re-consulta direto: dobraria o hang e violaria
    // "só o dev consulta a API" (prod re-bateria no rapidapi e tomaria 429 também).
    // O cliente faz polling — a página renderiza com o que tiver.
    if (result.reason !== "unreachable") return null;
    console.warn(`SportsProxy unreachable, falling back to direct API: ${endpoint}`);
  }

  // No build SEM proxy (dev), pula o fetch direto: a AllSportsApi as vezes demora
  // >60s (ex: matches do dia ~17MB) e estoura o timeout do static generation,
  // quebrando o build inteiro. ISR popula em runtime no 1o acesso/revalidate.
  // (Prod ja pula porque o proxy nao resolve no builder — ver acima.)
  if (isBuildPhase) {
    console.warn(`Build: skip direct AllSports (dev), ISR popula em runtime: ${endpoint}`);
    return null;
  }

  const result = await fetchFromUrl<T>(
    `${DIRECT_BASE}/${endpoint}`,
    {
      "x-rapidapi-key": process.env.ALLSPORTS_API_KEY!,
      "x-rapidapi-host": process.env.ALLSPORTS_API_HOST!,
    },
    revalidate,
    `AllSportsApi[${endpoint}]`
  );
  return result.data;
}

export async function fetchSport<T>(
  sport: string,
  endpoint: string,
  revalidate: number = 86400
): Promise<T | null> {
  return fetchAllSports<T>(`${sport}/${endpoint}`, revalidate);
}
