import type { ApiKeyRecord } from "./keys.ts";

// Validação dos dados da aba API do painel (criar/editar chaves).
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+$/i;

export function cleanIps(v: unknown): string[] {
  const list = (Array.isArray(v) ? v : String(v ?? "").split(/[\s,;]+/)).map((s) => String(s).trim());
  return [...new Set(list.filter((s) => s === "*" || IPV4.test(s) || (s.includes(":") && IPV6.test(s))))];
}

export function clampCota(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n) || v === undefined || v === null || v === "") return 600;
  return Math.min(Math.max(Math.round(n), 10), 6000);
}

export function publicRecord(r: ApiKeyRecord): Omit<ApiKeyRecord, "hash"> {
  const { hash: _hash, ...rest } = r;
  return rest;
}
