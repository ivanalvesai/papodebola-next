import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/jwt";
import { getArticles } from "@/lib/data/articles";
import { getPayload } from "payload";
import config from "@payload-config";
import { articleHref } from "@/lib/config";

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

  return NextResponse.json({ articles, total, page, pages: Math.ceil(total / limit) });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { title, text, image, category, author } = await request.json();
    if (!title || !text) {
      return NextResponse.json({ error: "Título e texto são obrigatórios" }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    const excerpt = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 155);

    // Capa opcional -> media do Payload
    let cover: number | null = null;
    if (image) {
      try {
        const src = image.startsWith("/")
          ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br"}${image}`
          : image;
        const r = await fetch(src);
        if (r.ok) {
          const buf = Buffer.from(await r.arrayBuffer());
          let name = (src.split("/").pop() || `${slug}.jpg`).split("?")[0];
          if (!/\.[a-z]{3,4}$/i.test(name)) name = `${slug}.jpg`;
          const m: any = await payload.create({
            collection: "media",
            data: { alt: title.slice(0, 120) },
            file: { data: buf, mimetype: r.headers.get("content-type") || "image/jpeg", name, size: buf.length },
          });
          cover = m.id;
        }
      } catch {
        /* sem capa */
      }
    }

    const data: Record<string, unknown> = {
      title,
      slug,
      body: text,
      excerpt,
      category: category || "Futebol brasileiro",
      author: author || session.username || "Redação",
      publishedDate: new Date().toISOString(),
      seo: { metaTitle: String(title).slice(0, 60), metaDescription: excerpt },
      _status: "published",
    };
    if (cover) data.cover = cover;

    const doc: any = await payload.create({ collection: "posts", data });

    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(articleHref(category || "Futebol brasileiro", slug));

    return NextResponse.json({
      article: {
        slug: doc.slug,
        title,
        category: category || "Futebol brasileiro",
        author: author || session.username,
        image: image || "",
        payloadId: doc.id,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao publicar no Payload" }, { status: 500 });
  }
}
