import { NextResponse } from "next/server";
import { sendToAll } from "@/lib/services/push";

// Protegida pelo middleware (JWT do painel). Dispara um push pra todos os
// inscritos. Uso manual/teste agora; na Fase 2 entra o disparo automático de gol.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const text = String(body?.body || "").trim();
    if (!title || !text) {
      return NextResponse.json({ error: "title e body são obrigatórios" }, { status: 400 });
    }
    const result = await sendToAll({
      title,
      body: text,
      url: body?.url || "/",
      tag: body?.tag,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error)?.message || "erro ao enviar" },
      { status: 500 }
    );
  }
}
