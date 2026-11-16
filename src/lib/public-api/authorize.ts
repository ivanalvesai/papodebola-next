import type { ErrorCode } from "./envelope.ts";
import { findKey, type ApiKeyRecord } from "./keys.ts";
import type { createRateLimiter } from "./rate-limit.ts";
import type { ApiGate } from "./gate.ts";

export type AuthResult =
  | { ok: true; record: ApiKeyRecord }
  | { ok: false; status: number; codigo: ErrorCode; mensagem: string; retryAfter?: number };

export function authorize(
  input: { key: string | null; ip: string | null; records: ApiKeyRecord[]; mode?: ApiGate },
  limiter: ReturnType<typeof createRateLimiter>
): AuthResult {
  if (!input.key) return { ok: false, status: 401, codigo: "chave_ausente", mensagem: "Envie a chave no cabeçalho x-api-key." };
  const rec = findKey(input.records, input.key);
  if (!rec) return { ok: false, status: 401, codigo: "chave_invalida", mensagem: "Chave inválida." };
  if (!rec.ativa) return { ok: false, status: 403, codigo: "chave_desativada", mensagem: "Chave desativada." };
  const anyIp = rec.ipsPermitidos.includes("*");
  // No dev a porta é alcançável sem o nginx, então o IP não é confiável: só chaves de teste ("*").
  if (input.mode === "dev" && !anyIp)
    return { ok: false, status: 403, codigo: "ip_nao_autorizado", mensagem: "No ambiente de teste só valem chaves de teste (IP *)." };
  if (!anyIp && (!input.ip || !rec.ipsPermitidos.includes(input.ip)))
    return { ok: false, status: 403, codigo: "ip_nao_autorizado", mensagem: "IP de origem não autorizado para esta chave." };
  const t = limiter.take(rec.id, Number(rec.cotaPorMinuto) || 600);
  if (!t.ok) return { ok: false, status: 429, codigo: "limite_excedido", mensagem: "Limite de pedidos por minuto excedido.", retryAfter: t.retryAfter };
  return { ok: true, record: rec };
}
