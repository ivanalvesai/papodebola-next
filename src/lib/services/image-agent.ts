/**
 * Multi-Agent Image Service
 * Agent 1 (Creator): Claude generates prompt → FLUX generates image
 * Agent 2 (Reviewer): Claude Vision analyzes image vs content
 */

const HF_TOKENS = [
  process.env.HUGGINGFACE_TOKEN,
  process.env.HUGGINGFACE_TOKEN_2,
  process.env.HUGGINGFACE_TOKEN_3,
].filter(Boolean) as string[];

const FLUX_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
const POLLINATIONS_URL = "https://image.pollinations.ai/prompt";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// ==================== AGENT 1: CREATOR ====================

export async function generateImagePrompt(title: string, text: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are a sports image prompt engineer. Generate a detailed image generation prompt for a Brazilian football article.

ARTICLE TITLE: ${title}
ARTICLE TEXT: ${text.substring(0, 500)}

RULES:
- Identify the team(s), players, and context from the article
- Use the correct team colors and jersey descriptions
- Include stadium/field atmosphere
- Style: professional sports photography, action shot, dramatic lighting
- Format: 16:9 wide, photorealistic
- End with: "no text, no letters, no words, no watermarks"
- Write the prompt in English
- Maximum 100 words

TEAM JERSEY REFERENCE:
- Palmeiras: green jersey with white details
- Flamengo: red and black striped jersey
- Corinthians: white jersey with black details
- São Paulo: white jersey with red and black horizontal stripe
- Santos: white jersey
- Botafogo: black and white striped jersey
- Vasco: white jersey with black diagonal stripe
- Grêmio: blue, black and white tricolor jersey
- Internacional: red jersey
- Atlético-MG: black and white striped jersey
- Cruzeiro: blue jersey with white star
- Fluminense: burgundy, green and white tricolor jersey

Return ONLY the prompt, nothing else.`,
      }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export async function generateFluxImage(prompt: string): Promise<Buffer | null> {
  // Try HuggingFace tokens
  for (const token of HF_TOKENS) {
    try {
      const res = await fetch(FLUX_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (res.status === 402) {
        console.log("HF token exhausted, trying next...");
        continue;
      }

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 1000) {
          console.log(`FLUX image generated: ${buffer.byteLength} bytes`);
          return Buffer.from(buffer);
        }
      }
    } catch (err) {
      console.error("HF error:", err);
    }
  }

  // Fallback: Pollinations (free)
  console.log("Falling back to Pollinations...");
  try {
    const encoded = encodeURIComponent(prompt);
    const url = `${POLLINATIONS_URL}/${encoded}?width=1280&height=720&nologo=true`;
    const res = await fetch(url);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 1000) {
        console.log(`Pollinations image generated: ${buffer.byteLength} bytes`);
        return Buffer.from(buffer);
      }
    }
  } catch (err) {
    console.error("Pollinations error:", err);
  }

  return null;
}

// ==================== AGENT 2: REVIEWER ====================

export interface ReviewResult {
  approved: boolean;
  score: number; // 1-10
  feedback: string;
  issues: string[];
}

export async function reviewImage(
  imageBase64: string,
  title: string,
  text: string
): Promise<ReviewResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { approved: true, score: 5, feedback: "Review skipped (no API key)", issues: [] };
  }

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
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
            },
            {
              type: "text",
              text: `You are a sports image quality reviewer for a Brazilian football website.

ARTICLE TITLE: ${title}
ARTICLE EXCERPT: ${text.substring(0, 300)}

Analyze this image and determine if it's suitable for this article.

CHECK:
1. Does it relate to the article topic? (team, sport, context)
2. Are the team colors correct? (if applicable)
3. Is it a quality sports image? (not blurry, good composition)
4. Is it free of text/watermarks?
5. Does it look professional enough for a news article?

RESPOND IN JSON FORMAT ONLY:
{
  "approved": true/false,
  "score": 1-10,
  "feedback": "brief explanation in Portuguese",
  "issues": ["issue1", "issue2"]
}`,
            },
          ],
        }],
      }),
    });

    if (!res.ok) {
      console.error("Claude Vision error:", res.status);
      return { approved: true, score: 5, feedback: "Revisao automatica indisponivel", issues: [] };
    }

    const data = await res.json();
    const text_response = data.content?.[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = text_response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        approved: parsed.approved ?? true,
        score: parsed.score ?? 5,
        feedback: parsed.feedback ?? "",
        issues: parsed.issues ?? [],
      };
    }

    return { approved: true, score: 5, feedback: "Nao foi possivel analisar", issues: [] };
  } catch (err) {
    console.error("Review error:", err);
    return { approved: true, score: 5, feedback: "Erro na revisao automatica", issues: [] };
  }
}

// ==================== GALLERY: SOFASCORE ====================

export interface GalleryImage {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export async function getTeamGallery(teamName: string): Promise<GalleryImage[]> {
  // Map team name to Sofascore ID
  const teamMap: Record<string, number> = {
    palmeiras: 1963, flamengo: 5981, corinthians: 1957, "sao paulo": 1981,
    santos: 1968, fluminense: 1961, botafogo: 1958, vasco: 1974,
    gremio: 5926, internacional: 1966, "atletico-mg": 1977, "atletico mineiro": 1977,
    cruzeiro: 1954, bahia: 1955, "athletico-pr": 1967, athletico: 1967,
    bragantino: 1999, coritiba: 1982, vitoria: 1962, remo: 2012,
    "real madrid": 2829, barcelona: 2817, liverpool: 44, "manchester city": 17,
    arsenal: 42, juventus: 2687, bayern: 2672, psg: 1644, milan: 2692,
    inter: 2697, chelsea: 38, tottenham: 33, dortmund: 2673, porto: 3002,
  };

  const lower = teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let teamId = 0;
  for (const [key, id] of Object.entries(teamMap)) {
    if (lower.includes(key)) { teamId = id; break; }
  }

  if (!teamId) return [];

  try {
    const res = await fetch(`https://allsportsapi2.p.rapidapi.com/api/team/${teamId}/media`, {
      headers: {
        "x-rapidapi-key": process.env.ALLSPORTS_API_KEY || "",
        "x-rapidapi-host": process.env.ALLSPORTS_API_HOST || "",
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const media = data.media || [];

    return media
      .filter((m: Record<string, unknown>) => m.mediaType === 6 && m.thumbnailUrl)
      .slice(0, 20)
      .map((m: Record<string, unknown>, i: number) => ({
        id: `gallery_${i}`,
        title: (m.title as string) || "",
        thumbnail: (m.thumbnailUrl as string) || "",
        url: (m.url as string) || "",
      }));
  } catch {
    return [];
  }
}
