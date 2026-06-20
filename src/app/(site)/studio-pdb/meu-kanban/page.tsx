"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Plus, Trash2, GripVertical, Loader2, ChevronDown, X, ArrowLeft, RefreshCw,
  LogOut, ImageIcon, KanbanSquare, FolderKanban, Check, Pencil,
} from "lucide-react";
import { PanelMenu } from "@/components/studio/panel-menu";
import { ImageLightbox } from "@/components/studio/image-lightbox";
import { useConfirm } from "@/components/studio/use-confirm";

type Priority = "alta" | "media" | "baixa";
interface Column { id: string; name: string; }
interface Board { id: string; owner: string; name: string; org: string; color: string; columns: Column[]; createdAt: string; }
interface Card {
  id: string; boardId: string; owner: string; columnId: string;
  title: string; notes: string; images: string[]; priority: Priority;
  createdAt: string; updatedAt: string;
}

const COLORS: Record<string, string> = {
  green: "bg-green", blue: "bg-blue", purple: "bg-purple-500", pink: "bg-pink-500",
  orange: "bg-orange-500", red: "bg-red", teal: "bg-teal-500", yellow: "bg-yellow-500",
};
const COLOR_KEYS = Object.keys(COLORS);

const PRIORITY: Record<Priority, { label: string; dot: string; rank: number }> = {
  alta: { label: "Alta", dot: "bg-red", rank: 0 },
  media: { label: "Media", dot: "bg-yellow-500", rank: 1 },
  baixa: { label: "Baixa", dot: "bg-text-muted", rank: 2 },
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function MeuKanbanPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragCard, setDragCard] = useState<string | null>(null);

  // novo quadro
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [bName, setBName] = useState("");
  const [bOrg, setBOrg] = useState("");
  const [bColor, setBColor] = useState("green");

  // editar quadro
  const [editBoard, setEditBoard] = useState<Board | null>(null);

  // card modal + nova coluna + quick add
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();
  const [newColName, setNewColName] = useState("");
  const [addingCol, setAddingCol] = useState(false);
  const [quickCard, setQuickCard] = useState<Record<string, string>>({});
  const [renameCol, setRenameCol] = useState<string | null>(null);
  const [renameColVal, setRenameColVal] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/meu-kanban");
      if (res.ok) {
        const d = await res.json();
        setBoards(d.boards || []);
        setCards(d.cards || []);
        setActiveId((cur) => cur && (d.boards || []).some((b: Board) => b.id === cur) ? cur : (d.boards?.[0]?.id || null));
      }
    } catch { /* */ }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function api(body: Record<string, unknown>) {
    setSaving(true);
    const res = await fetch("/api/meu-kanban", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) await load();
    setSaving(false);
    return res;
  }

  const active = boards.find((b) => b.id === activeId) || null;

  // boards agrupados por organizacao
  const grouped = useMemo(() => {
    const g: Record<string, Board[]> = {};
    for (const b of boards) { (g[b.org || "Sem organizacao"] ||= []).push(b); }
    return Object.entries(g).sort((a, b) => a[0].localeCompare(b[0]));
  }, [boards]);

  // ---- quadros ----
  async function createBoard() {
    if (!bName.trim()) return;
    const res = await api({ action: "create-board", name: bName, org: bOrg, color: bColor });
    setBName(""); setBOrg(""); setBColor("green"); setShowNewBoard(false);
    if (res.ok) { const d = await res.json().catch(() => null); if (d?.board) setActiveId(d.board.id); }
  }
  async function saveBoard() {
    if (!editBoard) return;
    await api({ action: "update-board", id: editBoard.id, updates: { name: editBoard.name, org: editBoard.org, color: editBoard.color } });
    setEditBoard(null);
  }
  async function deleteBoard(id: string) {
    if (!(await confirm("Excluir este quadro e TODOS os cards dele? Esta acao nao pode ser desfeita."))) return;
    await api({ action: "delete-board", id });
    setEditBoard(null);
  }

  // ---- colunas ----
  async function addColumn() {
    if (!active || !newColName.trim()) return;
    const columns = [...active.columns, { id: `col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, name: newColName.trim() }];
    await api({ action: "update-board", id: active.id, updates: { columns } });
    setNewColName(""); setAddingCol(false);
  }
  async function saveRenameColumn(colId: string) {
    if (!active) return;
    const columns = active.columns.map((c) => c.id === colId ? { ...c, name: renameColVal.trim() || c.name } : c);
    await api({ action: "update-board", id: active.id, updates: { columns } });
    setRenameCol(null);
  }
  async function deleteColumn(colId: string) {
    if (!active) return;
    const n = cards.filter((c) => c.boardId === active.id && c.columnId === colId).length;
    if (!(await confirm(`Excluir esta coluna${n ? ` e seus ${n} card(s)` : ""}? Esta acao nao pode ser desfeita.`))) return;
    if (n) await api({ action: "delete-column", boardId: active.id, columnId: colId });
    const columns = active.columns.filter((c) => c.id !== colId);
    await api({ action: "update-board", id: active.id, updates: { columns } });
  }

  // ---- cards ----
  async function quickAddCard(colId: string) {
    const title = (quickCard[colId] || "").trim();
    if (!title || !active) return;
    setQuickCard((q) => ({ ...q, [colId]: "" }));
    await api({ action: "create-card", boardId: active.id, columnId: colId, title });
  }
  async function saveCard() {
    if (!editCard) return;
    await api({ action: "update-card", id: editCard.id, updates: {
      title: editCard.title, notes: editCard.notes, images: editCard.images, priority: editCard.priority, columnId: editCard.columnId,
    }});
    setEditCard(null);
  }
  async function deleteCard(id: string) {
    if (!(await confirm("Excluir este card? Esta acao nao pode ser desfeita."))) return;
    await api({ action: "delete-card", id });
    setEditCard(null);
  }
  function onDropCard(colId: string) { if (dragCard) { api({ action: "move-card", id: dragCard, columnId: colId }); setDragCard(null); } }

  async function uploadImage(file: File) {
    if (!editCard || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const data = await fileToBase64(file);
      const res = await fetch("/api/meu-kanban/image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editCard.id, filename: file.name || "paste.png", data }),
      });
      if (res.ok) { const d = await res.json(); setEditCard((c) => c ? { ...c, images: [...c.images, d.url] } : c); }
    } catch { /* */ }
    setUploading(false);
  }
  function onPaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) { const f = item.getAsFile(); if (f) { e.preventDefault(); uploadImage(f); } }
  }

  const colCards = (colId: string) =>
    cards.filter((c) => c.boardId === activeId && c.columnId === colId)
      .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank || +new Date(b.updatedAt) - +new Date(a.updatedAt));

  function logout() { document.cookie = "pdb_auth=; path=/; max-age=0"; window.location.href = "/painel-pdb-9x/login"; }

  if (loading) return <div className="h-screen flex items-center justify-center bg-body"><Loader2 className="h-8 w-8 animate-spin text-green" /></div>;

  return (
    <div className="h-screen flex flex-col bg-body font-sans">
      {/* Top bar */}
      <header className="bg-surface border-b border-border-custom px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
        <a href="/studio-pdb" className="p-2 -ml-2 text-text-muted hover:text-green" title="Voltar ao Studio"><ArrowLeft className="h-4 w-4" /></a>
        <KanbanSquare className="h-5 w-5 text-green" />
        <h1 className="hidden md:block text-lg font-bold text-text-primary">Meu Kanban</h1>
        <PanelMenu current="/studio-pdb/meu-kanban" />
        <span className="hidden lg:inline text-xs text-text-muted">Pessoal · só você ve</span>
        <div className="flex-1" />
        <button onClick={() => setShowNewBoard(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo quadro</span>
        </button>
        <button onClick={() => load()} className="p-2 text-text-muted hover:text-green" title="Atualizar"><RefreshCw className="h-4 w-4" /></button>
        <button onClick={logout} className="p-2 text-text-muted hover:text-red" title="Sair"><LogOut className="h-4 w-4" /></button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar de quadros (agrupados por organizacao) */}
        <aside className="w-60 shrink-0 border-r border-border-custom bg-surface overflow-y-auto p-3">
          <div className="flex items-center gap-1.5 px-1 mb-2 text-[11px] font-bold uppercase tracking-wide text-text-muted">
            <FolderKanban className="h-3.5 w-3.5" /> Meus quadros
          </div>
          {boards.length === 0 && <p className="px-1 text-xs text-text-muted">Nenhum quadro ainda. Crie o primeiro!</p>}
          {grouped.map(([org, list]) => (
            <div key={org} className="mb-3">
              <div className="px-1 mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted/70">{org}</div>
              {list.map((b) => (
                <button key={b.id} onClick={() => setActiveId(b.id)}
                  className={`group flex w-full items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition ${activeId === b.id ? "bg-green-light text-green font-semibold" : "text-text-secondary hover:bg-body"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${COLORS[b.color] || COLORS.green}`} />
                  <span className="truncate flex-1 text-left">{b.name}</span>
                  <span className="text-[10px] text-text-muted">{cards.filter((c) => c.boardId === b.id).length}</span>
                  <Pencil onClick={(e) => { e.stopPropagation(); setEditBoard({ ...b }); }}
                    className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 hover:text-green" />
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Board ativo */}
        <main className="flex-1 flex flex-col min-w-0">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3">
              <KanbanSquare className="h-12 w-12 opacity-30" />
              <p className="text-sm">Crie um quadro pra comecar.</p>
              <button onClick={() => setShowNewBoard(true)} className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover">
                <Plus className="h-4 w-4" /> Novo quadro
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border-custom shrink-0">
                <span className={`h-3 w-3 rounded-full ${COLORS[active.color] || COLORS.green}`} />
                <h2 className="text-base font-bold text-text-primary truncate">{active.name}</h2>
                {active.org && <span className="text-[11px] text-text-muted">· {active.org}</span>}
                <button onClick={() => setEditBoard({ ...active })} className="p-1.5 text-text-muted hover:text-green" title="Editar quadro"><Pencil className="h-3.5 w-3.5" /></button>
                <div className="flex-1" />
                <button onClick={() => setAddingCol(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border-custom text-text-secondary rounded-lg text-xs font-semibold hover:border-green hover:text-green">
                  <Plus className="h-3.5 w-3.5" /> Coluna
                </button>
              </div>

              <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-4 p-4 sm:p-5 h-full min-w-max items-start">
                  {active.columns.map((col) => (
                    <div key={col.id} className="w-[300px] flex flex-col shrink-0 max-h-full" onDragOver={(e) => e.preventDefault()} onDrop={() => onDropCard(col.id)}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg border border-border-custom bg-surface">
                        {renameCol === col.id ? (
                          <input autoFocus value={renameColVal} onChange={(e) => setRenameColVal(e.target.value)}
                            onBlur={() => saveRenameColumn(col.id)} onKeyDown={(e) => { if (e.key === "Enter") saveRenameColumn(col.id); }}
                            className="flex-1 h-6 rounded border border-green bg-body px-1.5 text-sm" />
                        ) : (
                          <button onClick={() => { setRenameCol(col.id); setRenameColVal(col.name); }} className="text-sm font-bold text-text-primary truncate text-left flex-1" title="Renomear">{col.name}</button>
                        )}
                        <span className="bg-body text-text-muted text-xs font-bold px-2 py-0.5 rounded-full">{colCards(col.id).length}</span>
                        <button onClick={() => deleteColumn(col.id)} className="p-0.5 text-text-muted hover:text-red" title="Excluir coluna"><X className="h-3.5 w-3.5" /></button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 border-x border-border-light bg-body/40 p-2">
                        {colCards(col.id).map((card) => (
                          <div key={card.id} draggable onDragStart={() => setDragCard(card.id)} onClick={() => { setEditCard({ ...card }); setImgUrl(""); }}
                            className={`bg-surface border border-border-custom rounded-lg shadow-sm hover:shadow-md transition cursor-pointer ${dragCard === card.id ? "opacity-40" : ""}`}>
                            <div className="p-2.5">
                              <div className="flex items-start gap-1.5">
                                <GripVertical className="h-3.5 w-3.5 text-border-custom shrink-0 mt-0.5 cursor-grab" onClick={(e) => e.stopPropagation()} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="flex items-center gap-1 text-[9px] text-text-muted">
                                      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY[card.priority].dot}`} /> {PRIORITY[card.priority].label}
                                    </span>
                                    {card.images.length > 0 && (
                                      <span className="ml-auto flex items-center gap-0.5 text-[9px] text-text-muted">
                                        <ImageIcon className="h-3 w-3" />{card.images.length}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-sm font-medium text-text-primary leading-tight">{card.title}</h3>
                                  {card.notes && <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{card.notes}</p>}
                                </div>
                              </div>
                              {card.images.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  {card.images.map((img, i) => (
                                    <div key={i} className="rounded overflow-hidden border border-border-light cursor-zoom-in"
                                      onClick={(e) => { e.stopPropagation(); setLightbox(img); }}>
                                      <Image src={img} alt="" width={280} height={120} className="w-full h-24 object-cover" unoptimized />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border border-border-light rounded-b-lg bg-surface p-1.5">
                        <input value={quickCard[col.id] || ""} onChange={(e) => setQuickCard((q) => ({ ...q, [col.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") quickAddCard(col.id); }}
                          placeholder="+ adicionar card"
                          className="w-full h-8 rounded border border-transparent hover:border-border-custom focus:border-green bg-transparent px-2 text-sm focus:outline-none" />
                      </div>
                    </div>
                  ))}

                  {/* Adicionar coluna */}
                  <div className="w-[260px] shrink-0">
                    {addingCol ? (
                      <div className="rounded-lg border border-border-custom bg-surface p-2 flex gap-2">
                        <input autoFocus value={newColName} onChange={(e) => setNewColName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") setAddingCol(false); }}
                          placeholder="Nome da coluna" className="flex-1 h-8 rounded border border-border-custom bg-body px-2 text-sm" />
                        <button onClick={addColumn} className="px-2 bg-green text-white rounded text-sm"><Check className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingCol(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border-custom text-text-muted hover:border-green hover:text-green text-sm">
                        <Plus className="h-4 w-4" /> Adicionar coluna
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal novo quadro */}
      {showNewBoard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNewBoard(false)}>
          <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <h2 className="text-base font-bold text-text-primary">Novo quadro</h2>
              <button onClick={() => setShowNewBoard(false)} className="p-1 text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Nome *</label>
                <input value={bName} onChange={(e) => setBName(e.target.value)} autoFocus placeholder="Ex: Projeto X, Tarefas de casa..."
                  onKeyDown={(e) => { if (e.key === "Enter") createBoard(); }}
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Organizacao (opcional)</label>
                <input value={bOrg} onChange={(e) => setBOrg(e.target.value)} placeholder="Ex: Trabalho, Pessoal, Cliente Y..."
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
                <p className="mt-1 text-[10px] text-text-muted">Quadros com a mesma organizacao ficam agrupados na barra lateral.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Cor</label>
                <div className="flex gap-2">
                  {COLOR_KEYS.map((c) => (
                    <button key={c} onClick={() => setBColor(c)}
                      className={`h-7 w-7 rounded-full ${COLORS[c]} ${bColor === c ? "ring-2 ring-offset-2 ring-text-primary" : ""}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border-custom">
              <button onClick={createBoard} disabled={!bName.trim() || saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-40">
                <Plus className="h-4 w-4" /> Criar quadro
              </button>
              <button onClick={() => setShowNewBoard(false)} className="px-6 py-2.5 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:bg-body">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar quadro */}
      {editBoard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditBoard(null)}>
          <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <h2 className="text-base font-bold text-text-primary">Editar quadro</h2>
              <button onClick={() => setEditBoard(null)} className="p-1 text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Nome</label>
                <input value={editBoard.name} onChange={(e) => setEditBoard({ ...editBoard, name: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Organizacao</label>
                <input value={editBoard.org} onChange={(e) => setEditBoard({ ...editBoard, org: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Cor</label>
                <div className="flex gap-2">
                  {COLOR_KEYS.map((c) => (
                    <button key={c} onClick={() => setEditBoard({ ...editBoard, color: c })}
                      className={`h-7 w-7 rounded-full ${COLORS[c]} ${editBoard.color === c ? "ring-2 ring-offset-2 ring-text-primary" : ""}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border-custom">
              <button onClick={saveBoard} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Salvar
              </button>
              <button onClick={() => deleteBoard(editBoard.id)} className="px-4 py-2.5 border border-border-custom text-text-muted rounded-lg text-sm font-semibold hover:border-red hover:text-red flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal card (detalhe/edicao) */}
      {editCard && active && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditCard(null)}>
          <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()} onPaste={onPaste}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom shrink-0">
              <span className="text-[11px] text-text-muted">{active.name}</span>
              <button onClick={() => setEditCard(null)} className="p-1 text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <input value={editCard.title} onChange={(e) => setEditCard({ ...editCard, title: e.target.value })}
                className="w-full h-10 rounded-lg border border-border-custom bg-surface px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
              <textarea value={editCard.notes} onChange={(e) => setEditCard({ ...editCard, notes: e.target.value })} rows={5}
                placeholder="Notas... (cole uma imagem com Ctrl+V)"
                className="w-full rounded-lg border border-border-custom bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none" />

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Fotos {editCard.images.length > 0 && `(${editCard.images.length})`}</label>
                {editCard.images.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {editCard.images.map((img, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-border-custom">
                        <Image src={img} alt="" width={640} height={360} onClick={() => setLightbox(img)}
                          className="w-full max-h-72 object-contain bg-body cursor-zoom-in" unoptimized />
                        <button onClick={() => setEditCard({ ...editCard, images: editCard.images.filter((_, k) => k !== i) })}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-custom py-6 cursor-pointer hover:border-green transition ${uploading ? "opacity-60" : ""}`}>
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin text-green" /> : <ImageIcon className="h-6 w-6 text-text-muted" />}
                  <span className="text-xs text-text-muted">{uploading ? "Enviando..." : "Cole (Ctrl+V) ou clique para adicionar mais uma"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                </label>
                <div className="mt-2 flex gap-2">
                  <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="...ou cole a URL"
                    className="flex-1 h-9 rounded-lg border border-border-custom bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green" />
                  <button onClick={() => { if (imgUrl.trim()) { setEditCard({ ...editCard, images: [...editCard.images, imgUrl.trim()] }); setImgUrl(""); } }} disabled={!imgUrl.trim()}
                    className="px-4 h-9 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-30">Adicionar</button>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-32">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Prioridade</label>
                  <select value={editCard.priority} onChange={(e) => setEditCard({ ...editCard, priority: e.target.value as Priority })}
                    className="w-full h-10 rounded-lg border border-border-custom bg-surface px-3 text-sm">
                    <option value="alta">Alta</option><option value="media">Media</option><option value="baixa">Baixa</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Coluna</label>
                  <select value={editCard.columnId} onChange={(e) => setEditCard({ ...editCard, columnId: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border-custom bg-surface px-3 text-sm">
                    {active.columns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border-custom shrink-0">
              <button onClick={saveCard} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green-hover disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Salvar
              </button>
              <button onClick={() => deleteCard(editCard.id)} className="px-4 py-2.5 border border-border-custom text-text-muted rounded-lg text-sm font-semibold hover:border-red hover:text-red flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {dialog}
    </div>
  );
}
