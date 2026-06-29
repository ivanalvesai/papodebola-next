import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Inspeção/recuperação de VERSÕES de um post (histórico do Payload). Protegido por secret.
//   GET  /api/payload-post-versions?secret=XXX&slug=...   -> lista versões (resumo)
//   POST /api/payload-post-versions?secret=XXX            body: { slug, versionId, stripTable? }
//        -> restaura o `content` daquela versão como rascunho atual (opcionalmente removendo
//           nós de tabela, que quebram o editor — EXPERIMENTAL_TableFeature).
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
function plainText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  const kids = node.children || node.root?.children || [];
  return kids.map(plainText).join(node.type === "paragraph" || node.type === "heading" || node.type?.startsWith("list") ? " " : "");
}
function hasType(node: any, type: string): boolean {
  if (!node) return false;
  if (node.type === type) return true;
  const kids = node.children || node.root?.children || [];
  return kids.some((k: any) => hasType(k, type));
}
function stripType(node: any, type: string): any {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node.children)) {
    node.children = node.children.filter((k: any) => k?.type !== type).map((k: any) => stripType(k, type));
  }
  if (node.root) node.root = stripType(node.root, type);
  return node;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.REVALIDATION_SECRET)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });

  const payload = await getPayload({ config });
  const post = (await payload.find({ collection: "posts", where: { slug: { equals: slug } }, limit: 1, draft: true })).docs[0];
  if (!post) return NextResponse.json({ error: "post não encontrado" }, { status: 404 });

  const versions = await payload.findVersions({
    collection: "posts",
    where: { parent: { equals: post.id } },
    limit: 30,
    sort: "-updatedAt",
    depth: 0,
  });

  const list = versions.docs.map((v: any) => {
    const c = v.version?.content;
    const txt = c ? plainText(c).replace(/\s+/g, " ").trim() : "";
    return {
      versionId: v.id,
      updatedAt: v.updatedAt,
      status: v.version?._status,
      chars: txt.length,
      hasTable: c ? hasType(c, "table") : false,
      hasImage: c ? hasType(c, "upload") : false,
      bodyLen: (v.version?.body || "").length,
      excerpt: txt.slice(0, 240),
    };
  });
  return NextResponse.json({ postId: post.id, count: list.length, versions: list });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.REVALIDATION_SECRET)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await request.json().catch(() => null);
  const { slug, versionId, stripTable } = b || {};
  if (!slug || !versionId) return NextResponse.json({ error: "slug e versionId obrigatórios" }, { status: 400 });

  const payload = await getPayload({ config });
  const post = (await payload.find({ collection: "posts", where: { slug: { equals: slug } }, limit: 1, draft: true })).docs[0];
  if (!post) return NextResponse.json({ error: "post não encontrado" }, { status: 404 });

  const ver = await payload.findVersionByID({ collection: "posts", id: versionId, depth: 0 });
  let content = (ver as any)?.version?.content;
  if (!content) return NextResponse.json({ error: "versão sem content" }, { status: 400 });
  if (stripTable) content = stripType(JSON.parse(JSON.stringify(content)), "table");

  const doc = await payload.update({ collection: "posts", id: post.id, draft: true, data: { content } as any });
  return NextResponse.json({ ok: true, id: doc.id, restoredFrom: versionId, strippedTable: !!stripTable });
}
