// Cache TTL em memória + coalescência: N pedidos simultâneos para a mesma chave = 1 carga.
// A carga decide o próprio TTL (ex.: jogo encerrado 24 h, ao vivo 10 s). Erro não é cacheado.
export function createResponseCache(now: () => number = Date.now, maxEntries = 5000) {
  const store = new Map<string, { value: unknown; exp: number }>();
  const inflight = new Map<string, Promise<unknown>>();
  return {
    has(key: string): boolean {
      const hit = store.get(key);
      return !!hit && hit.exp > now();
    },
    async get<T>(key: string, load: () => Promise<{ value: T; ttl: number }>): Promise<T> {
      const hit = store.get(key);
      if (hit && hit.exp > now()) return hit.value as T;
      const pending = inflight.get(key);
      if (pending) return pending as Promise<T>;
      const p = (async () => {
        try {
          const { value, ttl } = await load();
          if (store.size >= maxEntries) store.delete(store.keys().next().value as string);
          store.set(key, { value, exp: now() + ttl * 1000 });
          return value;
        } finally {
          inflight.delete(key);
        }
      })();
      inflight.set(key, p);
      return p;
    },
  };
}
