import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export interface ApiKeyRecord {
  id: string; nome: string; hash: string; prefixo: string;
  ipsPermitidos: string[]; cotaPorMinuto: number; ativa: boolean; criadaEm: string;
}

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateKey(): string {
  const bytes = randomBytes(40);
  let s = "";
  for (const b of bytes) s += ALPHA[b % ALPHA.length];
  return `pdb_${s}`;
}

export const hashKey = (k: string) => createHash("sha256").update(k).digest("hex");

export function newRecord(nome: string, ips: string[], cota = 600): { key: string; record: ApiKeyRecord } {
  const key = generateKey();
  return {
    key,
    record: { id: randomUUID(), nome, hash: hashKey(key), prefixo: key.slice(0, 8), ipsPermitidos: ips, cotaPorMinuto: cota, ativa: true, criadaEm: new Date().toISOString() },
  };
}

export function findKey(records: ApiKeyRecord[], key: string): ApiKeyRecord | null {
  if (!key) return null;
  const h = Buffer.from(hashKey(key), "hex");
  for (const r of records) {
    const rh = Buffer.from(r.hash || "", "hex");
    if (rh.length === h.length && timingSafeEqual(rh, h)) return r;
  }
  return null;
}
