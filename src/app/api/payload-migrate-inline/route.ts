import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Migra imagens INLINE do corpo dos posts (hospedadas no WP, wp-content) pro Payload:
// baixa, sobe no media e reescreve a URL no body. Rodar ANTES de desligar o WP.
// Protegido por secret. POST /api/payload-migrate-inline?secret=XXX
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function uploadFromUrl(payload: any, url: string, alt: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    let name = (url.split("/").pop() || "img").split("?")[0];
    if (!/\.[a-z]{3,4}$/i.test(name)) name += ".jpg";
    const m: any = await payload.create({
      collection: "media",
      data: { alt: alt.slice(0, 120) },
      file: { data: buf, mimetype: r.headers.get("content-type") || "image/jpeg", name, size: buf.length },
    });
    return m.url || null;
  } catch {
    return null;
  }
}

async function handle(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "posts",
    where: { or: [{ body: { like: "wp-content" } }, { body: { like: "admin.papodebola" } }] },
    limit: 200,
    depth: 0,
    draft: true,
  });

  const results: any[] = [];
  for (const post of res.docs as any[]) {
    let body: string = post.body || "";
    const urls = [...new Set(body.match(/https?:\/\/[^"' )]*wp-content[^"' )]*/g) || [])];
    let migrated = 0;
    for (const u of urls) {
      const newUrl = await uploadFromUrl(payload, u, post.title || "");
      if (newUrl) {
        body = body.split(u).join(newUrl);
        migrated++;
      }
    }
    if (migrated > 0) {
      await payload.update({ collection: "posts", id: post.id, data: { body, _status: "published" } });
    }
    results.push({ id: post.id, slug: post.slug, found: urls.length, migrated });
  }

  return NextResponse.json({ ok: true, posts: results.length, results });
}

export const POST = handle;
export const GET = handle;
