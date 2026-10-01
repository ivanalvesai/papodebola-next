// Guardas da mini-prévia de blocos do Construtor (/cms-block-preview). Puro: testado.
// Só os blocos que o canvas mostra em iframe passam (nunca embed/HTML livre), o id do item
// é validado antes de ir pro script inline e o bloco fica num store em memória (chave
// aleatória com TTL) em vez de viajar na URL.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const FRAMED_BLOCK_TYPES = new Set([
  "teamWidget", "standings", "scorers", "newsFeed", "liveMatch", "todayGames",
  "mediaText", "tabs", "formBlock", "countdown", "snippet",
]);

export const isFramedBlockType = (slug: unknown): boolean => typeof slug === "string" && FRAMED_BLOCK_TYPES.has(slug);
export const isValidPreviewId = (id: unknown): boolean => typeof id === "string" && /^[\w-]{1,100}$/.test(id);
export const isPreviewKey = (k: unknown): boolean =>
  typeof k === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k);

export type PreviewEntry = { block: any; width: string };

// Valida o corpo do POST. Devolve a entrada ou uma mensagem de erro em PT.
export function parsePreviewBody(body: any): PreviewEntry | string {
  const block = body?.block;
  if (!block || typeof block !== "object" || Array.isArray(block)) return "Bloco inválido.";
  if (!isFramedBlockType(block.blockType)) return "Bloco não suportado na prévia.";
  const width = body?.width === "narrow" ? "narrow" : "wide";
  return { block, width };
}

export function createPreviewStore(opts: { ttlMs?: number; cap?: number; now?: () => number; newKey?: () => string } = {}) {
  const ttl = opts.ttlMs ?? 10 * 60 * 1000;
  const cap = opts.cap ?? 500;
  const now = opts.now ?? Date.now;
  const newKey = opts.newKey ?? (() => crypto.randomUUID());
  const map = new Map<string, PreviewEntry & { exp: number }>();
  return {
    put(entry: PreviewEntry): string {
      const t = now();
      for (const [k, v] of map) if (v.exp <= t) map.delete(k);
      while (map.size >= cap) map.delete(map.keys().next().value as string);
      const key = newKey();
      map.set(key, { ...entry, exp: t + ttl });
      return key;
    },
    get(key: string): PreviewEntry | null {
      const v = map.get(key);
      if (!v) return null;
      if (v.exp <= now()) {
        map.delete(key);
        return null;
      }
      return { block: v.block, width: v.width };
    },
    size: () => map.size,
  };
}

export type PreviewStore = ReturnType<typeof createPreviewStore>;

// Uma instância por processo: a rota (POST) e a página leem o MESMO store mesmo estando em
// bundles diferentes do Next (por isso globalThis, e não só a variável do módulo).
export function previewStore(): PreviewStore {
  const g = globalThis as any;
  if (!g.__pdbBlockPreviewStore) g.__pdbBlockPreviewStore = createPreviewStore();
  return g.__pdbBlockPreviewStore;
}
