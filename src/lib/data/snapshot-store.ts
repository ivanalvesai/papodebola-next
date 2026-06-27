import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";

// Snapshots DURÁVEIS dos dados esportivos no volume compartilhado
// (data/snapshots/{categoria}/{chave}.json). Servem de fallback quando a API parar
// de servir o torneio — assim as páginas (tabela, chaveamento, lance a lance) NUNCA
// mais caem pra "indisponível" depois que o campeonato acaba.

const SNAP_DIR = join(process.cwd(), "data", "snapshots");
const safeKey = (k: string | number) => String(k).replace(/[^a-z0-9_-]/gi, "_").slice(0, 120);

export async function saveSnapshot(category: string, key: string | number, data: unknown): Promise<void> {
  try {
    const file = join(SNAP_DIR, category, `${safeKey(key)}.json`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data));
  } catch {
    /* disco cheio/ro: não derruba o render */
  }
}

export async function readSnapshot<T>(category: string, key: string | number): Promise<T | null> {
  try {
    const file = join(SNAP_DIR, category, `${safeKey(key)}.json`);
    return JSON.parse(await readFile(file, "utf-8")) as T;
  } catch {
    return null;
  }
}

// Busca ao vivo; se vier dado REAL, salva o snapshot e retorna. Senão, serve o último
// snapshot salvo (ou o próprio resultado se não houver snapshot). É o que mantém a
// página viva depois que a API parar de servir. O save é fire-and-forget (o server do
// Next é um processo persistente, então a escrita conclui sem segurar o render).
export async function withSnapshot<T>(
  category: string,
  key: string | number,
  fetcher: () => Promise<T | null>,
  isReal: (d: T) => boolean
): Promise<T | null> {
  let live: T | null = null;
  try {
    live = await fetcher();
  } catch {
    live = null;
  }
  if (live != null && isReal(live)) {
    void saveSnapshot(category, key, live);
    return live;
  }
  const snap = await readSnapshot<T>(category, key);
  return snap ?? live;
}
