import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  convertHTMLToLexical,
  editorConfigFactory,
  EXPERIMENTAL_TableFeature,
} from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";

// Migra o corpo de um post do campo `body` (HTML/código) para o editor VISUAL Lexical
// (campo `content`), pra os editores conseguirem editar no /cms. Converte o HTML com o
// conversor oficial do Payload (inclui tabela via TableFeature) e limpa o `body`.
//   POST /api/payload-post-content?secret=XXX   body: { slug, html? }
// (html opcional: por padrão usa o body atual do post). Protegido por REVALIDATION_SECRET.
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const b = await request.json().catch(() => null);
  const slug = b?.slug;
  if (!slug) return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
  });
  const post = found.docs[0];
  if (!post) return NextResponse.json({ error: "post não encontrado" }, { status: 404 });

  const html = String(b?.html ?? (post as any).body ?? "").trim();
  if (!html) return NextResponse.json({ error: "sem HTML pra converter" }, { status: 400 });

  // Mesmas features do editor de `content` (defaultFeatures + tabela).
  const editorConfig = await editorConfigFactory.fromFeatures({
    config: payload.config,
    features: ({ defaultFeatures }: any) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  });
  const content = convertHTMLToLexical({ editorConfig, html, JSDOM });

  const doc = await payload.update({
    collection: "posts",
    id: post.id,
    draft: true,
    data: { content, body: "" } as any,
  });

  return NextResponse.json({
    ok: true,
    id: doc.id,
    slug: doc.slug,
    nodes: (content as any)?.root?.children?.length ?? 0,
  });
}
