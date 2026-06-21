import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Seeder de POSTS (notícias) pro Payload via API local (sem login do CMS). Cria/atualiza
// um Post por slug (idempotente). Protegido por REVALIDATION_SECRET. Nasce como RASCUNHO
// (_status:"draft") por padrão — a capa e a publicação ficam pro editor no /cms.
//   POST /api/payload-seed-post?secret=XXX   body: { title, slug, category, excerpt, body, tags[], author, seo, status }
// Mesma família do /api/payload-seed (páginas). Postgres é compartilhado dev/prod.
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let b: any;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { title, slug, category, excerpt, body, tags, author, publishedDate, seo, status } = b;
  if (!title || !slug || !body) {
    return NextResponse.json({ error: "title, slug e body são obrigatórios" }, { status: 400 });
  }

  const payload = await getPayload({ config });

  const data: Record<string, unknown> = {
    title,
    slug,
    category: category || "Futebol brasileiro",
    excerpt: excerpt || "",
    body,
    author: author || "Redação",
    publishedDate: publishedDate || new Date().toISOString(),
    tags: Array.isArray(tags) ? tags.map((tg: string) => ({ tag: tg })) : [],
    seo: seo || {},
    _status: status === "published" ? "published" : "draft",
  };

  const existing = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
  });

  let doc: any;
  if (existing.docs[0]) {
    doc = await payload.update({ collection: "posts", id: existing.docs[0].id, data, draft: true });
  } else {
    doc = await payload.create({ collection: "posts", data, draft: true });
  }

  return NextResponse.json({ ok: true, id: doc.id, slug: doc.slug, status: doc._status });
}
