import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { updatePost, getPosts } from "@/lib/data/kanban-store";
import { generateImagePrompt, generateFluxImage, reviewImage } from "@/lib/services/image-agent";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { postId, attempt = 1 } = await request.json();

    const posts = await getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 });

    // AGENT 1: Generate prompt via Claude
    console.log(`[Image Agent] Generating prompt for: ${post.title}`);
    const prompt = await generateImagePrompt(post.title, post.text);
    console.log(`[Image Agent] Prompt: ${prompt.substring(0, 100)}...`);

    // AGENT 1: Generate image via FLUX
    console.log("[Image Agent] Generating image...");
    const imageBuffer = await generateFluxImage(prompt);
    if (!imageBuffer) {
      return NextResponse.json({ error: "Falha na geracao da imagem" }, { status: 500 });
    }

    // Save image
    const dir = join(process.cwd(), "public", "kanban-images");
    await mkdir(dir, { recursive: true });
    const filename = `${post.id}-v${attempt}.jpg`;
    await writeFile(join(dir, filename), imageBuffer);
    const imageUrl = `/kanban-images/${filename}`;

    // AGENT 2: Review image via Claude Vision
    console.log("[Review Agent] Reviewing image...");
    const base64 = imageBuffer.toString("base64");
    const review = await reviewImage(base64, post.title, post.text);
    console.log(`[Review Agent] Score: ${review.score}/10, Approved: ${review.approved}`);

    // Update post with image and review
    await updatePost(post.id, {
      image: imageUrl,
    });

    return NextResponse.json({
      imageUrl,
      prompt,
      review,
      attempt,
    });
  } catch (err) {
    console.error("[Image Agent] Error:", err);
    return NextResponse.json({ error: "Erro na geracao de imagem" }, { status: 500 });
  }
}
