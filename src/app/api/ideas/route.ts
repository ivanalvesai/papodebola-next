import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getIdeas, addIdea, updateIdea, deleteIdea } from "@/lib/data/ideas-store";
import type { Idea, IdeaColumn, IdeaPriority } from "@/lib/data/ideas-store";
import { unlink } from "fs/promises";
import { join } from "path";

// Apaga o arquivo de imagem do disco (libera espaço) — só imagens nossas.
async function cleanupImage(idea: Idea | undefined) {
  if (!idea?.image) return;
  const m = idea.image.match(/[?&]f=([\w.-]+)/);
  if (!m) return;
  await unlink(join(process.cwd(), "data", "ideas-images", m[1])).catch(() => {});
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  return NextResponse.json({ ideas: await getIdeas() });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      if (!body.title?.trim()) return NextResponse.json({ error: "Titulo obrigatorio" }, { status: 400 });
      const idea = await addIdea({
        title: String(body.title).trim(),
        notes: body.notes || "",
        area: body.area || "Geral",
        priority: (body.priority as IdeaPriority) || "media",
        column: (body.column as IdeaColumn) || "ideias",
        author: session.username || "",
      });
      return NextResponse.json({ idea });
    }

    if (action === "update") {
      const idea = await updateIdea(body.id, body.updates || {});
      if (!idea) return NextResponse.json({ error: "Ideia nao encontrada" }, { status: 404 });
      return NextResponse.json({ idea });
    }

    if (action === "move") {
      const idea = await updateIdea(body.id, { column: body.column as IdeaColumn });
      if (!idea) return NextResponse.json({ error: "Ideia nao encontrada" }, { status: 404 });
      return NextResponse.json({ idea });
    }

    if (action === "delete") {
      const idea = (await getIdeas()).find((i) => i.id === body.id);
      const ok = await deleteIdea(body.id);
      if (!ok) return NextResponse.json({ error: "Ideia nao encontrada" }, { status: 404 });
      await cleanupImage(idea);
      return NextResponse.json({ deleted: body.id });
    }

    // Limpa todos os concluidos de uma vez (apaga cards + imagens do disco).
    if (action === "clear-done") {
      const done = (await getIdeas()).filter((i) => i.column === "concluido");
      for (const idea of done) {
        await deleteIdea(idea.id);
        await cleanupImage(idea);
      }
      return NextResponse.json({ cleared: done.length });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
