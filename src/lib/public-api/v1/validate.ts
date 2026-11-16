import { V1ErrorLike } from "./v1-error.ts"; // criado no Task 4

// Leitura segura de mapa vindo de JSON/Object.fromEntries: ignora chaves do protótipo.
export function ownGet<T>(obj: Record<string, T> | undefined | null, key: string): T | undefined {
  return obj && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
}

export function parseId(raw: string): number {
  if (!/^\d{1,10}$/.test(raw || "") || Number(raw) <= 0) throw new V1ErrorLike(400, "parametro_invalido", "Id inválido.");
  return Number(raw);
}

export function parseDay(raw: string | null, now = Date.now()): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw || "");
  if (!m) throw new V1ErrorLike(400, "parametro_invalido", "Use data=AAAA-MM-DD.");
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], 15); // 12h BRT
  const d = new Date(ms);
  if (d.getUTCMonth() !== +m[2] - 1) throw new V1ErrorLike(400, "parametro_invalido", "Data inválida.");
  const days = (ms - now) / 86400_000;
  if (days < -60 || days > 30) throw new V1ErrorLike(400, "parametro_invalido", "Data fora da janela (60 dias para trás, 30 para a frente).");
  return d;
}

export function isStale(updatedAtIso: string | undefined | null, maxAgeSec: number, now = Date.now()): boolean {
  const t = updatedAtIso ? Date.parse(updatedAtIso) : NaN;
  return !Number.isFinite(t) || now - t > maxAgeSec * 1000;
}
