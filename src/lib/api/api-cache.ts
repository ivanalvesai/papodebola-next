import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Último dado BOM de cada endpoint da API de esportes, no volume compartilhado
// (data/api-cache). Se a API parar, fetchAllSports serve daqui: nenhuma página perde
// os dados que já mostrou. Endpoints ao vivo (revalidate < 60) ficam de fora: dado
// velho de "ao vivo" engana mais do que vazio (incidente de 16/07).
const DIR = join(process.cwd(), "data", "api-cache");
const MIN_WRITE_INTERVAL_MS = 10 * 60 * 1000;
const MAX_BYTES = 5 * 1024 * 1024;
const LIVE_TTL_LIMIT = 60;
const lastWrite = new Map<string, number>();

export function cacheKey(endpoint: string): string {
  return createHash("sha1").update(endpoint).digest("hex");
}

export function shouldFallback(ok: boolean, revalidate: number): boolean {
  return !ok && revalidate >= LIVE_TTL_LIMIT;
}

export function shouldWrite(key: string, now: number, sizeBytes: number): boolean {
  if (sizeBytes > MAX_BYTES) return false;
  const prev = lastWrite.get(key);
  if (prev != null && now - prev < MIN_WRITE_INTERVAL_MS) return false;
  lastWrite.set(key, now);
  return true;
}

export function __resetWrites(): void {
  lastWrite.clear();
}

export async function saveLastGood(endpoint: string, data: unknown): Promise<void> {
  try {
    const key = cacheKey(endpoint);
    const body = JSON.stringify({ endpoint, savedAt: new Date().toISOString(), data });
    if (!shouldWrite(key, Date.now(), Buffer.byteLength(body))) return;
    await mkdir(DIR, { recursive: true });
    const file = join(DIR, `${key}.json`);
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, body);
    await rename(tmp, file);
  } catch {
    /* disco cheio/somente leitura: não derruba o render */
  }
}

export async function readLastGood<T>(endpoint: string): Promise<T | null> {
  try {
    const raw = await readFile(join(DIR, `${cacheKey(endpoint)}.json`), "utf-8");
    const parsed = JSON.parse(raw) as { endpoint: string; data: T };
    return parsed.endpoint === endpoint ? parsed.data : null;
  } catch {
    return null;
  }
}

// Disjuntor (circuit breaker): com a API fora, ~40 endpoints numa página não podem
// tentar a rede um a um (medido: 35s com 403 rápido, minutos num timeout real de
// 8s). Depois de falhas consecutivas de OUTAGE (não erro semântico tipo endpoint
// deprecated), fetchAllSports pula a rede por 60s e serve direto do disco.
const BREAKER_FAILURE_THRESHOLD = 5;
const BREAKER_OPEN_MS = 60_000;
let consecutiveFailures = 0;
let breakerOpenUntil = 0;

// ok=false conta como falha; qualquer sucesso reseta a contagem (inclusive o
// "sucesso" do half-open, que fecha o disjuntor de novo).
export function recordResult(ok: boolean, now: number): void {
  if (ok) {
    consecutiveFailures = 0;
    breakerOpenUntil = 0;
    return;
  }
  consecutiveFailures++;
  if (consecutiveFailures >= BREAKER_FAILURE_THRESHOLD) {
    breakerOpenUntil = now + BREAKER_OPEN_MS;
  }
}

// Aberto = pula a rede. Passado o breakerOpenUntil, fica "half-open": esta função
// já devolve false (deixa passar), e o resultado dessa tentativa decide via
// recordResult se fecha (sucesso) ou reabre por mais 60s (falha).
export function breakerOpen(now: number): boolean {
  return now < breakerOpenUntil;
}

export function __resetBreaker(): void {
  consecutiveFailures = 0;
  breakerOpenUntil = 0;
}
