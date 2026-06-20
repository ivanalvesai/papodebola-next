import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Kanban PESSOAL — cada usuário (owner) tem seus próprios quadros/cards, isolados.
// Um quadro pode ser agrupado por "organização" e tem colunas customizáveis.
const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "personal-kanban.json");

export type CardPriority = "alta" | "media" | "baixa";

export interface BoardColumn {
  id: string;
  name: string;
}

export interface Board {
  id: string;
  owner: string;
  name: string;
  org: string; // organização/grupo (livre) — pra agrupar quadros
  color: string; // cor do quadro (chave da paleta)
  columns: BoardColumn[];
  createdAt: string;
}

export interface Card {
  id: string;
  boardId: string;
  owner: string;
  columnId: string;
  title: string;
  notes: string;
  image: string;
  priority: CardPriority;
  createdAt: string;
  updatedAt: string;
}

interface DB { boards: Board[]; cards: Card[]; }

function uid(p: string) { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`; }

async function ensureDir() { try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* */ } }

async function read(): Promise<DB> {
  try {
    const d = JSON.parse(await readFile(FILE, "utf-8"));
    return { boards: d.boards || [], cards: d.cards || [] };
  } catch {
    return { boards: [], cards: [] };
  }
}
async function write(db: DB) { await ensureDir(); await writeFile(FILE, JSON.stringify(db, null, 2)); }

// ---- leitura (escopo do dono) ----
export async function listForOwner(owner: string): Promise<{ boards: Board[]; cards: Card[] }> {
  const db = await read();
  return {
    boards: db.boards.filter((b) => b.owner === owner),
    cards: db.cards.filter((c) => c.owner === owner),
  };
}

function defaultColumns(): BoardColumn[] {
  return [
    { id: uid("col"), name: "A fazer" },
    { id: uid("col"), name: "Fazendo" },
    { id: uid("col"), name: "Concluido" },
  ];
}

// ---- quadros ----
export async function addBoard(owner: string, name: string, org: string, color: string): Promise<Board> {
  const db = await read();
  const board: Board = {
    id: uid("board"), owner, name: name.trim() || "Novo quadro",
    org: org.trim(), color: color || "green",
    columns: defaultColumns(), createdAt: new Date().toISOString(),
  };
  db.boards.unshift(board);
  await write(db);
  return board;
}

export async function patchBoard(owner: string, id: string, updates: Partial<Board>): Promise<Board | null> {
  const db = await read();
  const b = db.boards.find((x) => x.id === id && x.owner === owner);
  if (!b) return null;
  if (typeof updates.name === "string") b.name = updates.name;
  if (typeof updates.org === "string") b.org = updates.org;
  if (typeof updates.color === "string") b.color = updates.color;
  if (Array.isArray(updates.columns)) b.columns = updates.columns;
  await write(db);
  return b;
}

// Remove o quadro + seus cards. Retorna os cards removidos (pra limpar imagens).
export async function removeBoard(owner: string, id: string): Promise<Card[]> {
  const db = await read();
  const b = db.boards.find((x) => x.id === id && x.owner === owner);
  if (!b) return [];
  const removed = db.cards.filter((c) => c.boardId === id && c.owner === owner);
  db.boards = db.boards.filter((x) => x.id !== id);
  db.cards = db.cards.filter((c) => c.boardId !== id);
  await write(db);
  return removed;
}

// ---- cards ----
export async function addCard(owner: string, boardId: string, columnId: string, title: string): Promise<Card | null> {
  const db = await read();
  const board = db.boards.find((b) => b.id === boardId && b.owner === owner);
  if (!board) return null;
  const col = board.columns.find((c) => c.id === columnId) ? columnId : board.columns[0]?.id;
  if (!col) return null;
  const now = new Date().toISOString();
  const card: Card = {
    id: uid("card"), boardId, owner, columnId: col,
    title: title.trim() || "Sem titulo", notes: "", image: "", priority: "media",
    createdAt: now, updatedAt: now,
  };
  db.cards.unshift(card);
  await write(db);
  return card;
}

export async function patchCard(owner: string, id: string, updates: Partial<Card>): Promise<Card | null> {
  const db = await read();
  const c = db.cards.find((x) => x.id === id && x.owner === owner);
  if (!c) return null;
  if (typeof updates.title === "string") c.title = updates.title;
  if (typeof updates.notes === "string") c.notes = updates.notes;
  if (typeof updates.image === "string") c.image = updates.image;
  if (updates.priority) c.priority = updates.priority;
  if (typeof updates.columnId === "string") c.columnId = updates.columnId;
  c.updatedAt = new Date().toISOString();
  await write(db);
  return c;
}

export async function removeCard(owner: string, id: string): Promise<Card | null> {
  const db = await read();
  const c = db.cards.find((x) => x.id === id && x.owner === owner);
  if (!c) return null;
  db.cards = db.cards.filter((x) => x.id !== id);
  await write(db);
  return c;
}

// Remove todos os cards de uma coluna (ao deletar a coluna). Retorna os removidos.
export async function removeColumnCards(owner: string, boardId: string, columnId: string): Promise<Card[]> {
  const db = await read();
  const removed = db.cards.filter((c) => c.owner === owner && c.boardId === boardId && c.columnId === columnId);
  db.cards = db.cards.filter((c) => !(c.owner === owner && c.boardId === boardId && c.columnId === columnId));
  await write(db);
  return removed;
}
