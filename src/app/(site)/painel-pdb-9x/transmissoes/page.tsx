"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Canal exato de cada jogo. O que for salvo aqui aparece no "Quando é e onde assistir" da
// página do jogo e na aba "Onde assistir" dos times (se o jogo tiver guia publicado, vale o do guia).
interface Row {
  id: number;
  home: string;
  away: string;
  timestamp: number;
  league: string;
  champSlug: string;
  channels: string;
  updatedBy: string;
}

const CHIPS = ["Premiere", "Globo", "SporTV", "Globoplay", "Record", "CazéTV", "Amazon Prime Video", "ge tv", "ESPN", "Disney+", "Paramount+", "SBT", "TNT Sports", "HBO Max"];

const TZ = "America/Sao_Paulo";
const dayLabel = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", timeZone: TZ });
const hour = (ts: number) => new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

// "Globo, SporTV, Premiere" -> "Globo, SporTV e Premiere"
function joinChannels(list: string[]): string {
  const l = list.map((s) => s.trim()).filter(Boolean);
  return l.length <= 1 ? l.join("") : `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`;
}
const splitChannels = (s: string) => s.split(/\s*(?:,|\se\s)\s*/).map((x) => x.trim()).filter(Boolean);

export default function TransmissoesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [league, setLeague] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/transmissoes?days=10");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "erro");
      setRows(d.matches || []);
      setDraft(Object.fromEntries((d.matches || []).map((m: Row) => [m.id, m.channels])));
      const first = (d.matches || []).find((m: Row) => /Série A/.test(m.league));
      setLeague((cur) => cur || first?.league || "");
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const leagues = useMemo(() => [...new Set(rows.map((r) => r.league))].sort(), [rows]);
  const visible = rows.filter((r) => !league || r.league === league);
  const byDay = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of visible) {
      const k = dayLabel(r.timestamp);
      m.set(k, [...(m.get(k) || []), r]);
    }
    return [...m.entries()];
  }, [visible]);

  function toggleChip(id: number, chip: string) {
    const cur = splitChannels(draft[id] || "");
    const next = cur.includes(chip) ? cur.filter((c) => c !== chip) : [...cur, chip];
    setDraft({ ...draft, [id]: joinChannels(next) });
    setSaved({ ...saved, [id]: false });
  }

  async function save(r: Row) {
    setSaving(r.id);
    const res = await fetch("/api/transmissoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: r.id, channels: draft[r.id] || "", home: r.home, away: r.away, league: r.league, timestamp: r.timestamp }),
    });
    setSaving(null);
    if (res.ok) {
      setRows(rows.map((x) => (x.id === r.id ? { ...x, channels: draft[r.id] || "" } : x)));
      setSaved({ ...saved, [r.id]: true });
    } else {
      setError("Não foi possível salvar. Tente de novo.");
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>;

  return (
    <div className="max-w-[900px]">
      <h2 className="mb-1 text-lg font-bold text-text-primary">Transmissões da semana</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Preencha onde cada jogo vai passar, de preferência com a tabela detalhada da CBF ou a grade das emissoras.
        O canal salvo aparece na página do jogo e na aba &quot;Onde assistir&quot; dos times. Campo vazio = a página mostra a lista
        de emissoras com direitos do campeonato. Se o jogo tiver guia de onde assistir publicado, vale o canal do guia.
      </p>

      {error && <p className="mb-3 text-sm text-red">{error}</p>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-text-secondary">Campeonato</label>
        <select value={league} onChange={(e) => setLeague(e.target.value)} className="h-9 rounded-md border border-border-custom bg-surface px-3 text-sm">
          <option value="">Todos</option>
          {leagues.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <span className="text-sm text-text-muted">{visible.length} jogos nos próximos 10 dias</span>
      </div>

      {byDay.length === 0 && (
        <div className="rounded-lg border border-border-custom bg-card-bg p-8 text-center text-sm text-text-muted">Nenhum jogo nos próximos dias.</div>
      )}

      {byDay.map(([day, list]) => (
        <section key={day} className="mb-5">
          <h3 className="mb-2 text-sm font-bold capitalize text-text-primary">{day}</h3>
          <div className="divide-y divide-border-light rounded-lg border border-border-custom bg-card-bg">
            {list.map((r) => {
              const dirty = (draft[r.id] || "") !== (r.channels || "");
              const cur = splitChannels(draft[r.id] || "");
              return (
                <div key={r.id} className="space-y-2 px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-sm font-bold tabular-nums text-green">{hour(r.timestamp)}</span>
                    <span className="text-[15px] font-semibold text-text-primary">{r.home} x {r.away}</span>
                    {!league && <span className="text-sm text-text-muted">{r.league}</span>}
                    {r.channels && !dirty && <span className="text-sm text-text-muted">salvo{r.updatedBy ? ` por ${r.updatedBy}` : ""}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CHIPS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleChip(r.id, c)}
                        className={`rounded-full border px-2.5 py-1 text-sm ${cur.includes(c) ? "border-green bg-green text-white" : "border-border-custom bg-body text-text-secondary hover:border-green"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={draft[r.id] || ""}
                      onChange={(e) => { setDraft({ ...draft, [r.id]: e.target.value }); setSaved({ ...saved, [r.id]: false }); }}
                      placeholder="Ex.: Premiere   ou   Globo, SporTV e Premiere"
                    />
                    <Button onClick={() => save(r)} disabled={!dirty || saving === r.id} className="bg-green text-white hover:bg-green-hover">
                      {saving === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : saved[r.id] ? <Check className="h-4 w-4" /> : "Salvar"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
