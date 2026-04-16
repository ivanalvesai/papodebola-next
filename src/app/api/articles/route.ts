import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getArticles } from "@/lib/data/articles";
import { postWP } from "@/lib/api/wordpress";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("cat") || undefined;
  const search = searchParams.get("search") || undefined;

  const { articles, total } = await getArticles({
    page,
    perPage: limit,
    category,
    search,
    noCache: true,
  });

  return NextResponse.json({
    articles,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { title, text, image, category, author } = await request.json();

    if (!title || !text) {
      return NextResponse.json(
        { error: "Título e texto são obrigatórios" },
        { status: 400 }
      );
    }

    // Publish to WordPress
    const wpPost = await postWP<{ id: number; slug: string }>("posts", {
      title,
      content: text,
      status: "publish",
      categories: [],
      featured_media: 0,
    });

    if (!wpPost) {
      return NextResponse.json(
        { error: "Erro ao publicar no WordPress" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      article: {
        slug: wpPost.slug,
        title,
        category: category || "Futebol Brasileiro",
        author: author || session.username,
        image: image || "",
        wpId: wpPost.id,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
