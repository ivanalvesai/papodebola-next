import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Valores editados dos textos do site, por id (ver registro em editable-content.ts).
// JSON no volume compartilhado (dev e prod). Id ausente/vazio = usa o default do
// registro (fallback). É só { [id]: texto }.
type Store = Record<string, string>;

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "editable-content.json");

export async function getEditableValues(): Promise<Store> {
  try {
    const raw = await readFile(FILE, "utf-8");
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? (data as Store) : {};
  } catch {
    return {};
  }
}

// Aplica um lote de edições. Texto vazio remove o id (volta ao default).
export async function setEditableValues(updates: Record<string, unknown>): Promise<void> {
  const all = await getEditableValues();
  for (const [id, raw] of Object.entries(updates)) {
    const text = typeof raw === "string" ? raw.trim() : "";
    if (text) all[id] = text;
    else delete all[id];
  }
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await writeFile(FILE, JSON.stringify(all, null, 2), "utf-8");
}
