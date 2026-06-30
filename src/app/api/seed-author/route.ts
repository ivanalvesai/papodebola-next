import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// TEMPORÁRIA: cria/atualiza um autor de exemplo (collection `authors`) e liga ao post
// do Paraguai (authorProfile) pra validar a cadeia: página /autor/{slug} + byline linkável.
// Protegida por REVALIDATION_SECRET. REMOVER depois de validar.
//   GET/POST /api/seed-author?secret=XXX
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
const txt = (text: string, format = 0): any => ({
  type: "text",
  version: 1,
  detail: 0,
  format,
  mode: "normal",
  style: "",
  text,
});
const para = (...nodes: any[]): any => ({
  type: "paragraph",
  version: 1,
  format: "",
  indent: 0,
  direction: "ltr",
  textFormat: 0,
  children: nodes,
});
const richDoc = (...paras: any[]): any => ({
  root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children: paras },
});

const AUTHOR = {
  name: "Ivan Alves",
  slug: "ivan-alves",
  role: "Cofundador e editor",
  bio: richDoc(
    para(
      txt(
        "Cofundador do Papo de Bola, acompanha futebol brasileiro e mundial de perto há mais de 15 anos. "
      ),
      txt("Profissional de TI e marketing digital", 1),
      txt(
        ", reconstruiu o portal com tecnologia moderna e foco em dados em tempo real, cobertura de campeonatos e do futebol de várzea."
      )
    )
  ),
  social: { email: "contato@papodebola.com.br" },
  seo: {
    metaTitle: "Ivan Alves — Cofundador e editor | Papo de Bola",
    metaDescription:
      "Perfil e artigos de Ivan Alves, cofundador e editor do Papo de Bola. Cobertura de futebol brasileiro e mundial.",
  },
  _status: "published",
};

async function handle(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const payload = await getPayload({ config });

  // upsert do autor por slug
  const existing = await payload.find({
    collection: "authors",
    where: { slug: { equals: AUTHOR.slug } },
    limit: 1,
    draft: true,
  });
  let author;
  if (existing.docs[0]) {
    author = await payload.update({ collection: "authors", id: existing.docs[0].id, data: AUTHOR as any });
  } else {
    author = await payload.create({ collection: "authors", data: AUTHOR as any });
  }

  // liga o post do Paraguai a esse autor (byline linkável). Mantém o post como está (draft).
  let linkedPost: any = null;
  const post = await payload.find({
    collection: "posts",
    where: { slug: { equals: "paraguai-x-alemanha-penaltis-copa-do-mundo-2026" } },
    limit: 1,
    draft: true,
  });
  if (post.docs[0]) {
    linkedPost = await payload.update({
      collection: "posts",
      id: post.docs[0].id,
      draft: true,
      data: { authorProfile: author.id } as any,
    });
  }

  return NextResponse.json({
    ok: true,
    author: { id: author.id, slug: (author as any).slug, status: (author as any)._status },
    linkedPost: linkedPost ? { id: linkedPost.id, slug: linkedPost.slug } : null,
    page: `/autor/${(author as any).slug}`,
  });
}

export const POST = handle;
export const GET = handle;
