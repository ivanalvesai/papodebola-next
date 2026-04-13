"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Sparkles, Plus, Trash2, ExternalLink, Send, GripVertical,
  Loader2, ChevronDown, X, Goal, LogOut, RefreshCw,
  Lightbulb, Pencil, CheckCircle, Globe, Eye,
} from "lucide-react";

type Column = "sugestoes" | "edicao" | "aprovado" | "publicado";

interface Post {
  id: string; title: string; text: string; image: string;
  category: string; source: string; rssUrl: string;
  column: Column; wpId: number | null; wpEditUrl: string;
  createdAt: string; updatedAt: string;
}

const COLUMNS: { key: Column; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "sugestoes", label: "Sugestoes IA", icon: Lightbulb, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { key: "edicao", label: "Em Edicao", icon: Pencil, color: "text-blue", bg: "bg-blue-light border-blue/20" },
  { key: "aprovado", label: "Aprovado", icon: CheckCircle, color: "text-green", bg: "bg-green-light border-green/20" },
  { key: "publicado", label: "Publicado", icon: Globe, color: "text-text-muted", bg: "bg-body border-border-custom" },
];

const CATEGORIES = [
  "Futebol Brasileiro", "Brasileirao", "Copa do Brasil", "Copa do Mundo",
  "Selecao Brasileira", "Copa Libertadores", "Champions League",
  "Premier League", "La Liga", "Futebol Internacional", "Mercado da Bola",
];

export default function StudioPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("Futebol Brasileiro");
  const [dragId, setDragId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/kanban");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  async function apiAction(body: Record<string, unknown>) {
    const res = await fetch("/api/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) await loadPosts();
    return res;
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/kanban/generate", { method: "POST" });
      if (res.ok) await loadPosts();
      else alert("Erro ao gerar sugestoes");
    } catch { alert("Erro de conexao"); }
    setGenerating(false);
  }

  async function handleCreateManual() {
    if (!newTitle.trim()) return;
    await apiAction({ action: "create", title: newTitle, text: newText, category: newCategory, source: "manual", column: "edicao" });
    setNewTitle(""); setNewText(""); setShowNewPost(false);
  }

  async function handleMove(id: string, column: Column) {
    await apiAction({ action: "move", id, column });
  }

  async function handlePublish(id: string) {
    if (!confirm("Publicar este post no WordPress?")) return;
    const res = await apiAction({ action: "publish", id });
    if (res.ok) {
      const data = await res.json();
      if (data.wpEditUrl) window.open(data.wpEditUrl, "_blank");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este post?")) return;
    await apiAction({ action: "delete", id });
  }

  function handleDragStart(id: string) { setDragId(id); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }
  function handleDrop(column: Column) {
    if (dragId) { handleMove(dragId, column); setDragId(null); }
  }

  function handleLogout() {
    document.cookie = "pdb_auth=; path=/; max-age=0";
    window.location.href = "/painel-pdb-9x/login";
  }

  const columnPosts = (col: Column) => posts.filter((p) => p.column === col);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-body">
        <Loader2 className="h-8 w-8 animate-spin text-green" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-body font-sans">
      {/* Top bar */}
      <header className="bg-surface border-b border-border-custom px-6 py-3 flex items-center gap-4 shrink-0">
        <Goal className="h-6 w-6 text-green" />
        <h1 className="text-lg font-bold text-text-primary">Studio</h1>
        <span className="text-xs text-text-muted">Papo de Bola</span>

        <div className="flex-1" />

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Gerar Sugestoes IA
        </button>

        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:border-green hover:text-green transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Post
        </button>

        <button onClick={() => loadPosts()} className="p-2 text-text-muted hover:text-green" title="Atualizar">
          <RefreshCw className="h-4 w-4" />
        </button>

        <a href="/painel-pdb-9x/artigos" className="p-2 text-text-muted hover:text-green" title="Painel Admin">
          <ExternalLink className="h-4 w-4" />
        </a>

        <button onClick={handleLogout} className="p-2 text-text-muted hover:text-red" title="Sair">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="w-[340px] flex flex-col shrink-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.key)}
            >
              {/* Column header */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border ${col.bg}`}>
                <col.icon className={`h-4 w-4 ${col.color}`} />
                <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                <span className="ml-auto bg-white/60 text-text-muted text-xs font-bold px-2 py-0.5 rounded-full">
                  {columnPosts(col.key).length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-2 pt-2 pb-4">
                {columnPosts(col.key).map((post) => (
                  <div
                    key={post.id}
                    draggable
                    onDragStart={() => handleDragStart(post.id)}
                    className={`bg-surface border border-border-custom rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
                      dragId === post.id ? "opacity-40" : ""
                    }`}
                  >
                    {/* Card header */}
                    <div className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-border-custom shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-light text-green">
                              {post.category}
                            </span>
                            <span className="text-[9px] text-text-muted">
                              {post.source === "rss-ia" ? "IA" : "Manual"}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-text-primary leading-tight line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="text-[10px] text-text-muted mt-1">
                            {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>

                      {/* Image preview */}
                      {post.image && (
                        <div className="mt-2 rounded overflow-hidden">
                          <Image src={post.image} alt="" width={300} height={150} className="w-full h-24 object-cover" unoptimized />
                        </div>
                      )}

                      {/* Expanded text */}
                      {expandedCard === post.id && (
                        <div className="mt-2 p-2 bg-body rounded text-xs text-text-secondary leading-relaxed max-h-40 overflow-y-auto">
                          {post.text || "Sem texto"}
                        </div>
                      )}
                    </div>

                    {/* Card actions */}
                    <div className="border-t border-border-light px-3 py-2 flex items-center gap-1">
                      <button
                        onClick={() => setExpandedCard(expandedCard === post.id ? null : post.id)}
                        className="p-1.5 text-text-muted hover:text-text-primary rounded" title="Ver texto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {post.rssUrl && (
                        <a href={post.rssUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-text-muted hover:text-blue rounded" title="Fonte original"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {post.wpEditUrl && (
                        <a href={post.wpEditUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-text-muted hover:text-green rounded" title="Editar no WordPress"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </a>
                      )}

                      <div className="flex-1" />

                      {/* Move buttons */}
                      {post.column !== "publicado" && (
                        <div className="relative group">
                          <button className="p-1.5 text-text-muted hover:text-green rounded" title="Mover">
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute right-0 bottom-full mb-1 bg-surface border border-border-custom rounded-lg shadow-lg p-1 hidden group-hover:block z-10 min-w-[140px]">
                            {COLUMNS.filter((c) => c.key !== post.column && c.key !== "publicado").map((c) => (
                              <button
                                key={c.key}
                                onClick={() => handleMove(post.id, c.key)}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-text-secondary hover:text-green hover:bg-green-light rounded"
                              >
                                <c.icon className="h-3 w-3" />
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {post.column === "aprovado" && (
                        <button
                          onClick={() => handlePublish(post.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-green text-white text-[11px] font-semibold rounded hover:bg-green-hover"
                        >
                          <Send className="h-3 w-3" />
                          Publicar
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-text-muted hover:text-red rounded" title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {columnPosts(col.key).length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    <col.icon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Nenhum post</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New post modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNewPost(false)}>
          <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <h2 className="text-base font-bold text-text-primary">Novo Post</h2>
              <button onClick={() => setShowNewPost(false)} className="p-1 text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Titulo *</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titulo do post"
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Texto</label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Conteudo do post (pode editar depois)"
                  rows={6}
                  className="w-full rounded-lg border border-border-custom bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border-custom">
              <button
                onClick={handleCreateManual}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover"
              >
                <Plus className="h-4 w-4" />
                Criar Post
              </button>
              <button
                onClick={() => setShowNewPost(false)}
                className="px-6 py-2.5 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:bg-body"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
