import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getTeamGallery } from "@/lib/services/image-agent";
import { addManualChoice } from "@/lib/services/learning-store";
import { updatePost } from "@/lib/data/kanban-store";
import { readdir, unlink } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const team = request.nextUrl.searchParams.get("team") || "";
  if (!team) return NextResponse.json({ error: "Parametro team obrigatorio" }, { status: 400 });

  const images = await getTeamGallery(team);
  return NextResponse.json({ images, team });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { postId, postTitle, teamContext, imageUrl, rejectedPrompts } = await request.json();

    await addManualChoice({
      postTitle: postTitle || "",
      teamContext: teamContext || "",
      chosenImageUrl: imageUrl || "",
      chosenImageType: "gallery",
      rejectedPrompts: rejectedPrompts || [],
    });

    if (postId) {
      await updatePost(postId, { image: imageUrl });

      // Cleanup: delete all AI-generated images for this post (user chose gallery)
      try {
        const dir = join(process.cwd(), "data", "kanban-images");
        const files = await readdir(dir);
        for (const f of files) {
          if (f.startsWith(postId)) {
            await unlink(join(dir, f)).catch(() => {});
            console.log(`[Cleanup] Deleted ${f}`);
          }
        }
      } catch { /* dir may not exist */ }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
