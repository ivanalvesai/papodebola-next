import fs from "node:fs";
import path from "node:path";

// Tradutor EN->PT via LibreTranslate self-hosted (sem custo de token).
// Estratégia: a request NUNCA bloqueia esperando tradução. Retorna só o que já
// está em cache; o que falta é traduzido em background (lotes pequenos) e fica
// pronto pro próximo poll. Cache em disco no volume compartilhado (dev+prod).
const LT_URL = process.env.LIBRETRANSLATE_URL; // ex: http://host.docker.internal:5000
const CACHE_FILE = path.join(process.cwd(), "data", "translations-en-pt.json");
const CHUNK = 12; // ~2s por lote no LibreTranslate

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

// traduz em background (lotes), popula o cache; não é aguardado pela request
async function backgroundTranslate(texts: string[]) {
  const todo = texts.filter((t) => !inFlight.has(t));
  if (!todo.length) return;
  todo.forEach((t) => inFlight.add(t));
  const c = loadCache();
  try {
    for (let i = 0; i < todo.length; i += CHUNK) {
      const chunk = todo.slice(i, i + CHUNK);
      const tr = await ltBatch(chunk);
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
