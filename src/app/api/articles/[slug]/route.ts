import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/jwt";
import { getArticleBySlug } from "@/lib/data/articles";
import { getPayload } from "payload";
import config from "@payload-config";
import { articleHref } from "@/lib/config";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function findPostId(payload: any, slug: string): Promise<number | null> {
  const res = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
  });
  return (res.docs[0]?.id as number) ?? null;
}

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
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { slug } = await params;
  try {
    const payload = await getPayload({ config });
    const id = await findPostId(payload, slug);
    if (!id) return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });

    const updates = await request.json();
    const data: Record<string, unknown> = {};
    if (updates.title) data.title = updates.title;
    if (updates.text) data.body = updates.text;
    if (updates.excerpt) data.excerpt = updates.excerpt;
    if (updates.category) data.category = updates.category;

    const doc: any = await payload.update({ collection: "posts", id, data });
    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(articleHref(doc.category || "", doc.slug || slug));

    return NextResponse.json({ article: { slug: doc.slug, title: doc.title } });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar no Payload" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { slug } = await params;
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
    });
    const doc: any = res.docs[0];
    if (!doc) return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });

    await payload.delete({ collection: "posts", id: doc.id });
    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(articleHref(doc.category || "", slug));

    return NextResponse.json({ deleted: slug });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir do Payload" }, { status: 500 });
  }
}
