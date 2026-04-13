import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { filename, data } = await request.json();

    if (!filename || !data) {
      return NextResponse.json(
        { error: "Filename e data são obrigatórios" },
        { status: 400 }
      );
    }

    const safeName = filename
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    const dir = join(process.cwd(), "public", "artigos", "img");
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(data, "base64");
    await writeFile(join(dir, safeName), buffer);

    return NextResponse.json({ url: `/artigos/img/${safeName}` });
  } catch {
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
