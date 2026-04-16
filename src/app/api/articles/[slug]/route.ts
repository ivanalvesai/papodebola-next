import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/jwt";
import { getArticleBySlug } from "@/lib/data/articles";
import { updateWP, deleteWP } from "@/lib/api/wordpress";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, true);

  if (!article) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  const article = await getArticleBySlug(slug, true);

  if (!article || !article.wpId) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  try {
    const updates = await request.json();
    const wpUpdates: Record<string, unknown> = {};

    if (updates.title) wpUpdates.title = updates.title;
    if (updates.text) wpUpdates.content = updates.text;

    const result = await updateWP(`posts/${article.wpId}`, wpUpdates);

    if (!result) {
      return NextResponse.json(
        { error: "Erro ao atualizar no WordPress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ article: { ...article, ...updates } });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  const article = await getArticleBySlug(slug, true);

  if (!article || !article.wpId) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  const deleted = await deleteWP(`posts/${article.wpId}?force=true`);

  if (!deleted) {
    return NextResponse.json(
      { error: "Erro ao excluir do WordPress" },
      { status: 500 }
    );
  }

  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath(`/artigos/${slug}`);

  return NextResponse.json({ deleted: slug });
}
