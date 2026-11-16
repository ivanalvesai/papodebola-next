import { ok, fail, type Meta } from "./envelope.ts";
import { authorize } from "./authorize.ts";
import { createRateLimiter } from "./rate-limit.ts";
import { createResponseCache } from "./response-cache.ts";
import { clientIp } from "./client-ip.ts";
import { loadKeys } from "./keys-store.ts";
import { recordUsage } from "./usage.ts";
import { V1ErrorLike } from "./v1/v1-error.ts";

export { V1ErrorLike as V1Error };
export interface V1Result { data: unknown; meta: Meta; ttl: number }

// Singletons no globalThis: cada rota do Next pode ter sua própria cópia deste módulo, e a
// cota/cache precisam ser UM só por processo (senão a cota vira 600/min POR ROTA).
const g = globalThis as unknown as { __pdbApiV1?: { limiter: ReturnType<typeof createRateLimiter>; cache: ReturnType<typeof createResponseCache> } };
g.__pdbApiV1 ??= { limiter: createRateLimiter(), cache: createResponseCache() };
const { limiter, cache } = g.__pdbApiV1;

async function guard(req: Request, routeName: string): Promise<Response | null> {
  const auth = authorize({ key: req.headers.get("x-api-key"), ip: clientIp(req.headers), records: await loadKeys() }, limiter);
  if (!auth.ok) return fail(auth.status, auth.codigo, auth.mensagem, auth.retryAfter ? { "retry-after": String(auth.retryAfter) } : {});
  recordUsage(auth.record.id, routeName);
  return null;
}

function toError(e: unknown): Response {
  if (e instanceof V1ErrorLike) return fail(e.status, e.codigo, e.message);
  console.error("API_V1_ERROR", e);
  return fail(500, "erro_interno", "Erro interno.");
}

// Rotas JSON: auth → cache (chave = URL sem host) → handler → envelope.
export function withPublicApi<P>(routeName: string, handler: (req: Request, params: P) => Promise<V1Result>) {
  return async (req: Request, ctx: { params: Promise<P> }): Promise<Response> => {
    const denied = await guard(req, routeName);
    if (denied) return denied;
    try {
      const params = await ctx.params;
      const u = new URL(req.url);
      const r = await cache.get(`${u.pathname}?${u.searchParams.toString()}`, async () => {
        const res = await handler(req, params);
        return { value: res, ttl: res.ttl };
      });
      return ok(r.data, r.meta);
    } catch (e) {
      return toError(e);
    }
  };
}

// Rotas binárias (imagens): auth + uso, o handler monta a Response.
export function withPublicApiRaw<P>(routeName: string, handler: (req: Request, params: P) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<P> }): Promise<Response> => {
    const denied = await guard(req, routeName);
    if (denied) return denied;
    try {
      return await handler(req, await ctx.params);
    } catch (e) {
      return toError(e);
    }
  };
}
