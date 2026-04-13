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

    if (!res.ok) {
      console.error(
        `AllSportsApi error: ${res.status} for ${endpoint}`
      );
      return null;
    }

    return res.json();
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
