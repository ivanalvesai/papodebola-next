import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      const wpBase = process.env.WP_BASE_URL;
      const slug = post.slug || post.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);

      // 1. Resolve WordPress category ID
      let wpCategoryId: number | null = null;
      if (post.category) {
        try {
          const catRes = await fetch(
            `${wpBase}/categories?search=${encodeURIComponent(post.category)}&per_page=5`,
            { headers: { Authorization: `Basic ${wpAuth}` } },
          );
          if (catRes.ok) {
            const cats = await catRes.json();
            const exact = cats.find((c: { name: string }) =>
              c.name.toLowerCase() === post.category.toLowerCase()
            );
            if (exact) {
              wpCategoryId = exact.id;
            } else if (cats.length > 0) {
              wpCategoryId = cats[0].id;
            }
          }
        } catch { /* use default */ }
      }

      // 2. Resolve WordPress tag IDs (create if needed)
      const wpTagIds: number[] = [];
      if (post.tags && post.tags.length > 0) {
        for (const tagName of post.tags) {
          try {
            // Search existing tag
            const tagRes = await fetch(
              `${wpBase}/tags?search=${encodeURIComponent(tagName)}&per_page=5`,
              { headers: { Authorization: `Basic ${wpAuth}` } },
            );
            if (tagRes.ok) {
              const existingTags = await tagRes.json();
              const exact = existingTags.find((t: { name: string }) =>
                t.name.toLowerCase() === tagName.toLowerCase()
              );
              if (exact) {
                wpTagIds.push(exact.id);
                continue;
              }
            }
            // Create new tag
            const createRes = await fetch(`${wpBase}/tags`, {
              method: "POST",
              headers: { Authorization: `Basic ${wpAuth}`, "Content-Type": "application/json" },
              body: JSON.stringify({ name: tagName }),
            });
            if (createRes.ok) {
              const newTag = await createRes.json();
              wpTagIds.push(newTag.id);
            }
          } catch { /* skip tag */ }
        }
      }

      // 3. Optimize and upload image to WordPress
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

      // 4. Publish post to WordPress with full SEO fields
      // Use htmlContent (with TOC, H2s, internal links) if available, otherwise basic paragraphs
      const content = post.htmlContent
        || post.text.split("\n\n").map((p) => `<p>${p}</p>`).join("");

      const seoTitle = post.title.length > 60
        ? post.title.substring(0, 57) + "..."
        : post.title;

      const wpBody: Record<string, unknown> = {
        title: post.title,
        slug,
        content,
        excerpt: post.excerpt || post.text.substring(0, 155),
        status: "publish",
        featured_media: featuredMediaId || undefined,
        categories: wpCategoryId ? [wpCategoryId] : [],
        tags: wpTagIds.length > 0 ? wpTagIds : [],
        // Rank Math SEO fields (requires Rank Math REST API enabled)
        meta: {
          rank_math_focus_keyword: post.focusKeyword || "",
          rank_math_description: post.excerpt || post.text.substring(0, 155),
          rank_math_title: seoTitle,
          rank_math_rich_snippet: "article",
          rank_math_snippet_article_type: "NewsArticle",
          rank_math_robots: ["index", "follow", "max-snippet:-1", "max-image-preview:large"],
          rank_math_facebook_title: seoTitle,
          rank_math_facebook_description: post.excerpt || post.text.substring(0, 155),
          rank_math_twitter_use_facebook: "on",
        },
      };

      console.log(`[Publish] SEO: keyword="${post.focusKeyword}", cat=${wpCategoryId}, tags=${wpTagIds.join(",")}, slug=${slug}`);

      const wpRes = await fetch(`${wpBase}/posts`, {
        method: "POST",
        headers: { Authorization: `Basic ${wpAuth}`, "Content-Type": "application/json" },
        body: JSON.stringify(wpBody),
      });

      if (!wpRes.ok) {
        const errText = await wpRes.text().catch(() => "");
        console.error(`[Publish] WordPress error: ${wpRes.status}`, errText);
        return NextResponse.json({ error: "Erro ao publicar no WordPress" }, { status: 500 });
      }

      const wpData = await wpRes.json();
      const wpEditUrl = `https://admin.papodebola.com.br/wp-admin/post.php?post=${wpData.id}&action=edit`;

      // 5. Cleanup local AI images
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

      // 6. Revalidate homepage and news so the article appears immediately
      const wpSlug = wpData.slug || slug;
      revalidatePath("/");
      revalidatePath("/noticias");
      if (wpSlug) revalidatePath(`/artigos/${wpSlug}`);

      return NextResponse.json({
        post: updated, wpId: wpData.id, wpEditUrl,
        imageOptimized: !!featuredMediaId,
        seo: {
          slug: wpSlug,
          categoryId: wpCategoryId,
          tagIds: wpTagIds,
          focusKeyword: post.focusKeyword,
          excerpt: post.excerpt,
        },
      });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
