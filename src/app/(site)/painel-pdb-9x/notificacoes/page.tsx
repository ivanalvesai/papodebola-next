"use client";

import { useEffect, useState } from "react";
import { Bell, Send, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { label: "Nova notícia", title: "📰 Papo de Bola", body: "Nova notícia no ar — confira agora!", url: "/noticias" },
  { label: "Começou o jogo", title: "🟢 Bola rolando!", body: "Começou o jogo — acompanhe o lance a lance ao vivo.", url: "/ao-vivo" },
  { label: "Copa do Mundo", title: "🏆 Copa do Mundo 2026", body: "Veja os jogos de hoje, tabela e resultados.", url: "/futebol/copa-do-mundo" },
];

export default function AdminNotificacoesPage() {
  const [subscribers, setSubscribers] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    fetch("/api/push/send")
      .then((r) => r.json())
      .then((d) => setSubscribers(d.subscribers ?? 0))
      .catch(() => setSubscribers(0));
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (!confirm(`Enviar para todos os ${subscribers ?? 0} inscritos?`)) return;

    setSending(true);
    setResult("");
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url: url.trim() || "/" }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`✅ Enviadas: ${data.sent} · falhas: ${data.failed} · removidas (inválidas): ${data.removed}`);
        // a contagem pode ter mudado (removidas)
        fetch("/api/push/send").then((r) => r.json()).then((d) => setSubscribers(d.subscribers ?? 0)).catch(() => {});
      } else {
        setResult(`❌ ${data.error || "erro ao enviar"}`);
      }
    } catch {
      setResult("❌ erro de conexão");
    }
    setSending(false);
  }

  return (
    <div className="max-w-[640px]">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-text-primary">
        <Bell className="h-5 w-5 text-green" />
        Notificações push
      </h2>
      <p className="mb-6 flex items-center gap-1.5 text-sm text-text-muted">
        <Users className="h-4 w-4" />
        {subscribers === null ? "carregando inscritos…" : `${subscribers} ${subscribers === 1 ? "inscrito" : "inscritos"}`}
      </p>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => { setTitle(p.title); setBody(p.body); setUrl(p.url); }}
            className="rounded-full border border-border-custom bg-body px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-green hover:text-green"
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="space-y-4 rounded-lg border border-border-custom bg-card-bg p-5">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Título</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="⚽ Papo de Bola" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Mensagem</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={140}
            rows={3}
            placeholder="Texto da notificação…"
            className="w-full rounded-lg border border-border-custom bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-green"
          />
          <span className="text-[11px] text-text-muted">{body.length}/140</span>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Link ao clicar</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/noticias" />
        </div>

        <Button type="submit" disabled={sending || !title.trim() || !body.trim()} className="flex items-center gap-2 bg-green text-white hover:bg-green-hover">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar para todos
        </Button>

        {result && <p className="text-sm font-semibold text-text-primary">{result}</p>}
      </form>

      <p className="mt-4 text-[11px] text-text-muted">
        A notificação vai para todos os inscritos imediatamente. O título aceita até 60 e a mensagem até 140 caracteres
        (limite prático dos sistemas de push). Inscrições inválidas/expiradas são removidas automaticamente no envio.
      </p>
    </div>
  );
}
