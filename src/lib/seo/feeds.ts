// Builders puros do feed RSS (/feed.xml) e do sitemap de notícias (/news-sitemap.xml).
export type FeedItem = { title: string; url: string; description?: string; date: string; image?: string };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const validDate = (s: string) => !Number.isNaN(Date.parse(s));

export function buildRss(items: FeedItem[], site: { title: string; url: string; description: string }): string {
  const body = items
    .map(
      (i) =>
        `<item><title>${esc(i.title)}</title><link>${esc(i.url)}</link><guid isPermaLink="true">${esc(i.url)}</guid>` +
        (validDate(i.date) ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : "") +
        (i.description ? `<description>${esc(i.description)}</description>` : "") +
        (i.image ? `<enclosure url="${esc(i.image)}" type="image/webp" length="0"/>` : "") +
        `</item>`
    )
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>` +
    `<title>${esc(site.title)}</title><link>${esc(site.url)}</link><description>${esc(site.description)}</description>` +
    `<language>pt-BR</language><atom:link href="${esc(site.url)}/feed.xml" rel="self" type="application/rss+xml"/>` +
    `${body}</channel></rss>`
  );
}

export function buildNewsSitemap(items: FeedItem[], nowMs: number, publication: string): string {
  const urls = items
    .filter((i) => validDate(i.date) && nowMs - Date.parse(i.date) <= 48 * 3600 * 1000)
    .map(
      (i) =>
        `<url><loc>${esc(i.url)}</loc><news:news><news:publication><news:name>${esc(publication)}</news:name>` +
        `<news:language>pt</news:language></news:publication>` +
        `<news:publication_date>${new Date(i.date).toISOString()}</news:publication_date>` +
        `<news:title>${esc(i.title)}</news:title></news:news></url>`
    )
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`
  );
}
