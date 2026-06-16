import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

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

    // Real-time: invalida o cache de dados de TODA notícia (tag "wp-articles"). Assim,
    // ao publicar um post, todas as listagens/landings (home, /noticias, /nba, /formula-1,
    // hubs de futebol...) regeneram com o post novo na próxima visita — sem esperar o ISR.
    revalidateTag("wp-articles", "max");
    revalidatePath("/");
    revalidatePath("/noticias");

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      tags: ["wp-articles"],
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
