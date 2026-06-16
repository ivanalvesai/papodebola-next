import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Armazena as assinaturas de web push no volume de dados (compartilhado entre
// dev e prod). Simples (JSON), suficiente pro volume esperado.
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "push-subscriptions.json");

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  topics?: string[]; // futuro: alertas por time/competição
  createdAt: number;
}

async function readAll(): Promise<PushSub[]> {
  try {
    const raw = await readFile(FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeAll(subs: PushSub[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await writeFile(FILE, JSON.stringify(subs), "utf-8");
}

export async function addSub(sub: PushSub): Promise<void> {
  const subs = await readAll();
  const i = subs.findIndex((s) => s.endpoint === sub.endpoint);
  if (i >= 0) subs[i] = { ...subs[i], ...sub };
  else subs.push(sub);
  await writeAll(subs);
}

export async function removeSub(endpoint: string): Promise<void> {
  const subs = await readAll();
  const next = subs.filter((s) => s.endpoint !== endpoint);
  if (next.length !== subs.length) await writeAll(next);
}

export async function getSubs(): Promise<PushSub[]> {
  return readAll();
}

export async function countSubs(): Promise<number> {
  return (await readAll()).length;
}
