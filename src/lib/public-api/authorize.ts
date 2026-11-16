import type { ErrorCode } from "./envelope.ts";
import { findKey, type ApiKeyRecord } from "./keys.ts";
import type { createRateLimiter } from "./rate-limit.ts";

export type AuthResult =
  | { ok: true; record: ApiKeyRecord }
  | { ok: false; status: number; codigo: ErrorCode; mensagem: string; retryAfter?: number };

export function authorize(
  input: { key: string | null; ip: string | null; records: ApiKeyRecord[] },
  limiter: ReturnType<typeof createRateLimiter>
): AuthResult {
  if (!input.key) return { ok: false, status: 401, codigo: "chave_ausente", mensagem: "Envie a chave no cabeçalho x-api-key." };
  const rec = findKey(input.records, input.key);
  if (!rec) return { ok: false, status: 401, codigo: "chave_invalida", mensagem: "Chave inválida." };
  if (!rec.ativa) return { ok: false, status: 403, codigo: "chave_desativada", mensagem: "Chave desativada." };
  const anyIp = rec.ipsPermitidos.includes("*");
  if (!anyIp && (!input.ip || !rec.ipsPermitidos.includes(input.ip)))
    return { ok: false, status: 403, codigo: "ip_nao_autorizado", mensagem: "IP de origem não autorizado para esta chave." };
  const t = limiter.take(rec.id, rec.cotaPorMinuto);
  if (!t.ok) return { ok: false, status: 429, codigo: "limite_excedido", mensagem: "Limite de pedidos por minuto excedido.", retryAfter: t.retryAfter };
  return { ok: true, record: rec };
}
