/**
 * Multi-Agent Image Service with Learning
 * Agent 1 (Creator): Claude generates prompt → FLUX generates image (learns from rejections)
 * Agent 2 (Reviewer): Claude Vision analyzes image vs content (calibrated by manual choices)
 */

import { buildLearningContext, buildReviewerContext, addFeedback } from "./learning-store";

const HF_TOKENS = [
  process.env.HUGGINGFACE_TOKEN,
  process.env.HUGGINGFACE_TOKEN_2,
  process.env.HUGGINGFACE_TOKEN_3,
].filter(Boolean) as string[];

const FLUX_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
const POLLINATIONS_URL = "https://image.pollinations.ai/prompt";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function extractTeamContext(title: string, text: string): string {
  const combined = `${title} ${text}`.toLowerCase();
  const teams = [
    "palmeiras", "flamengo", "corinthians", "sao paulo", "são paulo",
    "santos", "fluminense", "botafogo", "vasco", "gremio", "grêmio",
    "internacional", "atletico-mg", "atlético", "cruzeiro", "bahia",
    "athletico", "bragantino", "coritiba", "vitoria", "vitória",
    "remo", "chapecoense", "mirassol",
    "real madrid", "barcelona", "liverpool", "manchester city",
    "arsenal", "juventus", "bayern", "psg", "milan", "inter",
    "chelsea", "tottenham", "dortmund", "porto",
  ];
  for (const t of teams) {
    if (combined.includes(t)) return t;
  }
  return "futebol";
}

// ==================== AGENT 1: CREATOR ====================

export async function generateImagePrompt(
  title: string, text: string, previousFeedback: string = ""
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const teamContext = extractTeamContext(title, text);
  const learningContext = await buildLearningContext(teamContext);

  const systemParts = [
    "You are a sports image prompt engineer for a Brazilian football website.",
    learningContext,
    previousFeedback ? `\nFEEDBACK FROM LAST ATTEMPT (fix these issues):\n${previousFeedback}` : "",
  ].filter(Boolean).join("\n\n");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 300, system: systemParts,
      messages: [{ role: "user", content: `Generate a detailed image prompt for this football article.

TITLE: ${title}
TEXT: ${text.substring(0, 500)}

RULES:
- Identify team(s), players, context
- Use correct team colors/jerseys
- Stadium/field atmosphere
- Style: professional sports photography, action, dramatic lighting
- Format: 16:9 wide, photorealistic
- End with: "no text, no letters, no words, no watermarks"
- English, max 100 words

JERSEYS: Palmeiras=green, Flamengo=red+black stripes, Corinthians=white+black,
São Paulo=white+red+black stripe, Santos=white, Botafogo=black+white stripes,
Vasco=white+black diagonal, Grêmio=blue+black+white, Internacional=red,
Atlético-MG=black+white stripes, Cruzeiro=blue+white star

Return ONLY the prompt.` }],
    }),
  });

  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export async function generateFluxImage(prompt: string): Promise<Buffer | null> {
  for (const token of HF_TOKENS) {
    try {
      const res = await fetch(FLUX_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: prompt }),
      });
      if (res.status === 402) { console.log("HF token exhausted"); continue; }
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 1000) return Buffer.from(buf);
      }
    } catch (err) { console.error("HF error:", err); }
  }

  // Fallback: Pollinations
  try {
    const url = `${POLLINATIONS_URL}/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true`;
    const res = await fetch(url);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 1000) return Buffer.from(buf);
    }
  } catch (err) { console.error("Pollinations error:", err); }

  return null;
}

// ==================== AGENT 2: REVIEWER ====================

export interface ReviewResult {
  approved: boolean; score: number; feedback: string; issues: string[];
}

export async function reviewImage(imageBase64: string, title: string, text: string): Promise<ReviewResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { approved: true, score: 5, feedback: "Review skipped", issues: [] };

  const teamContext = extractTeamContext(title, text);
  const reviewerContext = await buildReviewerContext(teamContext);

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 500,
        system: ["Strict sports image reviewer for a Brazilian football website.", reviewerContext].filter(Boolean).join("\n\n"),
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
          { type: "text", text: `TITLE: ${title}
TEXT: ${text.substring(0, 300)}

Check: topic match? team colors? quality? no watermarks? professional?
Score 7+ = approve. JSON ONLY:
{"approved": true/false, "score": 1-10, "feedback": "PT-BR", "issues": ["..."]}` },
        ] }],
      }),
    });

    if (!res.ok) return { approved: true, score: 5, feedback: "Revisao indisponivel", issues: [] };
    const data = await res.json();
    const txt = data.content?.[0]?.text || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (m) {
      const p = JSON.parse(m[0]);
      return { approved: p.approved ?? true, score: p.score ?? 5, feedback: p.feedback ?? "", issues: p.issues ?? [] };
    }
    return { approved: true, score: 5, feedback: "Parse error", issues: [] };
  } catch { return { approved: true, score: 5, feedback: "Erro na revisao", issues: [] }; }
}

// ==================== FULL PIPELINE WITH RETRY + LEARNING ====================

export interface PipelineResult {
  imageUrl: string; prompt: string; review: ReviewResult;
  attempt: number; totalAttempts: number;
  autoApproved: boolean; galleryFallback: boolean;
}

export async function runImagePipeline(
  postId: string, title: string, text: string,
  saveImage: (postId: string, buffer: Buffer, attempt: number) => Promise<string>,
): Promise<PipelineResult> {
  const teamContext = extractTeamContext(title, text);
  const maxAttempts = 3;
  let lastFeedback = "";
  let lastPrompt = "";
  let lastReview: ReviewResult = { approved: false, score: 0, feedback: "", issues: [] };
  let lastImageUrl = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Pipeline] Attempt ${attempt}/${maxAttempts}: ${title.substring(0, 50)}`);

    // CREATOR: generate prompt with learning + previous feedback
    const prompt = await generateImagePrompt(title, text, lastFeedback);
    lastPrompt = prompt;

    // CREATOR: generate image
    const imageBuffer = await generateFluxImage(prompt);
    if (!imageBuffer) { console.log(`[Creator] Failed attempt ${attempt}`); continue; }

    const imageUrl = await saveImage(postId, imageBuffer, attempt);
    lastImageUrl = imageUrl;

    // REVIEWER: analyze
    const base64 = imageBuffer.toString("base64");
    const review = await reviewImage(base64, title, text);
    lastReview = review;
    console.log(`[Reviewer] Attempt ${attempt}: score=${review.score}, approved=${review.approved}`);

    // Save feedback for learning
    await addFeedback({
      postTitle: title, teamContext, prompt,
      approved: review.approved, score: review.score,
      feedback: review.feedback, issues: review.issues, attempt,
    });

    if (review.approved) {
      return { imageUrl, prompt, review, attempt, totalAttempts: attempt, autoApproved: true, galleryFallback: false };
    }

    // Build feedback for next attempt
    lastFeedback = [
      `REJECTED (score ${review.score}/10): ${review.feedback}`,
      review.issues.length > 0 ? `Issues: ${review.issues.join("; ")}` : "",
      "Generate a COMPLETELY DIFFERENT image. Do NOT repeat these mistakes.",
    ].filter(Boolean).join("\n");
  }

  // All attempts rejected
  console.log(`[Pipeline] All ${maxAttempts} attempts rejected → gallery fallback`);
  return { imageUrl: lastImageUrl, prompt: lastPrompt, review: lastReview, attempt: maxAttempts, totalAttempts: maxAttempts, autoApproved: false, galleryFallback: true };
}

// ==================== GALLERY ====================

export interface GalleryImage { id: string; title: string; thumbnail: string; url: string; }

export async function getTeamGallery(teamName: string): Promise<GalleryImage[]> {
  const teamMap: Record<string, number> = {
    palmeiras: 1963, flamengo: 5981, corinthians: 1957, "sao paulo": 1981,
    "são paulo": 1981, santos: 1968, fluminense: 1961, botafogo: 1958,
    vasco: 1974, gremio: 5926, "grêmio": 5926, internacional: 1966,
    "atletico-mg": 1977, "atlético": 1977, cruzeiro: 1954, bahia: 1955,
    athletico: 1967, bragantino: 1999, coritiba: 1982, vitoria: 1962,
    "vitória": 1962, remo: 2012, "real madrid": 2829, barcelona: 2817,
    liverpool: 44, "manchester city": 17, arsenal: 42, juventus: 2687,
    bayern: 2672, psg: 1644, milan: 2692, inter: 2697, chelsea: 38,
    tottenham: 33, dortmund: 2673, porto: 3002,
  };

  const lower = teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let teamId = 0;
  for (const [key, id] of Object.entries(teamMap)) { if (lower.includes(key)) { teamId = id; break; } }
  if (!teamId) return [];

  try {
    const res = await fetch(`https://allsportsapi2.p.rapidapi.com/api/team/${teamId}/media`, {
      headers: { "x-rapidapi-key": process.env.ALLSPORTS_API_KEY || "", "x-rapidapi-host": process.env.ALLSPORTS_API_HOST || "" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.media || [])
      .filter((m: Record<string, unknown>) => m.mediaType === 6 && m.thumbnailUrl)
      .slice(0, 50)
      .map((m: Record<string, unknown>, i: number) => ({
        id: `gallery_${i}`, title: (m.title as string) || "",
        thumbnail: (m.thumbnailUrl as string) || "", url: (m.url as string) || "",
      }));
  } catch { return []; }
}
