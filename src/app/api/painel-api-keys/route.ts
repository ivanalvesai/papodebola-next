import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { loadKeys, saveKeys } from "@/lib/public-api/keys-store";
import { newRecord, generateKey, hashKey } from "@/lib/public-api/keys";
import { readUsage } from "@/lib/public-api/usage";
import { cleanIps, clampCota, publicRecord } from "@/lib/public-api/admin";

// Aba "API" do painel: chaves da API pública /v1 (data/api-keys.json no volume compartilhado).
// GET   -> chaves (sem hash) + uso dos últimos 14 dias
// POST  -> { nome, ips, cota? }                    → cria; devolve a chave UMA vez
// PATCH -> { id, ativa?, ips?, cota?, rotate? }    → edita/desativa/troca (rotate devolve a nova chave uma vez)
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const [keys, usage] = await Promise.all([loadKeys(), readUsage(14)]);
  return NextResponse.json({ keys: keys.map(publicRecord), usage });
}

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const nome = String(b.nome || "").trim().slice(0, 80);
  const ips = cleanIps(b.ips);
  if (!nome || !ips.length) return NextResponse.json({ error: "Informe o nome e ao menos um IP válido (ou * para qualquer IP)." }, { status: 400 });
  const { key, record } = newRecord(nome, ips, clampCota(b.cota));
  await saveKeys([...(await loadKeys()), record]);
  return NextResponse.json({ key, record: publicRecord(record) });
}

export async function PATCH(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const list = await loadKeys();
  const r = list.find((x) => x.id === b.id);
  if (!r) return NextResponse.json({ error: "Chave não encontrada." }, { status: 404 });
  if (typeof b.ativa === "boolean") r.ativa = b.ativa;
  if (b.ips !== undefined) {
    const ips = cleanIps(b.ips);
    if (!ips.length) return NextResponse.json({ error: "Informe ao menos um IP válido." }, { status: 400 });
    r.ipsPermitidos = ips;
  }
  if (b.cota !== undefined) r.cotaPorMinuto = clampCota(b.cota);
  let key: string | undefined;
  if (b.rotate === true) {
    key = generateKey();
    r.hash = hashKey(key);
    r.prefixo = key.slice(0, 8);
  }
  await saveKeys(list);
  return NextResponse.json({ ok: true, ...(key ? { key } : {}) });
}
