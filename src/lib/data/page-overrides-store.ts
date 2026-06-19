import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Overrides editáveis por rota (H1, meta title, meta description). Guardado em JSON
// no volume compartilhado (dev e prod veem o mesmo). Campo vazio = usa o default do
// código (fallback). Editado no painel; a página lê no server com fallback.
export interface PageOverride {
  h1?: string;
  metaTitle?: string;
  metaDescription?: string;
}

type Store = Record<string, PageOverride>;

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "page-overrides.json");

async function readAll(): Promise<Store> {
  try {
    const raw = await readFile(FILE, "utf-8");
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? (data as Store) : {};
  } catch {
    return {};
  }
}

async function writeAll(store: Store): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function getPageOverride(route: string): Promise<PageOverride> {
  const all = await readAll();
  return all[route] || {};
}

export async function getAllPageOverrides(): Promise<Store> {
  return readAll();
}

export async function setPageOverride(route: string, ov: PageOverride): Promise<void> {
  const all = await readAll();
  // só guarda campos preenchidos — vazio volta a usar o default do código
  const clean: PageOverride = {};
  if (ov.h1?.trim()) clean.h1 = ov.h1.trim();
  if (ov.metaTitle?.trim()) clean.metaTitle = ov.metaTitle.trim();
  if (ov.metaDescription?.trim()) clean.metaDescription = ov.metaDescription.trim();
  if (Object.keys(clean).length) all[route] = clean;
  else delete all[route];
  await writeAll(all);
}
