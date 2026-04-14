/**
 * Image Optimizer
 * - Resize to 1200x630 (16:9, Open Graph standard)
 * - Convert to WebP (quality 85%)
 * - Generate alt text via Claude
 * - Upload to WordPress as featured image
 */

import sharp from "sharp";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// ==================== RESIZE + CONVERT ====================

export async function optimizeImage(input: Buffer | string): Promise<Buffer> {
  let buffer: Buffer;

  if (typeof input === "string") {
    // Download from URL
    const res = await fetch(input);
    if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
    buffer = Buffer.from(await res.arrayBuffer());
  } else {
    buffer = input;
  }

  // Resize to 1200x630 (16:9) and convert to WebP
  const optimized = await sharp(buffer)
    .resize(1200, 630, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 85 })
    .toBuffer();

  console.log(`[Optimizer] ${buffer.length} bytes → ${optimized.length} bytes (${Math.round((1 - optimized.length / buffer.length) * 100)}% smaller)`);

  return optimized;
}

// ==================== ALT TEXT VIA CLAUDE ====================

export async function generateAltText(title: string, category: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return title;

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: `Gere um alt text SEO em portugues para a imagem de capa deste artigo de futebol.
Titulo: ${title}
Categoria: ${category}

Regras:
- Maximo 125 caracteres
- Descreva o que a imagem provavelmente mostra
- Inclua palavras-chave relevantes
- Nao use aspas

Retorne APENAS o alt text, nada mais.`,
        }],
      }),
    });

    if (!res.ok) return title;
    const data = await res.json();
    return (data.content?.[0]?.text || title).trim();
  } catch {
    return title;
  }
}

// ==================== UPLOAD TO WORDPRESS ====================

export async function uploadToWordPress(
  imageBuffer: Buffer,
  filename: string,
  altText: string
): Promise<{ mediaId: number; mediaUrl: string } | null> {
  const wpBase = process.env.WP_BASE_URL;
  const wpUser = process.env.WP_USER;
  const wpPass = process.env.WP_APP_PASSWORD;

  if (!wpBase || !wpUser || !wpPass) {
    console.error("[WP Upload] Missing WordPress credentials");
    return null;
  }

  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString("base64");

  try {
    // Upload image
    const uploadRes = await fetch(`${wpBase}/media`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/webp",
      },
      body: new Uint8Array(imageBuffer),
    });

    if (!uploadRes.ok) {
      console.error("[WP Upload] Upload failed:", uploadRes.status);
      return null;
    }

    const mediaData = await uploadRes.json();
    const mediaId = mediaData.id;
    const mediaUrl = mediaData.source_url;

    // Set alt text
    await fetch(`${wpBase}/media/${mediaId}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ alt_text: altText }),
    });

    console.log(`[WP Upload] Media ${mediaId}: ${mediaUrl}`);
    return { mediaId, mediaUrl };
  } catch (err) {
    console.error("[WP Upload] Error:", err);
    return null;
  }
}

// ==================== FULL OPTIMIZATION PIPELINE ====================

export async function processImageForPublish(
  imageSource: Buffer | string,
  title: string,
  category: string,
  slug: string
): Promise<{
  optimizedBuffer: Buffer;
  altText: string;
  wpMediaId: number | null;
  wpMediaUrl: string;
} | null> {
  try {
    // 1. Optimize: resize + WebP
    console.log("[Process] Optimizing image...");
    const optimized = await optimizeImage(imageSource);

    // 2. Generate alt text
    console.log("[Process] Generating alt text...");
    const altText = await generateAltText(title, category);
    console.log(`[Process] Alt: ${altText}`);

    // 3. Upload to WordPress
    console.log("[Process] Uploading to WordPress...");
    const filename = `${slug}-capa.webp`;
    const wpResult = await uploadToWordPress(optimized, filename, altText);

    return {
      optimizedBuffer: optimized,
      altText,
      wpMediaId: wpResult?.mediaId || null,
      wpMediaUrl: wpResult?.mediaUrl || "",
    };
  } catch (err) {
    console.error("[Process] Error:", err);
    return null;
  }
}
