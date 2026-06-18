import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { PautaCluster } from "@/lib/services/news-discovery";

// "Notícias quentes": histórico ROLANTE de assuntos de futebol descobertos pelo
// scan (a cada 30min). Cada assunto vive 2 dias a partir da 1ª aparição e depois
// é apagado. JSON no volume compartilhado (dev escreve via cron; prod só lê).
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "hot-news.json");

const RETENTION_MS = 48 * 60 * 60 * 1000; // 2 dias
const MAX_ITEMS_PER_TOPIC = 8;

export interface HotTopicSource {
  source: string;
  title: string;
  link: string;
}

export interface HotTopic {
  key: string;
  title: string;
  count: number; // nº de fontes (relevância)
  sources: string[];
  latest: string; // matéria mais recente (ISO)
  latestTimestamp: number;
  items: HotTopicSource[];
  firstSeen: number; // quando o assunto apareceu pela 1ª vez (define a expiração)
  lastSeen: number; // última varredura em que apareceu
}

async function readAll(): Promise<HotTopic[]> {
  try {
    const raw = await readFile(FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeAll(topics: HotTopic[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await writeFile(FILE, JSON.stringify(topics), "utf-8");
}

function prune(topics: HotTopic[], now: number): HotTopic[] {
  return topics.filter((t) => now - t.firstSeen <= RETENTION_MS);
}

function sortHot(topics: HotTopic[]): HotTopic[] {
  return [...topics].sort(
    (a, b) => b.count - a.count || b.latestTimestamp - a.latestTimestamp
  );
}

function sliceItems(c: PautaCluster): HotTopicSource[] {
  return c.items
    .slice(0, MAX_ITEMS_PER_TOPIC)
    .map((i) => ({ source: i.source, title: i.title, link: i.link }));
}

// Mescla os clusters recém-descobertos no histórico: assunto já visto tem
// firstSeen preservado (mantém a contagem regressiva dos 2 dias) e o resto
// atualizado; assunto novo entra com firstSeen=agora. Depois poda o que expirou.
export async function mergeHotNews(
  clusters: PautaCluster[],
  now: number
): Promise<{ added: number; updated: number; total: number }> {
  const existing = await readAll();
  const byKey = new Map(existing.map((t) => [t.key, t]));
  let added = 0;
  let updated = 0;

  for (const c of clusters) {
    const prev = byKey.get(c.key);
    if (prev) {
      prev.title = c.title;
      prev.count = Math.max(prev.count, c.count);
      prev.sources = Array.from(new Set([...prev.sources, ...c.sources]));
      prev.items = sliceItems(c);
      prev.latest = c.latest;
      prev.latestTimestamp = c.latestTimestamp;
      prev.lastSeen = now;
      updated++;
    } else {
      const t: HotTopic = {
        key: c.key,
        title: c.title,
        count: c.count,
        sources: c.sources,
        latest: c.latest,
        latestTimestamp: c.latestTimestamp,
        items: sliceItems(c),
        firstSeen: now,
        lastSeen: now,
      };
      byKey.set(c.key, t);
      added++;
    }
  }

  const merged = prune(Array.from(byKey.values()), now);
  await writeAll(sortHot(merged));
  return { added, updated, total: merged.length };
}

// Lê o histórico já podado e ordenado (pro painel).
export async function getHotNews(now: number = Date.now()): Promise<HotTopic[]> {
  return sortHot(prune(await readAll(), now));
}
