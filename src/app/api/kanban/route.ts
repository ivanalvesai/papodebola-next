import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getPosts, addPost, updatePost, deletePost, movePost } from "@/lib/data/kanban-store";
import type { KanbanColumn } from "@/lib/data/kanban-store";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import { processImageForPublish } from "@/lib/services/image-optimizer";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const posts = await getPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const post = await addPost({
        title: body.title || "",
        text: body.text || "",
        image: body.image || "",
        category: body.category || "Futebol Brasileiro",
        source: body.source || "manual",
        rssUrl: body.rssUrl || "",
        column: (body.column as KanbanColumn) || "sugestoes",
        wpId: null,
        wpEditUrl: "",
      });
      return NextResponse.json({ post });
    }

    if (action === "update") {
      const post = await updatePost(body.id, body.updates || {});
      if (!post) return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });
      return NextResponse.json({ post });
    }

    if (action === "move") {
      const post = await movePost(body.id, body.column as KanbanColumn);
      if (!post) return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });
      return NextResponse.json({ post });
    }

    if (action === "delete") {
      const ok = await deletePost(body.id);
      if (!ok) return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });

      // Cleanup generated images
      try {
        const dir = join(process.cwd(), "data", "kanban-images");
        const files = await readdir(dir);
        for (const f of files) {
          if (f.startsWith(body.id)) {
            await unlink(join(dir, f)).catch(() => {});
          }
        }
      } catch { /* */ }

      return NextResponse.json({ deleted: body.id });
    }

    if (action === "publish") {
      const post = (await getPosts()).find((p) => p.id === body.id);
      if (!post) return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });

      const wpAuth = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString("base64");
      const slug = post.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);

      // 1. Optimize and upload image to WordPress
      let featuredMediaId = 0;
      if (post.image) {
        console.log(`[Publish] Processing image for: ${post.title.substring(0, 40)}`);
        const imageSource = post.image.startsWith("/api/")
          ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br"}${post.image}`
          : post.image;

        const imgResult = await processImageForPublish(
          imageSource, post.title, post.category, slug
        );

        if (imgResult?.wpMediaId) {
          featuredMediaId = imgResult.wpMediaId;
          console.log(`[Publish] Featured image: ${featuredMediaId} (${imgResult.altText})`);
        }
      }

      // 2. Publish post to WordPress
      const wpRes = await fetch(`${process.env.WP_BASE_URL}/posts`, {
        method: "POST",
        headers: { Authorization: `Basic ${wpAuth}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          content: post.text.split("\n\n").map((p) => `<p>${p}</p>`).join(""),
          status: "publish",
          featured_media: featuredMediaId || undefined,
        }),
      });

      if (!wpRes.ok) return NextResponse.json({ error: "Erro ao publicar no WordPress" }, { status: 500 });

      const wpData = await wpRes.json();
      const wpEditUrl = `https://admin.papodebola.com.br/wp-admin/post.php?post=${wpData.id}&action=edit`;

      // 3. Cleanup local AI images
      try {
        const dir = join(process.cwd(), "data", "kanban-images");
        const files = await readdir(dir);
        for (const f of files) {
          if (f.startsWith(post.id)) await unlink(join(dir, f)).catch(() => {});
        }
      } catch { /* */ }

      const updated = await updatePost(body.id, {
        column: "publicado",
        wpId: wpData.id,
        wpEditUrl,
      });

      return NextResponse.json({
        post: updated, wpId: wpData.id, wpEditUrl,
        imageOptimized: !!featuredMediaId,
      });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
