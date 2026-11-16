import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

type Day = Record<string, { total: number; rotas: Record<string, number>; ultimo: string }>;
const DIR = join(process.env.PDB_API_STATE_DIR || join(process.cwd(), "data-api"), "usage");
// Estado no globalThis (uma cópia por processo, mesmo que o Next carregue o módulo por rota).
const g = globalThis as unknown as { __pdbApiUsage?: { pending: Map<string, Day>; timer: ReturnType<typeof setInterval> | null } };
g.__pdbApiUsage ??= { pending: new Map(), timer: null };
const pending = g.__pdbApiUsage.pending; // data → uso ainda não gravado

const today = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export function recordUsage(keyId: string, route: string): void {
  const d = today();
  const day = pending.get(d) ?? {};
  const k = (day[keyId] ??= { total: 0, rotas: {}, ultimo: "" });
  k.total++;
  k.rotas[route] = (k.rotas[route] || 0) + 1;
  k.ultimo = new Date().toISOString();
  pending.set(d, day);
  if (!g.__pdbApiUsage!.timer) { const t = setInterval(() => void flush(), 60_000); t.unref?.(); g.__pdbApiUsage!.timer = t; }
}

async function flush(): Promise<void> {
  for (const [d, delta] of [...pending]) {
    pending.delete(d);
    try {
      await mkdir(DIR, { recursive: true });
      const file = join(DIR, `${d}.json`);
      let cur: Day = {};
      try { cur = JSON.parse(await readFile(file, "utf-8")); } catch { /* novo dia */ }
      for (const [id, v] of Object.entries(delta)) {
        const c = (cur[id] ??= { total: 0, rotas: {}, ultimo: "" });
        c.total += v.total;
        for (const [r, n] of Object.entries(v.rotas)) c.rotas[r] = (c.rotas[r] || 0) + n;
        c.ultimo = v.ultimo;
      }
      await writeFile(file, JSON.stringify(cur));
    } catch { /* volume ro (dev): uso não é registrado, não derruba nada */ }
  }
}

export async function readUsage(days: number): Promise<Record<string, Day>> {
  const out: Record<string, Day> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - 3 * 3600_000 - i * 86400_000).toISOString().slice(0, 10);
    try { out[d] = JSON.parse(await readFile(join(DIR, `${d}.json`), "utf-8")); } catch { /* sem uso */ }
  }
  return out;
}
