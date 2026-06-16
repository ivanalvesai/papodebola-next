import { NextResponse } from "next/server";
import { removeSub } from "@/lib/data/push-store";

// Pública: remove a assinatura (usuário desativou os alertas).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const endpoint = body?.endpoint ?? body?.subscription?.endpoint;
    if (!endpoint) {
      return NextResponse.json({ error: "endpoint ausente" }, { status: 400 });
    }
    await removeSub(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "erro ao remover" }, { status: 500 });
  }
}
