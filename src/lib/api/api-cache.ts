import { createHash } from "node:crypto";
import { mkdir, open, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Último dado BOM de cada endpoint da API de esportes, no volume compartilhado
// (data/api-cache). Se a API parar, fetchAllSports serve daqui: nenhuma página perde
// os dados que já mostrou. O que entra/sai do cache (feeds /live, sub-endpoints de
// jogo, TTL < 60, 404 com corpo) está em cache-policy.ts — o chamador decide antes de
// chamar saveLastGood/readLastGood. (Este módulo não importa cache-policy: é testado
// com node --test, que não resolve import relativo sem extensão.)
const DIR = join(process.cwd(), "data", "api-cache");
// Piso entre duas serializações do mesmo endpoint: o JSON.stringify de um payload grande
// custa, então dentro desse intervalo nem serializa.
const MIN_RECHECK_MS = 60 * 1000;
const MAX_BYTES = 5 * 1024 * 1024;
const lastAttempt = new Map<string, number>();
const UNCHANGED_REFRESH_MS = 24 * 60 * 60 * 1000;
const lastHash = new Map<string, { hash: string; at: number }>();

export function cacheKey(endpoint: string): string {
  return createHash("sha1").update(endpoint).digest("hex");
}

// Antes de serializar: false se o endpoint foi checado há menos de 60s (registra a tentativa).
export function shouldSerialize(key: string, now: number): boolean {
  const prev = lastAttempt.get(key);
  if (prev != null && now - prev < MIN_RECHECK_MS) return false;
  lastAttempt.set(key, now);
  return true;
}

// Depois de serializar: grava só se couber (5 MB) e se o conteúdo mudou desde a última
// escrita deste processo (hash sha1 do JSON). Conteúdo igual = pula; mudou = grava na hora.
// Conteúdo igual ainda regrava 1x/dia: mantém o mtime fresco pra limpeza por idade
// (pruneApiCache) não apagar a cópia de um endpoint em uso que não muda mais.
export function shouldWrite(key: string, sizeBytes: number, hash: string, now: number): boolean {
  if (sizeBytes > MAX_BYTES) return false;
  const prev = lastHash.get(key);
  if (prev && prev.hash === hash && now - prev.at < UNCHANGED_REFRESH_MS) return false;
  lastHash.set(key, { hash, at: now });
  return true;
}

export function __resetWrites(): void {
  lastAttempt.clear();
  lastHash.clear();
}

export async function saveLastGood(endpoint: string, data: unknown): Promise<void> {
  try {
    const key = cacheKey(endpoint);
    if (!shouldSerialize(key, Date.now())) return;
    const dataJson = JSON.stringify(data);
    if (dataJson === undefined) return;
    const hash = createHash("sha1").update(dataJson).digest("hex");
    // endpoint é a 1ª chave do arquivo: a limpeza (pruneApiCache) lê só o começo.
    const body = `{"endpoint":${JSON.stringify(endpoint)},"savedAt":${JSON.stringify(new Date().toISOString())},"data":${dataJson}}`;
    if (!shouldWrite(key, Buffer.byteLength(body), hash, Date.now())) return;
    await mkdir(DIR, { recursive: true });
    const file = join(DIR, `${key}.json`);
    // Sufixo aleatório: dev e prod compartilham o volume (mesmo pid possível nos dois containers).
    const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    try {
      await writeFile(tmp, body);
      await rename(tmp, file);
    } catch (err) {
      lastHash.delete(key); // não gravou: deixa a próxima tentar de novo
      await unlink(tmp).catch(() => {});
      throw err;
    }
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

// Endpoint gravado no arquivo, lido só do começo (arquivos chegam a 5 MB).
// Formato: {"endpoint":"...","savedAt":...}. null se não der pra ler.
export function parseCachedEndpoint(head: string): string | null {
  const m = head.match(/^\s*\{\s*"endpoint"\s*:\s*("(?:[^"\\]|\\.)*")/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as string;
  } catch {
    return null;
  }
}

async function readHead(file: string, bytes = 1024): Promise<string> {
  const fh = await open(file, "r");
  try {
    const buf = Buffer.alloc(bytes);
    const { bytesRead } = await fh.read(buf, 0, bytes, 0);
    return buf.subarray(0, bytesRead).toString("utf-8");
  } finally {
    await fh.close();
  }
}

export const PRUNE_MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;
const STRAY_TMP_MAX_AGE_MS = 60 * 60 * 1000;

// Limpeza do data/api-cache (rotina noturna /api/archive/run, só no dev): apaga arquivos
// sem uso há mais de 45 dias (mtime), .tmp órfãos de escrita interrompida e arquivos de
// endpoints que não entram mais no cache (isExcluded — ex.: sub-endpoints de jogo e /live
// gravados antes da regra). Devolve quantos apagou.
export async function pruneApiCache(opts: {
  isExcluded?: (endpoint: string) => boolean;
  maxAgeMs?: number;
  now?: number;
} = {}): Promise<{ pruned: number; scanned: number }> {
  const maxAge = opts.maxAgeMs ?? PRUNE_MAX_AGE_MS;
  const now = opts.now ?? Date.now();
  let names: string[];
  try {
    names = await readdir(DIR);
  } catch {
    return { pruned: 0, scanned: 0 };
  }
  let pruned = 0;
  let scanned = 0;
  for (const name of names) {
    const file = join(DIR, name);
    try {
      if (name.endsWith(".tmp")) {
        const st = await stat(file);
        if (now - st.mtimeMs > STRAY_TMP_MAX_AGE_MS) {
          await unlink(file);
          pruned++;
        }
        continue;
      }
      if (!name.endsWith(".json")) continue;
      scanned++;
      const st = await stat(file);
      let remove = now - st.mtimeMs > maxAge;
      if (!remove && opts.isExcluded) {
        const endpoint = parseCachedEndpoint(await readHead(file));
        remove = endpoint != null && opts.isExcluded(endpoint);
      }
      if (remove) {
        await unlink(file);
        pruned++;
      }
    } catch {
      /* arquivo sumiu no meio (outro container) ou sem permissão: segue */
    }
  }
  return { pruned, scanned };
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
