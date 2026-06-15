import { NextResponse } from "next/server";
import { addSub } from "@/lib/data/push-store";

// Pública: o usuário se inscreve nos alertas (vem da PushManager.subscribe).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sub = body?.subscription ?? body;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
    }
    await addSub({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      topics: Array.isArray(body?.topics) ? body.topics : undefined,
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "erro ao salvar" }, { status: 500 });
  }
}
