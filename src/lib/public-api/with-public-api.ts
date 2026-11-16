import { ok, fail, type Meta } from "./envelope.ts";
import { authorize } from "./authorize.ts";
import { createRateLimiter } from "./rate-limit.ts";
import { createResponseCache } from "./response-cache.ts";
import { clientIp } from "./client-ip.ts";
import { loadKeys } from "./keys-store.ts";
import { recordUsage } from "./usage.ts";
import { V1ErrorLike } from "./v1/v1-error.ts";
import { apiGate } from "./gate.ts";
import { runCached } from "./cached-call.ts";

export { V1ErrorLike as V1Error };
export interface V1Result { data: unknown; meta: Meta; ttl: number }

// Singletons no globalThis: cada rota do Next pode ter sua própria cópia deste módulo, e a
// cota/cache precisam ser UM só por processo (senão a cota vira 600/min POR ROTA).
const g = globalThis as unknown as { __pdbApiV1?: { limiter: ReturnType<typeof createRateLimiter>; cache: ReturnType<typeof createResponseCache> } };
g.__pdbApiV1 ??= { limiter: createRateLimiter(), cache: createResponseCache() };
const { limiter, cache } = g.__pdbApiV1;

// Misses de cache por chave (cada miss pode virar consulta ao fornecedor via dev): no máximo
// MISSES_PER_MIN por minuto, bem abaixo do limite de 6 req/s do plano, mesmo com cota alta.
const MISSES_PER_MIN = 60;

type Guarded = { ok: true; keyId: string } | { ok: false; res: Response };

async function guard(req: Request, routeName: string): Promise<Guarded> {
  const mode = apiGate(process.env);
  if (mode === "off") return { ok: false, res: fail(404, "nao_encontrado", "Não encontrado.") };
  const auth = authorize({ key: req.headers.get("x-api-key"), ip: clientIp(req.headers), records: await loadKeys(), mode }, limiter);
  if (!auth.ok) return { ok: false, res: fail(auth.status, auth.codigo, auth.mensagem, auth.retryAfter ? { "retry-after": String(auth.retryAfter) } : {}) };
  recordUsage(auth.record.id, routeName);
  return { ok: true, keyId: auth.record.id };
}

function missAllowed(keyId: string): Response | null {
  const t = limiter.take(`miss:${keyId}`, MISSES_PER_MIN);
  return t.ok ? null : fail(429, "limite_excedido", "Muitos pedidos de dados diferentes por minuto.", { "retry-after": String(t.retryAfter) });
}

function toError(e: unknown): Response {
  if (e instanceof V1ErrorLike) return fail(e.status, e.codigo, e.message);
  console.error("API_V1_ERROR", e);
  return fail(500, "erro_interno", "Erro interno.");
}

// Rotas JSON: auth → cache (chave = URL sem host) → handler → envelope.
export function withPublicApi<P>(routeName: string, handler: (req: Request, params: P) => Promise<V1Result>) {
  return async (req: Request, ctx: { params: Promise<P> }): Promise<Response> => {
    const g = await guard(req, routeName);
    if (!g.ok) return g.res;
    try {
      const params = await ctx.params;
      const u = new URL(req.url);
      const key = `${u.pathname}?${u.searchParams.toString()}`;
      if (!cache.has(key)) {
        const limited = missAllowed(g.keyId);
        if (limited) return limited;
      }
      const r = await runCached(cache, key, () => handler(req, params));
      return ok(r.data, r.meta);
    } catch (e) {
      return toError(e);
    }
  };
}

// Rotas binárias (imagens): auth + uso, o handler monta a Response.
export function withPublicApiRaw<P>(routeName: string, handler: (req: Request, params: P) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<P> }): Promise<Response> => {
    const g = await guard(req, routeName);
    if (!g.ok) return g.res;
    try {
      return await handler(req, await ctx.params);
    } catch (e) {
      return toError(e);
    }
  };
}
