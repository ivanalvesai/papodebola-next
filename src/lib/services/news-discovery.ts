import { createHash } from "crypto";

/**
 * Pipeline de DESCOBERTA de pautas (não publica nada).
 * Lê o Google News RSS (grátis, sem chave), limpa, deduplica e agrupa a MESMA
 * história reportada por várias fontes — pra alimentar sugestões de pauta no painel.
 * O artigo em si deve ser escrito original (writer-agent), nunca copiado do feed.
 */

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string; // ISO
  pubTimestamp: number; // ms
}

export interface PautaCluster {
  key: string; // hash canônico (dedup estável)
  title: string; // título representativo (o mais recente do cluster)
  count: number; // nº de fontes cobrindo (sinal de relevância)
  sources: string[];
  latest: string; // pubDate ISO mais recente
  latestTimestamp: number;
  items: NewsItem[]; // todas as matérias do cluster (com link pra fonte)
}

// Buscas padrão de futebol BR + mundo (usadas pelo scan automático e pela rota).
export const DEFAULT_QUERIES = [
  "futebol Brasil seleção",
  "Brasileirão",
  "Copa do Mundo seleção brasileira",
  "futebol Europa Champions League",
  "mercado da bola transferências",
];

const GN_BASE = "https://news.google.com/rss/search";

function buildUrl(query: string, lang: "pt-BR" | "en"): string {
  const locale =
    lang === "pt-BR" ? "hl=pt-BR&gl=BR&ceid=BR:pt-419" : "hl=en-US&gl=US&ceid=US:en";
  return `${GN_BASE}?q=${encodeURIComponent(query)}&${locale}`;
}

// Decodifica as entidades HTML que o Google News usa nos títulos.
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  if (!m) return "";
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).trim();
}

// O Google News sufixa o título com " - Fonte"; separamos.
function splitSource(rawTitle: string): { title: string; source?: string } {
  const idx = rawTitle.lastIndexOf(" - ");
  if (idx > 0 && idx > rawTitle.length - 60) {
    return { title: rawTitle.slice(0, idx).trim(), source: rawTitle.slice(idx + 3).trim() };
  }
  return { title: rawTitle.trim() };
}

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const b of blocks) {
    const rawTitle = tag(b, "title");
    if (!rawTitle) continue;
    const { title, source } = splitSource(rawTitle);
    const src = source || tag(b, "source") || "Fonte";
    const link = tag(b, "link");
    const pub = tag(b, "pubDate");
    const ts = pub ? Date.parse(pub) : 0;
    items.push({
      title,
      source: src,
      link,
      pubDate: ts ? new Date(ts).toISOString() : "",
      pubTimestamp: ts || 0,
    });
  }
  return items;
}

// Canonicaliza o título pra dedup: minúsculas, sem acento, só palavras.
function canonical(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set([
  "a","o","e","de","da","do","das","dos","em","no","na","nos","nas","com","para","por",
  "que","um","uma","os","as","ao","se","sua","seu","the","of","to","in","on","and","for",
]);
function tokens(title: string): Set<string> {
  return new Set(canonical(title).split(" ").filter((w) => w.length > 2 && !STOP.has(w)));
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

// Agrupa itens da MESMA história (forte sobreposição de palavras-chave no título).
function cluster(items: NewsItem[], threshold = 0.45): PautaCluster[] {
  // ordena do mais recente pro mais antigo → o representativo é o mais novo
  const sorted = [...items].sort((a, b) => b.pubTimestamp - a.pubTimestamp);
  const clusters: { rep: NewsItem; toks: Set<string>; items: NewsItem[] }[] = [];

  for (const it of sorted) {
    const tk = tokens(it.title);
    let best: { c: (typeof clusters)[number]; score: number } | null = null;
    for (const c of clusters) {
      const score = jaccard(tk, c.toks);
      if (score >= threshold && (!best || score > best.score)) best = { c, score };
    }
    if (best) best.c.items.push(it);
    else clusters.push({ rep: it, toks: tk, items: [it] });
  }

  return clusters
    .map((c) => {
      const sources = Array.from(new Set(c.items.map((i) => i.source)));
      const latest = c.items.reduce((m, i) => (i.pubTimestamp > m ? i.pubTimestamp : m), 0);
      return {
        key: createHash("sha1").update(canonical(c.rep.title)).digest("hex").slice(0, 12),
        title: c.rep.title,
        count: sources.length,
        sources,
        latest: latest ? new Date(latest).toISOString() : "",
        latestTimestamp: latest,
        items: c.items,
      };
    })
    // ranqueia: mais fontes (mais quente) e mais recente
    .sort((a, b) => b.count - a.count || b.latestTimestamp - a.latestTimestamp);
}

async function fetchQuery(query: string, lang: "pt-BR" | "en"): Promise<NewsItem[]> {
  try {
    const res = await fetch(buildUrl(query, lang), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PapoDeBolaBot/1.0)" },
      next: { revalidate: 600 }, // 10min: descoberta não precisa ser instantânea
    });
    if (!res.ok) return [];
    return parseRss(await res.text());
  } catch {
    return [];
  }
}

/**
 * Descobre pautas pra uma ou mais buscas. Junta os feeds, deduplica e agrupa.
 * @param queries termos de busca (ex: ["Neymar seleção", "Brasileirão"])
 * @param lang locale do Google News
 * @param maxClusters teto de pautas retornadas
 */
export async function discoverPautas(
  queries: string[],
  lang: "pt-BR" | "en" = "pt-BR",
  maxClusters = 30
): Promise<PautaCluster[]> {
  const all = (await Promise.all(queries.map((q) => fetchQuery(q, lang)))).flat();

  // dedup exato por link/título antes de clusterizar
  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const it of all) {
    const id = it.link || canonical(it.title);
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(it);
  }

  return cluster(unique).slice(0, maxClusters);
}
