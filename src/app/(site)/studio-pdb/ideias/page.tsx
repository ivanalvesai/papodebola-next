"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Lightbulb, Target, Hammer, CheckCircle2, Plus, Trash2, GripVertical,
  Loader2, ChevronDown, X, ArrowLeft, RefreshCw, LogOut, Send, ImageIcon, KanbanSquare,
} from "lucide-react";
import { PanelMenu } from "@/components/studio/panel-menu";

type Column = "ideias" | "priorizado" | "fazendo" | "concluido";
type Priority = "alta" | "media" | "baixa";

interface Idea {
  id: string; title: string; notes: string; image: string; area: string;
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
  return `ha ${Math.floor(h / 24)}d`;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function IdeiasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [quick, setQuick] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  // modal nova ideia
  const [showNew, setShowNew] = useState(false);
  const [nTitle, setNTitle] = useState("");

  // modal detalhe/edicao (expandir card)
  const [edit, setEdit] = useState<Idea | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState("");

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

  async function createNew() {
    if (!nTitle.trim()) return;
    const res = await api({ action: "create", title: nTitle, column: "ideias" });
    setNTitle(""); setShowNew(false);
    // abre o detalhe da recem-criada pra ja colar foto/notas
    if (res.ok) { const d = await res.json().catch(() => null); if (d?.idea) setEdit(d.idea); }
  }

  const move = (id: string, column: Column) => api({ action: "move", id, column });
  async function remove(id: string) {
    if (!confirm("Excluir esta ideia?")) return;
    await api({ action: "delete", id });
    setEdit(null);
  }
  function onDrop(column: Column) { if (dragId) { move(dragId, column); setDragId(null); } }

  async function clearDone() {
    const n = ideas.filter((i) => i.column === "concluido").length;
    if (n === 0) return;
    if (!confirm(`Apagar as ${n} ideia(s) concluidas? (libera espaco, nao da pra desfazer)`)) return;
    await api({ action: "clear-done" });
  }

  // ---- detalhe / edicao ----
  function openEdit(idea: Idea) { setEdit({ ...idea }); setImgUrlInput(""); }
  async function saveEdit() {
    if (!edit) return;
    await api({ action: "update", id: edit.id, updates: {
      title: edit.title, notes: edit.notes, image: edit.image, area: edit.area, priority: edit.priority,
    }});
    setEdit(null);
  }

  async function uploadImage(file: File) {
    if (!edit || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const data = await fileToBase64(file);
      const res = await fetch("/api/ideas/image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: edit.id, filename: file.name || "paste.png", data }),
      });
      if (res.ok) { const d = await res.json(); setEdit((e) => e ? { ...e, image: d.url } : e); }
    } catch { /* */ }
    setUploading(false);
  }

  function onPaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) {
      const file = item.getAsFile();
      if (file) { e.preventDefault(); uploadImage(file); }
    }
  }

  const byColumn = (c: Column) =>
    ideas.filter((i) => i.column === c)
      .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank ||
        +new Date(b.updatedAt) - +new Date(a.updatedAt));

  function logout() { document.cookie = "pdb_auth=; path=/; max-age=0"; window.location.href = "/painel-pdb-9x/login"; }

  if (loading) return <div className="h-screen flex items-center justify-center bg-body"><Loader2 className="h-8 w-8 animate-spin text-green" /></div>;

  return (
    <div className="h-screen flex flex-col bg-body font-sans">
      <header className="bg-surface border-b border-border-custom px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
        <a href="/studio-pdb" className="p-2 -ml-2 text-text-muted hover:text-green" title="Voltar ao Studio"><ArrowLeft className="h-4 w-4" /></a>
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h1 className="hidden md:block text-lg font-bold text-text-primary">Mural de Ideias</h1>
        <PanelMenu current="/studio-pdb/ideias" />
        <a href="/studio-pdb/meu-kanban"
          className="flex items-center gap-2 px-3 py-2 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:border-green hover:text-green transition-colors" title="Meu Kanban (pessoal)">
          <KanbanSquare className="h-4 w-4" /> <span className="hidden lg:inline">Meu Kanban</span>
        </a>

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
                  {done && items.length > 0 && (
                    <button onClick={clearDone} title="Apagar todos os concluidos (libera espaco)"
                      className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-text-muted hover:text-red">
                      <Trash2 className="h-3 w-3" /> Limpar
                    </button>
                  )}
                  <span className={`${done && items.length > 0 ? "" : "ml-auto"} bg-white/60 text-text-muted text-xs font-bold px-2 py-0.5 rounded-full`}>{items.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pt-2 pb-4">
                  {items.map((idea) => (
                    <div key={idea.id} draggable onDragStart={() => setDragId(idea.id)}
                      onClick={() => openEdit(idea)}
                      className={`bg-surface border border-border-custom rounded-lg shadow-sm hover:shadow-md transition cursor-pointer ${dragId === idea.id ? "opacity-40" : ""} ${done ? "opacity-70" : ""}`}>
                      <div className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-border-custom shrink-0 mt-0.5 cursor-grab" onClick={(e) => e.stopPropagation()} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${AREAS[idea.area] || AREAS.Geral}`}>{idea.area}</span>
                              <span className="flex items-center gap-1 text-[9px] text-text-muted">
                                <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY[idea.priority].dot}`} />
                                {PRIORITY[idea.priority].label}
                              </span>
                              {idea.image && <ImageIcon className="h-3 w-3 text-text-muted ml-auto" />}
                            </div>
                            <h3 className={`text-sm font-semibold leading-tight ${done ? "line-through text-text-muted" : "text-text-primary"}`}>{idea.title}</h3>
                            {idea.notes && <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{idea.notes}</p>}
                            <div className="text-[10px] text-text-muted mt-1">
                              {idea.author ? `${idea.author} · ` : ""}{timeAgo(idea.createdAt)}
                            </div>
                          </div>
                        </div>

                        {idea.image && (
                          <div className="mt-2 rounded overflow-hidden border border-border-light">
                            <Image src={idea.image} alt="" width={300} height={150} className="w-full h-28 object-cover" unoptimized />
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border-light px-3 py-1.5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-text-muted">Abrir p/ editar</span>
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

      {/* Modal nova ideia (rapida) */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <h2 className="text-base font-bold text-text-primary">Nova ideia</h2>
              <button onClick={() => setShowNew(false)} className="p-1 text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Titulo *</label>
              <input value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="Resumo da ideia" autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") createNew(); }}
                className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
              <p className="mt-2 text-[11px] text-text-muted">Apos criar, o card abre pra voce adicionar notas e colar uma foto.</p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border-custom">
              <button onClick={createNew} disabled={!nTitle.trim() || saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-40">
                <Plus className="h-4 w-4" /> Criar e abrir
              </button>
              <button onClick={() => setShowNew(false)} className="px-6 py-2.5 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:bg-body">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalhe / edicao (expandir card) */}
      {edit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEdit(null)}>
          <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()} onPaste={onPaste}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${AREAS[edit.area] || AREAS.Geral}`}>{edit.area}</span>
                <span className="text-[11px] text-text-muted">{edit.author ? `${edit.author} · ` : ""}{timeAgo(edit.createdAt)}</span>
              </div>
              <button onClick={() => setEdit(null)} className="p-1 text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Titulo</label>
                <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Notas</label>
                <textarea value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} rows={6}
                  placeholder="Detalhes, contexto, links... (cole uma imagem com Ctrl+V)"
                  className="w-full rounded-lg border border-border-custom bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none" />
              </div>

              {/* Imagem */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Foto</label>
                {edit.image ? (
                  <div className="relative rounded-lg overflow-hidden border border-border-custom">
                    <Image src={edit.image} alt="" width={640} height={360} className="w-full max-h-72 object-contain bg-body" unoptimized />
                    <button onClick={() => setEdit({ ...edit, image: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red" title="Remover foto"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-custom py-8 text-center cursor-pointer hover:border-green hover:bg-green-light/30 transition ${uploading ? "opacity-60" : ""}`}>
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin text-green" /> : <ImageIcon className="h-6 w-6 text-text-muted" />}
                    <span className="text-xs text-text-muted">
                      {uploading ? "Enviando..." : "Cole uma imagem (Ctrl+V) ou clique para escolher um arquivo"}
                    </span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                  </label>
                )}
                {!edit.image && (
                  <div className="mt-2 flex gap-2">
                    <input value={imgUrlInput} onChange={(e) => setImgUrlInput(e.target.value)}
                      placeholder="...ou cole a URL de uma imagem"
                      className="flex-1 h-9 rounded-lg border border-border-custom bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
                    <button onClick={() => { if (imgUrlInput.trim()) { setEdit({ ...edit, image: imgUrlInput.trim() }); setImgUrlInput(""); } }}
                      disabled={!imgUrlInput.trim()}
                      className="px-4 h-9 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-30">Usar</button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Area</label>
                  <select value={edit.area} onChange={(e) => setEdit({ ...edit, area: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border-custom bg-surface px-3 text-sm">
                    {AREA_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Prioridade</label>
                  <select value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value as Priority })}
                    className="w-full h-10 rounded-lg border border-border-custom bg-surface px-3 text-sm">
                    <option value="alta">Alta</option><option value="media">Media</option><option value="baixa">Baixa</option>
                  </select>
                </div>
                <div className="w-40">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Coluna</label>
                  <select value={edit.column} onChange={(e) => setEdit({ ...edit, column: e.target.value as Column })}
                    className="w-full h-10 rounded-lg border border-border-custom bg-surface px-3 text-sm">
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border-custom shrink-0">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Salvar
              </button>
              <button onClick={() => remove(edit.id)} className="px-4 py-2.5 border border-border-custom text-text-muted rounded-lg text-sm font-semibold hover:border-red hover:text-red flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
              <button onClick={() => setEdit(null)} className="px-6 py-2.5 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:bg-body">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
