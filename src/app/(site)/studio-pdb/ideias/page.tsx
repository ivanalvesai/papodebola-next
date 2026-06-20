"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb, Target, Hammer, CheckCircle2, Plus, Trash2, GripVertical,
  Loader2, ChevronDown, X, ArrowLeft, RefreshCw, LogOut, Pencil, Send,
} from "lucide-react";
import { PanelMenu } from "@/components/studio/panel-menu";

type Column = "ideias" | "priorizado" | "fazendo" | "concluido";
type Priority = "alta" | "media" | "baixa";

interface Idea {
  id: string; title: string; notes: string; area: string;
  priority: Priority; column: Column; author: string;
  createdAt: string; updatedAt: string;
}

const COLUMNS: { key: Column; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "ideias", label: "Ideias", icon: Lightbulb, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { key: "priorizado", label: "Priorizado", icon: Target, color: "text-blue", bg: "bg-blue-light border-blue/20" },
  { key: "fazendo", label: "Fazendo", icon: Hammer, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { key: "concluido", label: "Concluido", icon: CheckCircle2, color: "text-green", bg: "bg-green-light border-green/20" },
];

const AREAS: Record<string, string> = {
  SEO: "bg-green-light text-green",
  "Conteudo": "bg-blue-light text-blue",
  Performance: "bg-purple-100 text-purple-700",
  UX: "bg-pink-100 text-pink-700",
  Bug: "bg-red-light text-red",
  Copa: "bg-yellow-100 text-yellow-700",
  Tenis: "bg-teal-100 text-teal-700",
  Geral: "bg-body text-text-muted",
};
const AREA_KEYS = Object.keys(AREAS);

const PRIORITY: Record<Priority, { label: string; dot: string; rank: number }> = {
  alta: { label: "Alta", dot: "bg-red", rank: 0 },
  media: { label: "Media", dot: "bg-yellow-500", rank: 1 },
  baixa: { label: "Baixa", dot: "bg-text-muted", rank: 2 },
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `ha ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `ha ${h}h`;
  const d = Math.floor(h / 24);
  return `ha ${d}d`;
}

export default function IdeiasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [quick, setQuick] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // modal nova ideia (detalhada)
  const [showNew, setShowNew] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nNotes, setNNotes] = useState("");
  const [nArea, setNArea] = useState("Geral");
  const [nPriority, setNPriority] = useState<Priority>("media");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ideas");
      if (res.ok) { const d = await res.json(); setIdeas(d.ideas || []); }
    } catch { /* */ }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function api(body: Record<string, unknown>) {
    setSaving(true);
    const res = await fetch("/api/ideas", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) await load();
    setSaving(false);
    return res;
  }

  async function quickAdd() {
    const title = quick.trim();
    if (!title) return;
    setQuick("");
    await api({ action: "create", title, column: "ideias" });
  }

  async function createDetailed() {
    if (!nTitle.trim()) return;
    await api({ action: "create", title: nTitle, notes: nNotes, area: nArea, priority: nPriority, column: "ideias" });
    setNTitle(""); setNNotes(""); setNArea("Geral"); setNPriority("media"); setShowNew(false);
  }

  const move = (id: string, column: Column) => api({ action: "move", id, column });
  const patch = (id: string, updates: Partial<Idea>) => api({ action: "update", id, updates });
  async function remove(id: string) { if (confirm("Excluir esta ideia?")) await api({ action: "delete", id }); }

  function onDrop(column: Column) { if (dragId) { move(dragId, column); setDragId(null); } }

  const byColumn = (c: Column) =>
    ideas
      .filter((i) => i.column === c)
      .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank ||
        +new Date(b.updatedAt) - +new Date(a.updatedAt));

  function logout() { document.cookie = "pdb_auth=; path=/; max-age=0"; window.location.href = "/painel-pdb-9x/login"; }

  if (loading) return <div className="h-screen flex items-center justify-center bg-body"><Loader2 className="h-8 w-8 animate-spin text-green" /></div>;

  return (
    <div className="h-screen flex flex-col bg-body font-sans">
      {/* Top bar */}
      <header className="bg-surface border-b border-border-custom px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
        <a href="/studio-pdb" className="p-2 -ml-2 text-text-muted hover:text-green" title="Voltar ao Studio"><ArrowLeft className="h-4 w-4" /></a>
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h1 className="hidden md:block text-lg font-bold text-text-primary">Mural de Ideias</h1>
        <PanelMenu current="/studio-pdb/ideias" />

        {/* Captura rapida */}
        <div className="flex-1 max-w-md mx-auto flex items-center gap-2">
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") quickAdd(); }}
            placeholder="Captura rapida: digite uma ideia e Enter..."
            className="w-full h-9 rounded-lg border border-border-custom bg-body px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
          />
          <button onClick={quickAdd} disabled={!quick.trim() || saving}
            className="shrink-0 h-9 px-3 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-40 flex items-center gap-1">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>

        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-3 py-2 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:border-green hover:text-green">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova ideia</span>
        </button>
        <button onClick={() => load()} className="p-2 text-text-muted hover:text-green" title="Atualizar"><RefreshCw className="h-4 w-4" /></button>
        <button onClick={logout} className="p-2 text-text-muted hover:text-red" title="Sair"><LogOut className="h-4 w-4" /></button>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-4 sm:p-6 h-full min-w-max">
          {COLUMNS.map((col) => {
            const items = byColumn(col.key);
            const done = col.key === "concluido";
            return (
              <div key={col.key} className="w-[320px] flex flex-col shrink-0" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(col.key)}>
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border ${col.bg}`}>
                  <col.icon className={`h-4 w-4 ${col.color}`} />
                  <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                  <span className="ml-auto bg-white/60 text-text-muted text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pt-2 pb-4">
                  {items.map((idea) => (
                    <div key={idea.id} draggable onDragStart={() => setDragId(idea.id)}
                      className={`bg-surface border border-border-custom rounded-lg shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing ${dragId === idea.id ? "opacity-40" : ""} ${done ? "opacity-70" : ""}`}>
                      <div className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-border-custom shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${AREAS[idea.area] || AREAS.Geral}`}>{idea.area}</span>
                              <span className="flex items-center gap-1 text-[9px] text-text-muted">
                                <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY[idea.priority].dot}`} />
                                {PRIORITY[idea.priority].label}
                              </span>
                            </div>
                            <h3 className={`text-sm font-semibold leading-tight ${done ? "line-through text-text-muted" : "text-text-primary"}`}>{idea.title}</h3>
                            <div className="text-[10px] text-text-muted mt-1">
                              {idea.author ? `${idea.author} · ` : ""}{timeAgo(idea.createdAt)}
                            </div>
                          </div>
                        </div>

                        {expanded === idea.id && (
                          <div className="mt-2 space-y-2">
                            {idea.notes && (
                              <div className="p-2 bg-body rounded text-xs text-text-secondary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{idea.notes}</div>
                            )}
                            <div className="flex gap-2">
                              <select value={idea.area} onChange={(e) => patch(idea.id, { area: e.target.value })}
                                className="flex-1 h-8 rounded border border-border-custom bg-surface px-2 text-xs">
                                {AREA_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}
                              </select>
                              <select value={idea.priority} onChange={(e) => patch(idea.id, { priority: e.target.value as Priority })}
                                className="h-8 rounded border border-border-custom bg-surface px-2 text-xs">
                                <option value="alta">Alta</option><option value="media">Media</option><option value="baixa">Baixa</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border-light px-3 py-2 flex items-center gap-1">
                        <button onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}
                          className="p-1.5 text-text-muted hover:text-text-primary rounded" title="Notas / editar"><Pencil className="h-3.5 w-3.5" /></button>
                        <div className="flex-1" />
                        <div className="relative group">
                          <button className="p-1.5 text-text-muted hover:text-green rounded" title="Mover"><ChevronDown className="h-3.5 w-3.5" /></button>
                          <div className="absolute right-0 bottom-full mb-1 bg-surface border border-border-custom rounded-lg shadow-lg p-1 hidden group-hover:block z-10 min-w-[150px]">
                            {COLUMNS.filter((c) => c.key !== idea.column).map((c) => (
                              <button key={c.key} onClick={() => move(idea.id, c.key)}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-text-secondary hover:text-green hover:bg-green-light rounded">
                                <c.icon className="h-3 w-3" /> {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => remove(idea.id)} className="p-1.5 text-text-muted hover:text-red rounded" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-text-muted">
                      <col.icon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal nova ideia detalhada */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <h2 className="text-base font-bold text-text-primary">Nova ideia</h2>
              <button onClick={() => setShowNew(false)} className="p-1 text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Titulo *</label>
                <input value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="Resumo da ideia" autoFocus
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Notas</label>
                <textarea value={nNotes} onChange={(e) => setNNotes(e.target.value)} rows={5} placeholder="Detalhes, contexto, links..."
                  className="w-full rounded-lg border border-border-custom bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Area</label>
                  <select value={nArea} onChange={(e) => setNArea(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border-custom bg-surface px-3 text-sm">
                    {AREA_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Prioridade</label>
                  <select value={nPriority} onChange={(e) => setNPriority(e.target.value as Priority)}
                    className="w-full h-10 rounded-lg border border-border-custom bg-surface px-3 text-sm">
                    <option value="alta">Alta</option><option value="media">Media</option><option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border-custom">
              <button onClick={createDetailed} disabled={!nTitle.trim() || saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-40">
                <Plus className="h-4 w-4" /> Adicionar
              </button>
              <button onClick={() => setShowNew(false)} className="px-6 py-2.5 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:bg-body">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
