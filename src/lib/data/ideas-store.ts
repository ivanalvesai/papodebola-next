import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Mural de Ideias do Studio — anotações/pendências do site que vão sendo movidas
// até concluir. Arquivo no volume compartilhado (dev e prod veem o mesmo).
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "ideas.json");

export type IdeaColumn = "ideias" | "priorizado" | "fazendo" | "concluido";
export type IdeaPriority = "alta" | "media" | "baixa";

export interface Idea {
  id: string;
  title: string;
  notes: string;
  image: string; // URL da foto colada (/api/ideas/image?f=...) — opcional
  area: string; // SEO | Conteúdo | Performance | UX | Bug | Copa | Tênis | Geral
  priority: IdeaPriority;
  column: IdeaColumn;
  author: string; // quem criou (do login)
  createdAt: string;
  updatedAt: string;
}

async function ensureDir() {
  try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* exists */ }
}

export async function getIdeas(): Promise<Idea[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function save(ideas: Idea[]): Promise<void> {
  await ensureDir();
  await writeFile(FILE, JSON.stringify(ideas, null, 2));
}

export async function addIdea(
  data: Pick<Idea, "title"> & Partial<Omit<Idea, "id" | "createdAt" | "updatedAt">>
): Promise<Idea> {
  const ideas = await getIdeas();
  const now = new Date().toISOString();
  const idea: Idea = {
    id: `idea_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    title: data.title,
    notes: data.notes || "",
    image: data.image || "",
    area: data.area || "Geral",
    priority: data.priority || "media",
    column: data.column || "ideias",
    author: data.author || "",
    createdAt: now,
    updatedAt: now,
  };
  ideas.unshift(idea);
  await save(ideas);
  return idea;
}

export async function updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | null> {
  const ideas = await getIdeas();
  const idx = ideas.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  // protege campos imutáveis
  const { id: _i, createdAt: _c, ...safe } = updates;
  ideas[idx] = { ...ideas[idx], ...safe, updatedAt: new Date().toISOString() };
  await save(ideas);
  return ideas[idx];
}

export async function deleteIdea(id: string): Promise<boolean> {
  const ideas = await getIdeas();
  const filtered = ideas.filter((i) => i.id !== id);
  if (filtered.length === ideas.length) return false;
  await save(filtered);
  return true;
}
