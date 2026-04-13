const CBF_BASE = "https://gweb.cbf.com.br/api/site/v1";

export async function fetchCBF<T>(
  endpoint: string,
  revalidate: number = 43200
): Promise<T | null> {
  try {
    const res = await fetch(`${CBF_BASE}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${process.env.CBF_TOKEN}`,
      },
      next: { revalidate },
    });

    if (!res.ok) {
      console.error(`CBF API error: ${res.status} for ${endpoint}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`CBF API fetch failed: ${endpoint}`, error);
    return null;
  }
}
