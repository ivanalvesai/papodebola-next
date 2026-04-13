import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { addPost } from "@/lib/data/kanban-store";

// RSS feeds to fetch
const RSS_FEEDS = [
  "https://www.torcedores.com/feed",
  "https://www.terra.com.br/esportes/futebol/rss.xml",
  "https://trivela.com.br/feed/",
  "https://feeds.bbci.co.uk/sport/football/rss.xml",
  "https://www.theguardian.com/football/rss",
];

function extractItems(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = [];
  const itemBlocks = xml.split(/<item[\s>]/);

  for (let i = 1; i < Math.min(itemBlocks.length, 6); i++) {
    const block = itemBlocks[i];
    const titleM = block.match(/<title[^>]*>(?:<!\[CDATA\[)?\s*([\s\S]*?)\s*(?:\]\]>)?<\/title>/);
    const linkM = block.match(/<link[^>]*>\s*([\s\S]*?)\s*<\/link>/);
    const descM = block.match(/<description[^>]*>(?:<!\[CDATA\[)?\s*([\s\S]*?)\s*(?:\]\]>)?<\/description>/);

    if (titleM) {
      items.push({
        title: titleM[1].replace(/<[^>]+>/g, "").trim(),
        link: linkM?.[1]?.replace(/<[^>]+>/g, "").trim() || "",
        description: (descM?.[1] || "").replace(/<[^>]+>/g, "").trim().substring(0, 300),
      });
    }
  }
  return items;
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const suggestions: { title: string; link: string; description: string; feed: string }[] = [];

    // Fetch from RSS feeds
    for (const feedUrl of RSS_FEEDS) {
      try {
        const res = await fetch(feedUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) continue;
        const xml = await res.text();
        const items = extractItems(xml);
        for (const item of items.slice(0, 3)) {
          suggestions.push({ ...item, feed: feedUrl });
        }
      } catch {
        // Skip failed feeds
      }
    }

    if (suggestions.length === 0) {
      return NextResponse.json({ error: "Nenhuma sugestao encontrada nos feeds RSS" }, { status: 404 });
    }

    // Pick 5 random suggestions
    const shuffled = suggestions.sort(() => Math.random() - 0.5).slice(0, 5);

    const created = [];
    for (const s of shuffled) {
      const post = await addPost({
        title: s.title,
        text: s.description,
        image: "",
        category: s.feed.includes("bbc") || s.feed.includes("guardian") ? "Futebol Internacional" : "Futebol Brasileiro",
        source: "rss-ia",
        rssUrl: s.link,
        column: "sugestoes",
        wpId: null,
        wpEditUrl: "",
      });
      created.push(post);
    }

    return NextResponse.json({ created, count: created.length });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar sugestoes" }, { status: 500 });
  }
}
