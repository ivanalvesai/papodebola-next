import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "kanban-posts.json");

export type KanbanColumn = "sugestoes" | "edicao" | "aprovado" | "publicado";

export interface KanbanPost {
  id: string;
  title: string;
  text: string;
  image: string;
  category: string;
  source: string; // "rss-ia" | "manual" | "writer-ia"
  rssUrl: string;
  column: KanbanColumn;
  wpId: number | null;
  wpEditUrl: string;
  createdAt: string;
  updatedAt: string;
  // SEO fields (populated by writer agent)
  slug?: string;
  excerpt?: string;
  focusKeyword?: string;
  tags?: string[];
  htmlContent?: string;
  wordCount?: number;
  headingCount?: number;
}

async function ensureDir() {
  try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* exists */ }
}

export async function getPosts(): Promise<KanbanPost[]> {
  try {
    const data = await readFile(FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePosts(posts: KanbanPost[]): Promise<void> {
  await ensureDir();
  await writeFile(FILE, JSON.stringify(posts, null, 2));
}

export async function addPost(post: Omit<KanbanPost, "id" | "createdAt" | "updatedAt">): Promise<KanbanPost> {
  const posts = await getPosts();
  const newPost: KanbanPost = {
    ...post,
    id: `kp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  await savePosts(posts);
  return newPost;
}

export async function updatePost(id: string, updates: Partial<KanbanPost>): Promise<KanbanPost | null> {
  const posts = await getPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], ...updates, updatedAt: new Date().toISOString() };
  await savePosts(posts);
  return posts[idx];
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) return false;
  await savePosts(filtered);
  return true;
}

export async function movePost(id: string, column: KanbanColumn): Promise<KanbanPost | null> {
  return updatePost(id, { column });
}
