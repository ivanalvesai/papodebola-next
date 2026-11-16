"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Chaves da API pública /v1 (site parceiro). A chave só aparece UMA vez (na criação ou na troca):
// guardamos apenas o hash. Uso gravado pelo container papodebola-api (pode atrasar ~1 min).
interface KeyRow {
  id: string;
  nome: string;
  prefixo: string;
  ipsPermitidos: string[];
  cotaPorMinuto: number;
  ativa: boolean;
  criadaEm: string;
}
type Usage = Record<string, Record<string, { total: number; rotas: Record<string, number>; ultimo: string }>>;

const TZ = "America/Sao_Paulo";
const fmt = (iso: string) => (iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");
const todayBr = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [usage, setUsage] = useState<Usage>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [ips, setIps] = useState("");
  const [cota, setCota] = useState("600");
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<{ nome: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editIps, setEditIps] = useState<Record<string, string>>({});
  const [confirmRotate, setConfirmRotate] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/painel-api-keys");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "erro");
      setKeys(d.keys || []);
      setUsage(d.usage || {});
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function call(method: "POST" | "PATCH", body: unknown) {
    setBusy(true);
    setError("");
    const r = await fetch("/api/painel-api-keys", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(d.error || "Não foi possível salvar."); return null; }
    await load();
    return d;
  }

  async function create() {
    const d = await call("POST", { nome, ips, cota: Number(cota) });
    if (d?.key) { setShown({ nome, key: d.key }); setCopied(false); setNome(""); setIps(""); setCota("600"); }
  }

  async function rotate(k: KeyRow) {
    setConfirmRotate(null);
    const d = await call("PATCH", { id: k.id, rotate: true });
    if (d?.key) { setShown({ nome: k.nome, key: d.key }); setCopied(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>;

  const hoje = usage[todayBr()] || {};
  const lastUse = (id: string) => Object.values(usage).map((d) => d[id]?.ultimo || "").sort().pop() || "";
  const total14 = (id: string) => Object.values(usage).reduce((s, d) => s + (d[id]?.total || 0), 0);

  return (
    <div className="max-w-[900px]">
      <h2 className="mb-1 text-lg font-bold text-text-primary">API pública</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Chaves para sites parceiros consumirem os dados esportivos do Papo de Bola em <code>api.papodebola.com.br/v1</code>.
        Cada chave só funciona a partir dos IPs cadastrados. Documentação: <a href="/v1/docs" target="_blank" className="text-green underline">/v1/docs</a>.
      </p>

      {error && <p className="mb-3 text-sm text-red">{error}</p>}

      {shown && (
        <div className="mb-5 rounded-lg border-2 border-green bg-card-bg p-4">
          <p className="mb-2 text-sm font-bold text-text-primary">Chave de &quot;{shown.nome}&quot;. Guarde agora: ela não aparece de novo.</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-body px-2 py-1 text-[15px]">{shown.key}</code>
            <Button onClick={() => { navigator.clipboard.writeText(shown.key); setCopied(true); }} className="bg-green text-white hover:bg-green-hover">
              {copied ? "Copiada" : "Copiar"}
            </Button>
            <Button variant="outline" onClick={() => setShown(null)}>Já guardei</Button>
          </div>
        </div>
      )}

      <section className="mb-6 rounded-lg border border-border-custom bg-card-bg p-4">
        <h3 className="mb-3 text-[15px] font-bold text-text-primary">Nova chave</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
          <label className="text-sm text-text-secondary">Nome
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Site novo" />
          </label>
          <label className="text-sm text-text-secondary">IPs do servidor (vírgula; * = qualquer)
            <Input value={ips} onChange={(e) => setIps(e.target.value)} placeholder="Ex.: 203.0.113.10" />
          </label>
          <label className="text-sm text-text-secondary">Pedidos/min
            <Input value={cota} onChange={(e) => setCota(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>
        <Button onClick={create} disabled={busy || !nome.trim() || !ips.trim()} className="mt-3 bg-green text-white hover:bg-green-hover">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar chave"}
        </Button>
      </section>

      {keys.length === 0 ? (
        <div className="rounded-lg border border-border-custom bg-card-bg p-8 text-center text-sm text-text-muted">Nenhuma chave criada.</div>
      ) : (
        <div className="divide-y divide-border-light rounded-lg border border-border-custom bg-card-bg">
          {keys.map((k) => (
            <div key={k.id} className="space-y-2 px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-[15px] font-semibold text-text-primary">{k.nome}</span>
                <code className="text-sm text-text-muted">{k.prefixo}…</code>
                <span className={`text-sm font-semibold ${k.ativa ? "text-green" : "text-red"}`}>{k.ativa ? "ativa" : "desativada"}</span>
                <span className="text-sm text-text-muted">{k.cotaPorMinuto}/min · criada {fmt(k.criadaEm)}</span>
              </div>
              <p className="text-sm text-text-secondary">
                Hoje: <b>{hoje[k.id]?.total || 0}</b> pedidos · 14 dias: <b>{total14(k.id)}</b> · último acesso: {fmt(lastUse(k.id))}
              </p>
              <div className="flex flex-wrap gap-2">
                <Input
                  className="max-w-[360px]"
                  value={editIps[k.id] ?? k.ipsPermitidos.join(", ")}
                  onChange={(e) => setEditIps({ ...editIps, [k.id]: e.target.value })}
                />
                {editIps[k.id] !== undefined && editIps[k.id] !== k.ipsPermitidos.join(", ") && (
                  <Button disabled={busy} onClick={async () => { if (await call("PATCH", { id: k.id, ips: editIps[k.id] })) { const n = { ...editIps }; delete n[k.id]; setEditIps(n); } }} className="bg-green text-white hover:bg-green-hover">
                    Salvar IPs
                  </Button>
                )}
                <Button variant="outline" disabled={busy} onClick={() => call("PATCH", { id: k.id, ativa: !k.ativa })}>
                  {k.ativa ? "Desativar" : "Ativar"}
                </Button>
                {confirmRotate === k.id ? (
                  <>
                    <Button variant="outline" autoFocus onClick={() => setConfirmRotate(null)}>Cancelar</Button>
                    <Button disabled={busy} onClick={() => rotate(k)} className="bg-red text-white hover:opacity-90">Confirmar troca</Button>
                  </>
                ) : (
                  <Button variant="outline" disabled={busy} onClick={() => setConfirmRotate(k.id)}>Trocar chave</Button>
                )}
              </div>
              {confirmRotate === k.id && (
                <p className="text-sm text-red">A chave atual para de funcionar na hora (até 30 s no servidor da API). O site parceiro precisa receber a nova.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
