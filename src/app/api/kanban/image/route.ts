import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { updatePost, getPosts } from "@/lib/data/kanban-store";
import { runImagePipeline } from "@/lib/services/image-agent";
import { writeFile, mkdir, unlink, readdir } from "fs/promises";
import { join } from "path";

const IMG_DIR = join(process.cwd(), "data", "kanban-images");

async function saveImage(postId: string, buffer: Buffer, attempt: number): Promise<string> {
  await mkdir(IMG_DIR, { recursive: true });

  // Delete previous attempts for this post (cleanup rejected images)
  try {
    const files = await readdir(IMG_DIR);
    for (const f of files) {
      if (f.startsWith(postId) && f !== `${postId}-v${attempt}.jpg`) {
        await unlink(join(IMG_DIR, f)).catch(() => {});
      }
    }
  } catch { /* dir may not exist yet */ }

  const filename = `${postId}-v${attempt}.jpg`;
  await writeFile(join(IMG_DIR, filename), buffer);
  return `/api/kanban/image/serve?f=${filename}`;
}

// Cleanup: delete all generated images for a post
export async function cleanupPostImages(postId: string): Promise<void> {
  try {
    const files = await readdir(IMG_DIR);
    for (const f of files) {
      if (f.startsWith(postId)) {
        await unlink(join(IMG_DIR, f)).catch(() => {});
      }
    }
  } catch { /* */ }
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

    // If rejected and gallery fallback, don't keep the last rejected image on disk
    // (it stays only until user picks from gallery, then gallery route cleans up)

    await updatePost(post.id, { image: result.imageUrl });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Image API] Error:", err);
    return NextResponse.json({ error: "Erro na geracao de imagem" }, { status: 500 });
  }
}
