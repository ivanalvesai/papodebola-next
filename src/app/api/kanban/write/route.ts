import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getPosts, updatePost } from "@/lib/data/kanban-store";
import { writeArticle } from "@/lib/services/writer-agent";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { postId } = await request.json();
    if (!postId) return NextResponse.json({ error: "postId obrigatorio" }, { status: 400 });

    const posts = await getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });

    const result = await writeArticle(
      post.title,
      post.text,
      post.rssUrl,
      post.category,
    );

    const updated = await updatePost(postId, {
      title: result.title,
      text: result.text,
      category: result.category,
      source: "writer-ia",
      slug: result.slug,
      excerpt: result.excerpt,
      focusKeyword: result.focusKeyword,
      tags: result.tags,
      htmlContent: result.htmlContent,
      wordCount: result.wordCount,
      headingCount: result.headingCount,
    });

    return NextResponse.json({
      post: updated,
      seo: {
        slug: result.slug,
        excerpt: result.excerpt,
        focusKeyword: result.focusKeyword,
        category: result.category,
        tags: result.tags,
        wordCount: result.wordCount,
        headingCount: result.headingCount,
      },
      original: { title: post.title, text: post.text },
    });
  } catch (err) {
    console.error("[Writer Agent]", err);
    return NextResponse.json({ error: "Erro ao escrever artigo" }, { status: 500 });
  }
}
