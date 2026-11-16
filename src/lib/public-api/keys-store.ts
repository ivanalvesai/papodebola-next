import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { ApiKeyRecord } from "./keys.ts";

// Chaves da API pública no volume compartilhado. O painel do dev grava; o container da API só lê.
const FILE = join(process.cwd(), "data", "api-keys.json");
let cache: { at: number; list: ApiKeyRecord[] } | null = null;

export async function loadKeys(): Promise<ApiKeyRecord[]> {
  if (cache && Date.now() - cache.at < 30_000) return cache.list;
  let list: ApiKeyRecord[] = [];
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf-8"));
    if (Array.isArray(parsed)) list = parsed.filter((r) => r && typeof r.hash === "string" && Array.isArray(r.ipsPermitidos));
  } catch {
    list = []; // ausente/corrompido: falha fechada (todas as chamadas 401)
  }
  cache = { at: Date.now(), list };
  return list;
}

export async function saveKeys(list: ApiKeyRecord[]): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2));
  await rename(tmp, FILE);
  cache = null;
}
