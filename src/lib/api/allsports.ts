const API_BASE = "https://allsportsapi2.p.rapidapi.com/api";

export async function fetchAllSports<T>(
  endpoint: string,
  revalidate: number = 1800
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: {
        "x-rapidapi-key": process.env.ALLSPORTS_API_KEY!,
        "x-rapidapi-host": process.env.ALLSPORTS_API_HOST!,
      },
      next: { revalidate },
    });

    if (res.status >= 500) {
      console.error(`AllSportsApi 5xx: ${res.status} for ${endpoint}`);
      return null;
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      console.error(`AllSportsApi non-JSON: ${res.status} ${ct} for ${endpoint}`);
      return null;
    }

    const data = await res.json();

    if (data && typeof data === "object" && "message" in data && typeof data.message === "string" && /does not exist|not found|endpoint/i.test(data.message)) {
      console.error(`AllSportsApi endpoint invalido: ${endpoint} - ${data.message}`);
      return null;
    }

    if (!res.ok && res.status !== 404) {
      console.error(`AllSportsApi 4xx: ${res.status} for ${endpoint}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`AllSportsApi fetch failed: ${endpoint}`, error);
    return null;
  }
}

export async function fetchSport<T>(
  sport: string,
  endpoint: string,
  revalidate: number = 86400
): Promise<T | null> {
  return fetchAllSports<T>(`${sport}/${endpoint}`, revalidate);
}
