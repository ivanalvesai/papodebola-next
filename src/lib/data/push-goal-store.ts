import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Maior total de gols já visto por jogo (highwater) — pra detectar GOL novo e
// não re-disparar quando o placar oscila (inconsistência do provedor: 1→0→1).
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "push-scores.json");

export type MaxTotals = Record<string, number>; // matchId -> maior (home+away) visto

export async function getMaxTotals(): Promise<MaxTotals> {
  try {
    const raw = await readFile(FILE, "utf-8");
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export async function saveMaxTotals(map: MaxTotals): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await writeFile(FILE, JSON.stringify(map), "utf-8");
}
