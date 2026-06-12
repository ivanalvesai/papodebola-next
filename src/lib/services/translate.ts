import fs from "node:fs";
import path from "node:path";

// Tradutor EN->PT via LibreTranslate self-hosted (sem custo de token).
// Cache em disco no volume compartilhado: cada texto é traduzido uma vez só.
const LT_URL = process.env.LIBRETRANSLATE_URL; // ex: http://host.docker.internal:5000
const CACHE_FILE = path.join(process.cwd(), "data", "translations-en-pt.json");

let cache: Record<string, string> | null = null;
let dirty = false;

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
    // read-merge-write: reduz perda de traduções entre dev e prod (volume compartilhado)
    let onDisk: Record<string, string> = {};
    try {
      onDisk = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    } catch {
      /* arquivo ainda não existe */
    }
    cache = { ...onDisk, ...cache };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
    dirty = false;
  } catch {
    /* disco read-only ou erro: mantém só em memória */
  }
}

async function ltBatch(qs: string[]): Promise<string[] | null> {
  if (!LT_URL || qs.length === 0) return null;
  try {
    const res = await fetch(`${LT_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: qs, source: "en", target: "pt", format: "text" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.translatedText) ? data.translatedText : null;
  } catch {
    return null;
  }
}

// Traduz os textos EN->PT. Retorna mapa { textoEN: textoPT }.
// Só traduz os que não estão em cache; fallback = texto original.
export async function translateEnPt(texts: string[]): Promise<Record<string, string>> {
  const c = loadCache();
  const out: Record<string, string> = {};
  const todo: string[] = [];
  for (const t of texts) {
    if (!t) continue;
    if (c[t] != null) out[t] = c[t];
    else if (!todo.includes(t)) todo.push(t);
  }
  if (todo.length) {
    const translated = await ltBatch(todo);
    todo.forEach((t, i) => {
      const tr = translated?.[i];
      // só registra tradução real; se LT falhar, deixa de fora (o caller usa o rótulo PT)
      if (tr && tr !== t) {
        out[t] = tr;
        c[t] = tr;
        dirty = true;
      }
    });
    saveCache();
  }
  return out;
}
