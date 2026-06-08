const CBF_BASE = "https://gweb.cbf.com.br/api/site/v1";

export async function fetchCBF<T>(
  endpoint: string,
  revalidate: number = 43200
): Promise<T | null> {
  // Nao bloquear o build com fetch da CBF (respostas de ~2-3MB podem estourar o
  // timeout do static generation). ISR popula em runtime no 1o acesso/revalidate.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }

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
