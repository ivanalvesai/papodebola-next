import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getPosts, addPost, updatePost, deletePost, movePost } from "@/lib/data/kanban-store";
import type { KanbanColumn } from "@/lib/data/kanban-store";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import { getPayload } from "payload";
import config from "@payload-config";

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

      const payload = await getPayload({ config });
      const slug =
        post.slug ||
        post.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 60);

      // Corpo: htmlContent (com TOC, H2s, links internos) ou par\u00e1grafos do texto
      const content =
        post.htmlContent || post.text.split("\n\n").map((p) => `<p>${p}</p>`).join("");
      const excerpt = post.excerpt || post.text.substring(0, 155);

      // Capa -> media do Payload (volume compartilhado)
      let cover: number | null = null;
      if (post.image) {
        try {
          const src = post.image.startsWith("/")
            ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br"}${post.image}`
            : post.image;
          const r = await fetch(src);
          if (r.ok) {
            const buf = Buffer.from(await r.arrayBuffer());
            let name = (src.split("/").pop() || `${slug}.jpg`).split("?")[0];
            if (!/\.[a-z]{3,4}$/i.test(name)) name = `${slug}.jpg`;
            const mimetype = r.headers.get("content-type") || "image/jpeg";
            const m = await payload.create({
              collection: "media",
              data: { alt: post.title.slice(0, 120) },
              file: { data: buf, mimetype, name, size: buf.length },
            });
            cover = m.id as number;
          }
        } catch {
          /* publica sem capa */
        }
      }

      const data: Record<string, unknown> = {
        title: post.title,
        slug,
        category: post.category || "Futebol brasileiro",
        tags: (post.tags || []).map((tag) => ({ tag })),
        excerpt,
        body: content,
        author: session.username || "Reda\u00e7\u00e3o",
        publishedDate: new Date().toISOString(),
        seo: { metaTitle: post.title.slice(0, 60), metaDescription: excerpt },
        // Vai como RASCUNHO: as tratativas finais e a publicação são feitas no /cms
        // (Payload), não direto pelo Studio.
        _status: "draft",
      };
      if (cover) data.cover = cover;

      let doc: any;
      try {
        doc = await payload.create({ collection: "posts", data });
      } catch (e) {
        console.error("[Publish] Payload error", e);
        return NextResponse.json({ error: "Erro ao publicar no Payload" }, { status: 500 });
      }

      // Cleanup das imagens locais de IA
      try {
        const dir = join(process.cwd(), "data", "kanban-images");
        const files = await readdir(dir);
        for (const f of files) {
          if (f.startsWith(post.id)) await unlink(join(dir, f)).catch(() => {});
        }
      } catch {
        /* */
      }

      // wpId guarda o id do post no Payload; wpEditUrl aponta pro editor do /cms,
      // onde o rascunho recebe as tratativas finais e \u00e9 publicado manualmente.
      const cmsEditUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br"
      }/cms/collections/posts/${doc.id}`;
      const updated = await updatePost(body.id, {
        column: "publicado",
        wpId: doc.id,
        wpEditUrl: cmsEditUrl,
      });

      // Sem revalida\u00e7\u00e3o: \u00e9 RASCUNHO, n\u00e3o aparece no site at\u00e9 publicar no /cms.

      return NextResponse.json({ post: updated, payloadId: doc.id, slug, wpEditUrl: cmsEditUrl });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
