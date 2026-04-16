const DIRECT_BASE = "https://allsportsapi2.p.rapidapi.com/api";

async function fetchFromUrl<T>(
  url: string,
  headers: Record<string, string>,
  revalidate: number,
  label: string,
  maxRetries: number = 3
): Promise<{ ok: boolean; data: T | null }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, { headers, next: { revalidate } });

      if (res.status === 429 && attempt < maxRetries) {
        const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
        console.warn(`${label} 429 rate-limited, retry ${attempt + 1}/${maxRetries} em ${backoffMs}ms`);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      if (res.status >= 500) {
        console.error(`${label} 5xx: ${res.status}`);
        return { ok: false, data: null };
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        console.error(`${label} non-JSON: ${res.status} ${ct}`);
        return { ok: false, data: null };
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
        return { ok: false, data: null };
      }

      if (!res.ok && res.status !== 404) {
        console.error(`${label} ${res.status}`);
        return { ok: false, data: null };
      }

      return { ok: true, data: data as T };
    } catch (error) {
      console.error(`${label} fetch failed (attempt ${attempt}):`, error);
      if (attempt === maxRetries) return { ok: false, data: null };
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return { ok: false, data: null };
}

export async function fetchAllSports<T>(
  endpoint: string,
  revalidate: number = 1800
): Promise<T | null> {
  const proxyUrl = process.env.SPORTS_PROXY_URL;
  const proxyToken = process.env.SPORTS_PROXY_TOKEN;

  if (proxyUrl && proxyToken) {
    const result = await fetchFromUrl<T>(
      `${proxyUrl}/${endpoint}`,
      { "x-proxy-auth": proxyToken },
      revalidate,
      `SportsProxy[${endpoint}]`
    );
    if (result.ok) return result.data;
    console.warn(`SportsProxy failed, falling back to direct API: ${endpoint}`);
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
