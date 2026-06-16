import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// IDs dos jogos da Copa que já tiveram push de "começou" — pra não avisar 2x.
// No volume de dados (sobrevive a restart/rebuild).
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "push-kickoffs.json");

async function readIds(): Promise<number[]> {
  try {
    const raw = await readFile(FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function wasNotified(id: number): Promise<boolean> {
  return (await readIds()).includes(id);
}

export async function markNotified(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const cur = await readIds();
  const set = new Set(cur);
  for (const id of ids) set.add(id);
  // mantém os últimos 500 (a Copa tem ~104 jogos; folga de sobra)
  const next = [...set].slice(-500);
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await writeFile(FILE, JSON.stringify(next), "utf-8");
}

export async function getNotifiedSet(): Promise<Set<number>> {
  return new Set(await readIds());
}
