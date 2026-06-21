import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getEditableValues, setEditableValues } from "@/lib/data/editable-content-store";
import { EDITABLE } from "@/lib/data/editable-content";

// Edição de textos/SEO por id (painel "Páginas"). Protegido pelo middleware (JWT).
export async function GET() {
  return NextResponse.json(await getEditableValues(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const updates = body?.updates;
  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ error: "sem updates" }, { status: 400 });
  }
  await setEditableValues(updates as Record<string, unknown>);
  // revalida as páginas afetadas (deriva do registro) → muda no ar na hora
  const pages = new Set<string>();
  let global = false;
  for (const id of Object.keys(updates)) {
    const def = EDITABLE[id];
    if (!def) continue;
    if (def.scope === "global") global = true; // afeta título/schema de todas as páginas
    else if (def.page) pages.add(def.page);
  }
  // Campo global (nome do site, redes, SEO padrão) vive no layout → revalida tudo.
  if (global) {
    try {
      revalidatePath("/", "layout");
    } catch {
      /* ignora */
    }
  }
  for (const p of pages) {
    try {
      revalidatePath(p);
    } catch {
      /* rota não estática: ignora */
    }
  }
  return NextResponse.json({ ok: true });
}
