import type { createResponseCache } from "./response-cache.ts";
import { V1ErrorLike } from "./v1/v1-error.ts";

// Cache do resultado da rota, incluindo 404 (cache negativo de 2 min): um id inventado em loop não
// vira consulta ao fornecedor a cada pedido. Outros erros (500/503) não ficam em cache.
const NEGATIVE_TTL = 120;
type Cached<T> = { ok: true; value: T } | { ok: false; status: number; codigo: V1ErrorLike["codigo"]; message: string };

export async function runCached<T extends { ttl: number }>(
  cache: ReturnType<typeof createResponseCache>,
  key: string,
  handler: () => Promise<T>
): Promise<T> {
  const r = await cache.get<Cached<T>>(key, async () => {
    try {
      const value = await handler();
      return { value: { ok: true, value }, ttl: value.ttl };
    } catch (e) {
      if (e instanceof V1ErrorLike && e.status === 404) return { value: { ok: false, status: 404, codigo: e.codigo, message: e.message }, ttl: NEGATIVE_TTL };
      throw e;
    }
  });
  if (r.ok) return r.value;
  throw new V1ErrorLike(r.status, r.codigo, r.message);
}
