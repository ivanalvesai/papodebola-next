// Token bucket por chave, em memória (um processo por container). Recarrega perMinute fichas/min.
export function createRateLimiter(now: () => number = Date.now) {
  const buckets = new Map<string, { tokens: number; at: number }>();
  return {
    take(id: string, perMinute: number): { ok: true } | { ok: false; retryAfter: number } {
      const t = now();
      const rate = perMinute / 60_000; // fichas por ms
      const b = buckets.get(id) ?? { tokens: perMinute, at: t };
      b.tokens = Math.min(perMinute, b.tokens + (t - b.at) * rate);
      b.at = t;
      buckets.set(id, b);
      if (b.tokens >= 1) { b.tokens -= 1; return { ok: true }; }
      return { ok: false, retryAfter: Math.max(1, Math.ceil((1 - b.tokens) / rate / 1000)) };
    },
  };
}
