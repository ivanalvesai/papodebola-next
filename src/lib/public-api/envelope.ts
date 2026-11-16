// Formato único de resposta da API pública /v1 (ver spec 2026-11-16-api-publica-design.md §3.3).
export type ErrorCode =
  | "parametro_invalido" | "chave_ausente" | "chave_invalida" | "ip_nao_autorizado"
  | "chave_desativada" | "nao_encontrado" | "limite_excedido" | "indisponivel" | "erro_interno";

export interface Meta {
  atualizadoEm: string;
  desatualizado: boolean;
  proximaAtualizacaoSugerida: number;
}

const JSON_CT = "application/json; charset=utf-8";

export function ok(data: unknown, meta: Meta, init: { headers?: Record<string, string> } = {}): Response {
  return new Response(JSON.stringify({ data, meta }), {
    status: 200,
    headers: { "content-type": JSON_CT, "cache-control": "private, no-store", ...(init.headers || {}) },
  });
}

export function fail(status: number, codigo: ErrorCode, mensagem: string, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ erro: { codigo, mensagem } }), {
    status,
    headers: { "content-type": JSON_CT, "cache-control": "no-store", ...headers },
  });
}

// Horário de Brasília fixo (-03:00; o Brasil não tem horário de verão desde 2019).
export function isoBrt(d: Date | number | string): string {
  const ms = d instanceof Date ? d.getTime() : typeof d === "number" ? d : Date.parse(d);
  const s = new Date(ms - 3 * 3600_000).toISOString().slice(0, 19);
  return `${s}-03:00`;
}
