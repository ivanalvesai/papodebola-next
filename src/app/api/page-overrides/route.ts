import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPageOverrides, setPageOverride } from "@/lib/data/page-overrides-store";

// Edição de textos/SEO por página (painel). Protegido pelo middleware (JWT).
export async function GET() {
  return NextResponse.json(await getAllPageOverrides(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const route = typeof body?.route === "string" ? body.route : "";
  if (!route.startsWith("/")) {
    return NextResponse.json({ error: "rota inválida" }, { status: 400 });
  }
  await setPageOverride(route, body.override || {});
  // revalida a rota afetada -> a mudança aparece no ar no próximo acesso
  try {
    revalidatePath(route);
  } catch {
    /* rota não estática: ignora */
  }
  return NextResponse.json({ ok: true });
}
