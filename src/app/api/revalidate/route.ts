import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { secret, paths } = await request.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const revalidated: string[] = [];

    if (Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    // Always revalidate homepage and news
    revalidatePath("/");
    revalidatePath("/noticias");

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
