import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Agenda a PUBLICAÇÃO de um post (rascunho) para uma data/hora, via o Scheduled Publish
// nativo do Payload (task "schedulePublish" na fila de jobs). O cron do prod bate em
// /cms-api/payload-jobs/run 1x/min e publica quando wait_until <= agora.
//   POST /api/payload-schedule-publish?secret=XXX   body: { slug, at }  (at = ISO, ex.
//   "2026-07-03T03:01:00.000Z" = 00:01 de Brasília). Protegido por REVALIDATION_SECRET.
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const b = await req.json().catch(() => null);
  const slug = b?.slug;
  const at = b?.at;
  if (!slug || !at) return NextResponse.json({ error: "slug e at são obrigatórios" }, { status: 400 });

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    draft: true,
  });
  const post = found.docs[0];
  if (!post) return NextResponse.json({ error: "post não encontrado" }, { status: 404 });

  const job = await payload.jobs.queue({
    task: "schedulePublish" as any,
    input: { type: "publish", doc: { relationTo: "posts", value: (post as any).id } } as any,
    waitUntil: new Date(at),
  } as any);

  return NextResponse.json({ ok: true, postId: (post as any).id, jobId: (job as any)?.id, at });
}
