import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { updatePost, getPosts } from "@/lib/data/kanban-store";
import { runImagePipeline } from "@/lib/services/image-agent";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

async function saveImage(postId: string, buffer: Buffer, attempt: number): Promise<string> {
  const dir = join(process.cwd(), "public", "kanban-images");
  await mkdir(dir, { recursive: true });
  const filename = `${postId}-v${attempt}.jpg`;
  await writeFile(join(dir, filename), buffer);
  return `/kanban-images/${filename}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { postId } = await request.json();

    const posts = await getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });

    console.log(`[Image API] Starting pipeline for: ${post.title.substring(0, 50)}`);

    const result = await runImagePipeline(post.id, post.title, post.text, saveImage);

    // Update post with final image
    await updatePost(post.id, { image: result.imageUrl });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Image API] Error:", err);
    return NextResponse.json({ error: "Erro na geracao de imagem" }, { status: 500 });
  }
}
