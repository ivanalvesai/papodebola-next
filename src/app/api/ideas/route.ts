import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getIdeas, addIdea, updateIdea, deleteIdea } from "@/lib/data/ideas-store";
import type { IdeaColumn, IdeaPriority } from "@/lib/data/ideas-store";

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
      const ok = await deleteIdea(body.id);
      if (!ok) return NextResponse.json({ error: "Ideia nao encontrada" }, { status: 404 });
      return NextResponse.json({ deleted: body.id });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
