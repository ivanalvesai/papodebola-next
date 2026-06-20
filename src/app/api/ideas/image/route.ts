import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

// Imagens do Mural de Ideias no volume compartilhado (data/) — persistem entre
// rebuilds e valem pra dev e prod. Servidas por este mesmo handler (GET ?f=).
const IMG_DIR = join(process.cwd(), "data", "ideas-images");

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif",
};

// POST: upload (base64). Body { id, filename, data }. Protegido (JWT).
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { id, filename, data } = await request.json();
    if (!data) return NextResponse.json({ error: "data obrigatorio" }, { status: 400 });

    const ext = (filename?.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = EXT_MIME[ext] ? ext : "png";
    const safeId = String(id || "idea").replace(/[^\w-]/g, "").slice(0, 40);
    const name = `${safeId}-${Date.now().toString(36)}.${safeExt}`;

    await mkdir(IMG_DIR, { recursive: true });
    await writeFile(join(IMG_DIR, name), Buffer.from(data, "base64"));
    return NextResponse.json({ url: `/api/ideas/image?f=${name}` });
  } catch {
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}

// GET: serve a imagem (?f=arquivo).
export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("f") || "";
  if (!filename || !/^[\w.-]+$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  try {
    const buffer = await readFile(join(IMG_DIR, filename));
    const ext = filename.split(".").pop()?.toLowerCase() || "png";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": EXT_MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
