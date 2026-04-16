/**
 * Writer Agent with Humanizer + Full SEO (Rank Math 85+)
 * Replicates the old build-articles.js automation quality:
 * - 2000+ word articles (8-12 dense paragraphs)
 * - H2 subtitles for TOC generation
 * - Complete Rank Math metadata
 * - Focus keyword optimization
 * - Internal linking ("Leia também")
 * - Table of Contents when 3+ headings
 * - Humanizer rules from Wikipedia's "Signs of AI writing"
 */

import { fetchWP } from "@/lib/api/wordpress";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const WP_CATEGORIES = [
  "Brasileirão", "Copa do Brasil", "Copa do Mundo", "Seleção Brasileira",
  "Copa Libertadores", "Champions League", "Premier League", "La Liga",
  "Futebol Internacional", "Mercado da Bola", "Copa Sudamericana",
  "Eliminatórias", "Futebol Brasileiro",
];

const SYSTEM_PROMPT = `Você é um jornalista esportivo brasileiro experiente e autêntico.
Escreva como um ser humano real, com personalidade, opiniões e estilo próprio.
Sua tarefa é criar um ARTIGO COMPLETO baseado na notícia abaixo.

IMPORTANTE: O texto original pode estar em QUALQUER idioma (inglês, espanhol, etc).
Você DEVE escrever o artigo INTEIRO em PORTUGUÊS DO BRASIL.
Traduza e reescreva tudo. O título também DEVE ser em português.

REGRAS DE CONTEÚDO:
- Escreva um artigo LONGO e COMPLETO com 2000+ PALAVRAS (MÍNIMO 1500 palavras, ideal 2000+)
- Reescreva e TRADUZA tudo para português do Brasil
- NUNCA deixe palavras, frases ou títulos em inglês/espanhol
- Mantenha informações factuais: nomes de jogadores, times, placares, datas
- Use português do Brasil fluente, coloquial mas profissional
- Estruture em 8-12 PARÁGRAFOS DENSOS (cada um com 60-100 palavras)
- Inclua: contexto histórico, análise tática, opinião pessoal, projeções futuras
- Crie EXATAMENTE 3-5 subtítulos internos em MAIÚSCULAS seguidos de " -" (ex: "O CONTEXTO DA PARTIDA -")
- Os subtítulos devem dividir o artigo em seções lógicas
- Cada seção entre subtítulos deve ter 2-3 parágrafos

REGRAS DE HUMANIZAÇÃO (CRÍTICO - o texto NÃO pode parecer IA):
- NUNCA use: "crucial", "pivotal", "landscape", "tapestry", "testament", "fostering",
  "showcasing", "delve", "underscores", "highlights the importance", "vibrant", "profound",
  "groundbreaking", "nestled", "in the heart of", "broader implications", "it is worth noting",
  "sets the stage", "indelible mark", "adicionalmente", "fundamental", "fomentar", "cultivar",
  "aprofundar", "destacar" (verbo), "sublinhar", "valoroso", "intricado"
- NUNCA use: "Não é apenas X, mas também Y" ou "Não se trata apenas de X, mas de Y"
- NUNCA use 3 adjetivos em sequência
- NUNCA mais de 1 travessão (—) no texto inteiro
- NUNCA comece parágrafos consecutivos com mesma estrutura
- NUNCA use: "Além disso", "Adicionalmente", "É importante ressaltar", "Vale destacar"
- NUNCA use análises com -ndo: "destacando...", "garantindo...", "refletindo...", "evidenciando..."
- NUNCA use atribuições vagas: "especialistas acreditam", "observadores notaram", "fontes indicam"
- NUNCA use conclusões genéricas: "o futuro é promissor", "tempos empolgantes pela frente"
- NUNCA use frases de IA: "vamos mergulhar", "vamos explorar", "aqui está o que você precisa saber"
- VARIE tamanho de frases: mix frases curtas com longas
- TENHA OPINIÃO: não seja neutro. "Difícil engolir esse resultado" > "resultado desfavorável"
- USE PRIMEIRA PESSOA quando fizer sentido: "Eu sinceramente não entendo...", "Me parece que..."
- SEJA ESPECÍFICO: "torcida vaiou por 5 minutos" > "torcedores ficaram insatisfeitos"
- PREFIRA voz ativa sobre passiva
- INCLUA detalhes sensoriais: barulho da torcida, clima do estádio, tensão nos acréscimos
- ESCREVA como se estivesse contando para um amigo no bar que manja de futebol
- Use aspas retas "assim", nunca curvas
- Sem emojis, sem listas com bullet points, tudo em texto corrido

FORMATO DE SAÍDA (siga EXATAMENTE):

TITULO: (título em português, 50-80 caracteres, contendo a focus keyword naturalmente)
FOCUS_KEYWORD: (3 palavras-chave extraídas do título, sem stopwords)
SLUG: (slug para URL, só minúsculas sem acento, hífens, max 55 chars, com focus keyword)
EXCERPT: (meta description 140-155 chars, contendo focus keyword, terminando com "Leia mais no Papo de Bola!")
CATEGORY: (escolha UMA entre as categorias disponíveis)
TAGS: (3-4 tags separadas por vírgula)
---
(corpo do artigo com 2000+ palavras, 8-12 parágrafos, 3-5 subtítulos em MAIÚSCULAS seguidos de " -")`;

export interface WriterResult {
  title: string;
  text: string;
  htmlContent: string;
  slug: string;
  excerpt: string;
  focusKeyword: string;
  category: string;
  tags: string[];
  wordCount: number;
  headingCount: number;
}

// ==================== FETCH SOURCE CONTENT ====================

async function fetchSourceContent(url: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PapoDeBola/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = bodyMatch?.[1] || html;
    const text = body
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.substring(0, 4000);
  } catch {
    return "";
  }
}

// ==================== FOCUS KEYWORD GENERATION ====================

function generateFocusKeyword(title: string): string {
  const stop = [
    "para", "com", "que", "por", "mais", "como", "sobre", "entre", "pela", "uma",
    "dos", "das", "nos", "nas", "mas", "pode", "tem", "vai", "sem", "foi", "ainda",
    "após", "não", "são", "está", "seu", "sua", "ele", "ela", "isso", "este", "esta",
    "esse", "essa", "quando", "onde", "porque", "pois", "muito", "bem", "ser", "ter",
  ];
  const words = title
    .toLowerCase()
    .replace(/[^\w\sáéíóúâêôãõçü-]/gi, "")
    .split(/\s+/)
    .filter((w: string) => w.length > 2 && !stop.includes(w));
  return words.slice(0, 3).join(" ");
}

// ==================== SLUG GENERATION ====================

function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (slug.length > 55) {
    slug = slug.substring(0, 55);
    const last = slug.lastIndexOf("-");
    if (last > 30) slug = slug.substring(0, last);
  }
  return slug;
}

// ==================== HTML CONTENT BUILDER ====================

function buildHtmlContent(
  rawText: string,
  focusKeyword: string,
  relatedArticles: { title: string; slug: string }[],
): { html: string; headingCount: number; wordCount: number } {
  const lines = rawText.split("\n").filter((l: string) => l.trim());
  const htmlParts: string[] = [];
  const headings: { id: string; text: string }[] = [];
  let sectionIdx = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect H2 subtitles: ALL CAPS followed by " -" or " —" or ":"
    const h2Match = trimmed.match(/^([A-ZÁÉÍÓÚÂÊÔÃÕÇÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÜ\s,]{4,})\s*[-–—:]\s*(.*)/);
    if (h2Match) {
      const headingText = h2Match[1].trim();
      const afterHeading = h2Match[2]?.trim() || "";
      const headingId = `section-${sectionIdx}`;
      headings.push({ id: headingId, text: headingText });
      htmlParts.push(`<h2 id="${headingId}">${headingText}</h2>`);
      if (afterHeading) {
        htmlParts.push(`<p>${afterHeading}</p>`);
      }
      sectionIdx++;
      continue;
    }

    // Regular paragraph
    if (trimmed.length > 0) {
      htmlParts.push(`<p>${trimmed}</p>`);
    }
  }

  // Generate Table of Contents if 3+ headings
  let tocHtml = "";
  if (headings.length >= 3) {
    const tocItems = headings
      .map((h) => `<li><a href="#${h.id}">${h.text.charAt(0)}${h.text.slice(1).toLowerCase()}</a></li>`)
      .join("\n    ");
    tocHtml = `<div style="background:#f8f9fa;border:1px solid #e2e5e9;border-radius:8px;padding:16px 20px;margin:20px 0">
  <strong>Neste artigo:</strong>
  <ul style="margin:8px 0 0;padding-left:20px">
    ${tocItems}
  </ul>
</div>`;
  }

  // Generate "Leia também" section with internal links
  let leiaHtml = "";
  if (relatedArticles.length > 0) {
    const links = relatedArticles
      .slice(0, 3)
      .map((a) => `<li><a href="https://papodebola.com.br/artigos/${a.slug}">${a.title}</a></li>`)
      .join("\n    ");
    leiaHtml = `\n<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:24px 0">
  <strong>Leia tambem:</strong>
  <ul style="margin:8px 0 0;padding-left:20px">
    ${links}
  </ul>
</div>`;
  }

  // Assemble: TOC after first paragraph, "Leia também" at end
  const parts = [...htmlParts];
  if (tocHtml && parts.length > 1) {
    parts.splice(1, 0, tocHtml);
  }
  if (leiaHtml) {
    parts.push(leiaHtml);
  }

  const html = parts.join("\n\n");
  const wordCount = rawText.split(/\s+/).length;

  return { html, headingCount: headings.length, wordCount };
}

// ==================== FETCH RELATED ARTICLES ====================

async function getRelatedSlugs(category: string): Promise<{ title: string; slug: string }[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cats = await fetchWP<any[]>("categories?per_page=50", 86400);
    if (!cats) return [];
    const cat = cats.find((c: { name: string }) =>
      c.name.toLowerCase() === category.toLowerCase()
    );
    if (!cat) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts = await fetchWP<any[]>(
      `posts?categories=${cat.id}&per_page=4&orderby=date&order=desc&_fields=id,title,slug`,
      0,
    );
    if (!posts) return [];
    return posts.map((p: { title: { rendered: string }; slug: string }) => ({
      title: p.title.rendered.replace(/<[^>]+>/g, ""),
      slug: p.slug,
    }));
  } catch {
    return [];
  }
}

// ==================== MAIN WRITE FUNCTION ====================

export async function writeArticle(
  title: string,
  description: string,
  rssUrl: string,
  category: string,
): Promise<WriterResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const sourceContent = await fetchSourceContent(rssUrl);
  const categoriesList = WP_CATEGORIES.join(", ");

  const userPrompt = `Escreva um artigo COMPLETO e LONGO (2000+ palavras) baseado nesta notícia:

TÍTULO DA FONTE: ${title}
RESUMO: ${description}
CATEGORIA SUGERIDA: ${category}
${sourceContent ? `\nCONTEÚDO DA FONTE (para contexto, reescreva com suas palavras, NÃO copie):\n${sourceContent}` : ""}

CATEGORIAS DISPONÍVEIS: ${categoriesList}

LEMBRE-SE:
- MÍNIMO 1500 palavras, ideal 2000+
- 8-12 parágrafos densos (60-100 palavras cada)
- 3-5 subtítulos em MAIÚSCULAS seguidos de " -"
- Focus keyword deve aparecer no TITULO, SLUG, EXCERPT e no primeiro parágrafo
- Focus keyword deve aparecer 2-3 vezes no corpo do texto naturalmente
- EXCERPT deve ter 140-155 caracteres e terminar com "Leia mais no Papo de Bola!"
- O SLUG deve ter no máximo 55 caracteres
- Inclua contexto, análise, opinião e projeção
- Escreva como jornalista de verdade, com personalidade`;

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const output = data.content?.[0]?.text || "";

  // Parse structured fields
  const fieldMatch = (name: string) => {
    const m = output.match(new RegExp(`^${name}:\\s*(.+)`, "m"));
    return m?.[1]?.trim() || "";
  };

  const articleTitle = fieldMatch("TITULO") || title;
  let focusKeyword = fieldMatch("FOCUS_KEYWORD") || generateFocusKeyword(articleTitle);
  const slug = fieldMatch("SLUG") || generateSlug(articleTitle);
  let excerpt = fieldMatch("EXCERPT") || "";
  const parsedCategory = fieldMatch("CATEGORY") || category;
  const tagsRaw = fieldMatch("TAGS");
  const tags = tagsRaw ? tagsRaw.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

  // Validate category
  const validCategory = WP_CATEGORIES.includes(parsedCategory) ? parsedCategory : category;

  // Extract body after ---
  const bodyStart = output.indexOf("---");
  const articleBody = bodyStart >= 0
    ? output.substring(bodyStart + 3).trim()
    : output.replace(/^(TITULO|SLUG|EXCERPT|FOCUS_KEYWORD|CATEGORY|TAGS):.*\n?/gm, "").trim();

  // Ensure focus keyword is valid (3 words, no stopwords)
  if (focusKeyword.split(" ").length < 2) {
    focusKeyword = generateFocusKeyword(articleTitle);
  }

  // Ensure excerpt ends with CTA and has proper length
  if (!excerpt) {
    excerpt = articleBody.substring(0, 130).replace(/\s+\S*$/, "") + " Leia mais no Papo de Bola!";
  } else if (!excerpt.includes("Leia mais")) {
    // Trim to fit with CTA
    const maxBase = 155 - " Leia mais no Papo de Bola!".length;
    if (excerpt.length > maxBase) {
      excerpt = excerpt.substring(0, maxBase).replace(/\s+\S*$/, "");
    }
    excerpt = excerpt.replace(/[.!]$/, "") + ". Leia mais no Papo de Bola!";
  }

  // Fetch related articles for internal linking
  const relatedArticles = await getRelatedSlugs(validCategory);

  // Build HTML content with TOC, H2 headings, and internal links
  const { html, headingCount, wordCount } = buildHtmlContent(articleBody, focusKeyword, relatedArticles);

  console.log(`[Writer] "${articleTitle}" — ${wordCount} words, ${headingCount} headings, keyword: "${focusKeyword}"`);

  return {
    title: articleTitle,
    text: articleBody,
    htmlContent: html,
    slug,
    excerpt,
    focusKeyword,
    category: validCategory,
    tags,
    wordCount,
    headingCount,
  };
}
