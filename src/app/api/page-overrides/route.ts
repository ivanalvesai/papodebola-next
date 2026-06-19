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
  for (const id of Object.keys(updates)) {
    const p = EDITABLE[id]?.page;
    if (p) pages.add(p);
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
