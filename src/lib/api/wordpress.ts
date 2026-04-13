const WP_BASE = process.env.WP_BASE_URL || "https://admin.papodebola.com.br/wp-json/wp/v2";

function getAuthHeader(): string {
  const user = process.env.WP_USER || "";
  const pass = process.env.WP_APP_PASSWORD || "";
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

export async function fetchWP<T>(
  endpoint: string,
  revalidate: number = 1800
): Promise<T | null> {
  try {
    const res = await fetch(`${WP_BASE}/${endpoint}`, {
      headers: {
        Authorization: getAuthHeader(),
      },
      next: { revalidate },
    });

    if (!res.ok) {
      console.error(`WordPress API error: ${res.status} for ${endpoint}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`WordPress API fetch failed: ${endpoint}`, error);
    return null;
  }
}

export async function postWP<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T | null> {
  try {
    const res = await fetch(`${WP_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`WordPress POST error: ${res.status} for ${endpoint}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`WordPress POST failed: ${endpoint}`, error);
    return null;
  }
}

export async function updateWP<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T | null> {
  try {
    const res = await fetch(`${WP_BASE}/${endpoint}`, {
      method: "PUT",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`WordPress PUT error: ${res.status} for ${endpoint}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`WordPress PUT failed: ${endpoint}`, error);
    return null;
  }
}

export async function deleteWP(endpoint: string): Promise<boolean> {
  try {
    const res = await fetch(`${WP_BASE}/${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    return res.ok;
  } catch (error) {
    console.error(`WordPress DELETE failed: ${endpoint}`, error);
    return false;
  }
}
