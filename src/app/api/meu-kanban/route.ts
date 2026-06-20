import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import {
  listForOwner, addBoard, patchBoard, removeBoard,
  addCard, patchCard, removeCard, removeColumnCards,
} from "@/lib/data/personal-kanban-store";
import type { Card } from "@/lib/data/personal-kanban-store";
import { unlink } from "fs/promises";
import { join } from "path";

async function cleanupImages(cards: Card[]) {
  for (const c of cards) {
    for (const img of c.images || []) {
      const m = img.match(/[?&]f=([\w.-]+)/);
      if (m) await unlink(join(process.cwd(), "data", "personal-kanban-images", m[1])).catch(() => {});
    }
  }
}

export async function GET() {
  const session = await getSession();
  if (!session?.username) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  return NextResponse.json(await listForOwner(session.username));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.username) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const owner = session.username;

  try {
    const body = await request.json();
    const { action } = body;

    // ---- quadros ----
    if (action === "create-board") {
      const board = await addBoard(owner, body.name || "", body.org || "", body.color || "green");
      return NextResponse.json({ board });
    }
    if (action === "update-board") {
      const board = await patchBoard(owner, body.id, body.updates || {});
      if (!board) return NextResponse.json({ error: "Quadro nao encontrado" }, { status: 404 });
      return NextResponse.json({ board });
    }
    if (action === "delete-board") {
      const removed = await removeBoard(owner, body.id);
      await cleanupImages(removed);
      return NextResponse.json({ deleted: body.id });
    }

    // ---- colunas (vivem dentro do board.columns) ----
    if (action === "delete-column") {
      const removed = await removeColumnCards(owner, body.boardId, body.columnId);
      await cleanupImages(removed);
      // a remocao da coluna em si vem como update-board (cliente manda columns novo)
      return NextResponse.json({ cleared: removed.length });
    }

    // ---- cards ----
    if (action === "create-card") {
      const card = await addCard(owner, body.boardId, body.columnId, body.title || "");
      if (!card) return NextResponse.json({ error: "Quadro/coluna invalido" }, { status: 404 });
      return NextResponse.json({ card });
    }
    if (action === "update-card") {
      const card = await patchCard(owner, body.id, (body.updates || {}) as Partial<Card>);
      if (!card) return NextResponse.json({ error: "Card nao encontrado" }, { status: 404 });
      return NextResponse.json({ card });
    }
    if (action === "move-card") {
      const card = await patchCard(owner, body.id, { columnId: body.columnId });
      if (!card) return NextResponse.json({ error: "Card nao encontrado" }, { status: 404 });
      return NextResponse.json({ card });
    }
    if (action === "delete-card") {
      const card = await removeCard(owner, body.id);
      if (!card) return NextResponse.json({ error: "Card nao encontrado" }, { status: 404 });
      await cleanupImages([card]);
      return NextResponse.json({ deleted: body.id });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
