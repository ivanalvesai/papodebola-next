/**
 * Image Sources: Wikimedia Commons + Pexels
 * Wikimedia: real player/team photos (CC licensed, with attribution)
 * Pexels: generic clean football/stadium photos (free, no attribution required)
 */

export interface SourceImage {
  id: string;
  title: string;
  url: string;         // full size
  thumbnail: string;   // preview
  author: string;
  license: string;
  credit: string;      // attribution text for the article
  source: "wikimedia" | "pexels";
}

// ==================== WIKIMEDIA COMMONS ====================

export async function searchWikimedia(query: string, limit: number = 20): Promise<SourceImage[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${query} football futebol`,
    gsrnamespace: "6", // File namespace only
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime",
    iiurlwidth: "800",
    format: "json",
    origin: "*",
  });

  try {
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": "PapoDeBola/1.0 (https://papodebola.com.br)" },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const pages = data.query?.pages || {};

    const images: SourceImage[] = [];
    for (const p of Object.values(pages) as Record<string, unknown>[]) {
      const info = ((p.imageinfo as Record<string, unknown>[]) || [{}])[0] || {};
      const mime = (info.mime as string) || "";
      if (!mime.startsWith("image/") || mime.includes("svg") || mime.includes("tiff")) continue;

      const meta = (info.extmetadata as Record<string, Record<string, string>>) || {};
      const artistHtml = meta.Artist?.value || "Desconhecido";
      const artist = artistHtml.replace(/<[^>]+>/g, "").trim().substring(0, 60);
      const license = meta.LicenseShortName?.value || "CC";
      const thumbUrl = (info.thumburl as string) || (info.url as string) || "";
      const fullUrl = (info.url as string) || thumbUrl;
      const title = ((p.title as string) || "").replace("File:", "").replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

      if (!thumbUrl) continue;

      images.push({
        id: `wm_${(p.pageid as number) || 0}`,
        title,
        url: fullUrl,
        thumbnail: thumbUrl,
        author: artist,
        license,
        credit: `Foto: Wikimedia Commons / ${artist} - ${license}`,
        source: "wikimedia",
      });
    }

    return images;
  } catch (err) {
    console.error("Wikimedia search error:", err);
    return [];
  }
}

// Search specifically for a player or team
export async function searchWikimediaPlayer(playerName: string): Promise<SourceImage[]> {
  return searchWikimedia(playerName, 15);
}

export async function searchWikimediaTeam(teamName: string): Promise<SourceImage[]> {
  return searchWikimedia(`${teamName} players team`, 20);
}

// ==================== PEXELS ====================

export async function searchPexels(query: string, limit: number = 20): Promise<SourceImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      query: `${query} football soccer`,
      per_page: String(limit),
      orientation: "landscape",
    });

    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.photos || []).map((p: Record<string, unknown>) => {
      const src = p.src as Record<string, string>;
      return {
        id: `px_${p.id}`,
        title: ((p.alt as string) || "Futebol").substring(0, 60),
        url: src?.large || src?.original || "",
        thumbnail: src?.medium || src?.small || "",
        author: (p.photographer as string) || "Pexels",
        license: "Pexels License",
        credit: `Foto: Pexels / ${(p.photographer as string) || ""}`,
        source: "pexels" as const,
      };
    });
  } catch (err) {
    console.error("Pexels search error:", err);
    return [];
  }
}
