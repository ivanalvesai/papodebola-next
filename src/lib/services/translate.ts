import fs from "node:fs";
import path from "node:path";

// Tradutor EN->PT. Backends:
//  - Claude (Anthropic) se ANTHROPIC_TRANSLATE_KEY setado  → qualidade boa
//  - LibreTranslate self-hosted (LIBRETRANSLATE_URL) como fallback
// A request NUNCA bloqueia: retorna só o cache; o resto traduz em background.
// Cache em disco no volume compartilhado (dev+prod), separado por backend.
const ANTHROPIC_KEY = process.env.ANTHROPIC_TRANSLATE_KEY;
const LT_URL = process.env.LIBRETRANSLATE_URL;
const USE_CLAUDE = !!ANTHROPIC_KEY;
const BACKEND = USE_CLAUDE ? "claude" : "libre";
const CACHE_FILE = path.join(process.cwd(), "data", `translations-${BACKEND}.json`);
const CHUNK = USE_CLAUDE ? 25 : 12;
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

let cache: Record<string, string> | null = null;
let dirty = false;
const inFlight = new Set<string>();

function loadCache(): Record<string, string> {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    cache = {};
  }
  return cache!;
}

function saveCache() {
  if (!dirty || !cache) return;
  try {
    let onDisk: Record<string, string> = {};
    try {
      onDisk = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    } catch {
      /* ainda não existe */
    }
    cache = { ...onDisk, ...cache };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
    dirty = false;
  } catch {
    /* disco read-only: mantém em memória */
  }
}

// ---- backend LibreTranslate ----
async function ltBatch(qs: string[]): Promise<string[] | null> {
  if (!LT_URL || qs.length === 0) return null;
  try {
    const res = await fetch(`${LT_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: qs, source: "en", target: "pt", format: "text" }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.translatedText) ? data.translatedText : null;
  } catch {
    return null;
  }
}

// ---- backend Claude (Anthropic) ----
async function claudeBatch(qs: string[]): Promise<string[] | null> {
  if (!ANTHROPIC_KEY || qs.length === 0) return null;
  const numbered = qs.map((q, i) => `${i + 1}. ${q}`).join("\n");
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        system:
          "Você traduz narração de futebol do inglês para o português do Brasil. " +
          "Tradução natural, fluida e concisa, como num lance a lance ao vivo. " +
          "Mantenha nomes de jogadores, seleções e clubes exatamente como estão. " +
          "Responda APENAS as traduções, uma por linha, no formato 'N. tradução', " +
          "na mesma ordem e numeração da entrada, sem nenhum texto extra.",
        messages: [{ role: "user", content: numbered }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.content?.[0]?.text || "";
    const out: string[] = new Array(qs.length).fill("");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*(\d+)[.)]\s*(.+)$/);
      if (m) {
        const idx = parseInt(m[1], 10) - 1;
        if (idx >= 0 && idx < qs.length) out[idx] = m[2].trim();
      }
    }
    return out;
  } catch {
    return null;
  }
}

function translateBatch(qs: string[]): Promise<string[] | null> {
  return USE_CLAUDE ? claudeBatch(qs) : ltBatch(qs);
}

// traduz em background (lotes), popula o cache; não é aguardado pela request
async function backgroundTranslate(texts: string[]) {
  const todo = texts.filter((t) => !inFlight.has(t));
  if (!todo.length) return;
  todo.forEach((t) => inFlight.add(t));
  const c = loadCache();
  try {
    for (let i = 0; i < todo.length; i += CHUNK) {
      const chunk = todo.slice(i, i + CHUNK);
      const tr = await translateBatch(chunk);
      if (tr) {
        chunk.forEach((t, j) => {
          const v = tr[j];
          if (v && v !== t) {
            c[t] = v;
            dirty = true;
          }
        });
        saveCache();
      }
    }
  } finally {
    todo.forEach((t) => inFlight.delete(t));
  }
}

// Retorna { textoEN: textoPT } só dos já cacheados. Dispara em background a
// tradução dos que faltam (ficam prontos pro próximo poll).
export async function translateEnPt(texts: string[]): Promise<Record<string, string>> {
  const c = loadCache();
  const out: Record<string, string> = {};
  const todo: string[] = [];
  for (const t of texts) {
    if (!t) continue;
    if (c[t] != null) out[t] = c[t];
    else if (!todo.includes(t)) todo.push(t);
  }
  if (todo.length) void backgroundTranslate(todo);
  return out;
}
