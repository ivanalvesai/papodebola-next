import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { fetchWP } from "@/lib/api/wordpress";
import { cleanTag } from "@/lib/config";

// Importa posts do WordPress pro Payload (Fase 3b). Idempotente por wpId, paginado
// (chame ?page=1..N), baixa a capa pro media do Payload. Protegido por secret.
//   POST /api/payload-import-posts?secret=XXX&page=1&perPage=10
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/* eslint-disable @typescript-eslint/no-explicit-any */
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

let catMap: Record<number, string> | null = null;
let tagMap: Record<number, string> | null = null;
async function maps() {
  if (!catMap) {
    const c = await fetchWP<any[]>("categories?per_page=100&_fields=id,name", 0);
    catMap = Object.fromEntries((c || []).map((x: any) => [x.id, x.name]));
  }
  if (!tagMap) {
    const t = await fetchWP<any[]>("tags?per_page=100&_fields=id,name", 0);
    tagMap = Object.fromEntries((t || []).map((x: any) => [x.id, x.name]));
  }
  return { catMap: catMap!, tagMap: tagMap! };
}

async function uploadCover(payload: any, url: string, alt: string): Promise<number | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    let name = (url.split("/").pop() || "cover").split("?")[0];
    if (!/\.[a-z]{3,4}$/i.test(name)) name += ".jpg";
    const mimetype = r.headers.get("content-type") || "image/jpeg";
    const doc = await payload.create({
      collection: "media",
      data: { alt: (alt || name).slice(0, 120) },
      file: { data: buf, mimetype, name, size: buf.length },
    });
    return doc.id;
  } catch {
    return null;
  }
}

async function handle(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const perPage = parseInt(url.searchParams.get("perPage") || "10", 10);
  // recover=1: re-sobe a capa (apaga a antiga) pra converter pra WebP
  const recover = url.searchParams.get("recover") === "1";
  const { catMap, tagMap } = await maps();

  // order=asc: importa do mais antigo pro mais novo (cronológico)
  const posts = await fetchWP<any[]>(
    `posts?per_page=${perPage}&page=${page}&orderby=date&order=asc&_embed`,
    0
  );
  if (!posts || !posts.length) {
    return NextResponse.json({ ok: true, page, done: true, count: 0 });
  }

  const payload = await getPayload({ config });
  const results: any[] = [];
  for (const p of posts) {
    try {
      const title = stripHtml(p.title?.rendered || "");
      const slug = p.slug;
      const body = p.content?.rendered || "";
      const excerpt = stripHtml(p.excerpt?.rendered || "")
        .replace(/\[(?:…|\.\.\.)\]\s*$/, "")
        .trim();
      const category =
        (p.categories || []).map((id: number) => catMap[id]).filter(Boolean)[0] ||
        "Futebol brasileiro";
      const tags = (p.tags || [])
        .map((id: number) => cleanTag(tagMap[id] || ""))
        .filter(Boolean)
        .map((tag: string) => ({ tag }));
      const author = p._embedded?.author?.[0]?.name || "Redação";
      const publishedDate = p.date;
      const pdbLink = (p.meta?.pdb_link || "").trim();
      const media = p._embedded?.["wp:featuredmedia"]?.[0];

      const existing = await payload.find({
        collection: "posts",
        where: { wpId: { equals: p.id } },
        limit: 1,
        depth: 0,
        draft: true,
      });
      let cover: number | null = (existing.docs[0]?.cover as number) ?? null;
      if (recover && cover) {
        // apaga a media antiga (jpg) pra substituir pela WebP nova
        try {
          await payload.delete({ collection: "media", id: cover });
        } catch {
          /* ignora */
        }
        cover = null;
      }
      if (!cover && media?.source_url) cover = await uploadCover(payload, media.source_url, title);

      const data: any = {
        title,
        slug,
        category,
        tags,
        excerpt,
        body,
        author,
        publishedDate,
        pdbLink,
        seo: { metaTitle: title, metaDescription: excerpt },
        wpId: p.id,
        _status: "published",
      };
      if (cover) data.cover = cover;

      if (existing.docs[0]) {
        await payload.update({ collection: "posts", id: existing.docs[0].id, data });
        results.push({ wpId: p.id, slug, action: "updated" });
      } else {
        await payload.create({ collection: "posts", data });
        results.push({ wpId: p.id, slug, action: "created" });
      }
    } catch (e: any) {
      results.push({ wpId: p.id, error: String(e?.message || e).slice(0, 200) });
    }
  }

  return NextResponse.json({
    ok: true,
    page,
    count: results.length,
    created: results.filter((r) => r.action === "created").length,
    updated: results.filter((r) => r.action === "updated").length,
    errors: results.filter((r) => r.error),
  });
}

export const POST = handle;
export const GET = handle;
