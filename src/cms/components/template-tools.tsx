"use client";
import React, { useEffect, useState } from "react";
import { useDocumentInfo, useModal, Modal, Button } from "@payloadcms/ui";
import { parseLayoutImport, stripIds } from "@/cms/lib/layout-io";
import { PAGE_BLOCK_SLUGS } from "@/cms/blocks";

/* eslint-disable @typescript-eslint/no-explicit-any */
const API = "/cms-api";
async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, { credentials: "include", headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export function TemplateTools() {
  const { id } = useDocumentInfo();
  const { openModal, closeModal } = useModal();
  const [templates, setTemplates] = useState<any[]>([]);
  const [sel, setSel] = useState("");
  const [json, setJson] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [snipSel, setSnipSel] = useState("");
  const [layoutLen, setLayoutLen] = useState(0);
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("1");
  const [snipTitle, setSnipTitle] = useState("");

  useEffect(() => { api("/pageTemplates?limit=100&depth=0&sort=title").then((r) => setTemplates(r.docs || [])).catch(() => setMsg("Não foi possível carregar os modelos.")); }, []);

  useEffect(() => { api("/snippets?limit=100&depth=0&sort=title").then((r) => setSnippets(r.docs || [])).catch(() => {}); }, []);
  useEffect(() => {
    if (!id) return;
    api(`/pages/${id}?draft=true&depth=0`).then((d) => { const n = (d.layout || []).length; setLayoutLen(n); setFrom("1"); setTo(String(Math.max(n, 1))); }).catch(() => {});
  }, [id]);

  const patch = async (data: any) => { await api(`/pages/${id}?draft=true`, { method: "PATCH", body: JSON.stringify(data) }); window.location.reload(); };
  const current = async () => api(`/pages/${id}?draft=true&depth=0`);

  const applyTemplate = async () => {
    const t = templates.find((x) => String(x.id) === sel); if (!t) return;
    setBusy(true);
    try { await patch({ layout: stripIds(t.layout || []), hero: stripIds(t.hero), layoutStyle: stripIds(t.layoutStyle) }); }
    catch (e: any) { setMsg(`Erro ao aplicar: ${e.message}`); setBusy(false); }
  };
  const saveAsTemplate = async () => {
    const title = window.prompt("Nome do modelo:"); if (!title) return;
    setBusy(true);
    try { const doc = await current(); await api("/pageTemplates", { method: "POST", body: JSON.stringify({ title, hero: stripIds(doc.hero), layoutStyle: stripIds(doc.layoutStyle), layout: stripIds(doc.layout || []) }) }); setMsg(`Modelo "${title}" salvo.`); }
    catch (e: any) { setMsg(`Erro ao salvar: ${e.message}`); } finally { setBusy(false); }
  };
  const insertSnippet = async () => {
    if (!snipSel) return;
    setBusy(true);
    try {
      const doc = await current();
      await patch({ layout: [...(doc.layout || []), { blockType: "snippet", snippet: Number(snipSel) }] });
    } catch (e: any) { setMsg(`Erro ao inserir: ${e.message}`); setBusy(false); }
  };
  const saveSnippet = async () => {
    const title = snipTitle.trim();
    if (!title) { setMsg("Dê um nome ao trecho."); return; }
    setBusy(true);
    try {
      const doc = await current();
      const layout: any[] = doc.layout || [];
      const a = Math.floor(Number(from)), b = Math.floor(Number(to));
      if (!(a >= 1) || !(b >= a) || b > layout.length) { setMsg(`Intervalo inválido: use de 1 a ${layout.length}.`); return; }
      const slice = layout.slice(a - 1, b);
      if (slice.some((x) => x?.blockType === "snippet")) { setMsg("Um trecho não pode conter outro trecho. Ajuste o intervalo."); return; }
      await api("/snippets", { method: "POST", body: JSON.stringify({ title, layout: stripIds(slice) }) });
      setMsg(`Trecho "${title}" salvo.`); setSnipTitle("");
      api("/snippets?limit=100&depth=0&sort=title").then((r) => setSnippets(r.docs || [])).catch(() => {});
    } catch (e: any) { setMsg(`Erro ao salvar trecho: ${e.message}`); } finally { setBusy(false); }
  };
  const exportJson = async () => {
    try { const doc = await current(); const out = JSON.stringify({ hero: doc.hero, layoutStyle: doc.layoutStyle, layout: doc.layout }, null, 2); setJson(out); await navigator.clipboard?.writeText(out); setMsg("Layout copiado pro clipboard (e mostrado abaixo)."); }
    catch (e: any) { setMsg(`Erro ao exportar: ${e.message}`); }
  };
  const importJson = async () => {
    const r = parseLayoutImport(json, PAGE_BLOCK_SLUGS);
    if (!r.ok) { setMsg(r.error); return; }
    setBusy(true);
    try { await patch(r.data); } catch (e: any) { setMsg(`Erro ao importar: ${e.message}`); setBusy(false); }
  };

  if (!id) return <div className="pdb-tools"><p className="pdb-tools__hint">Salve a página (rascunho) pra liberar modelos, importar e exportar.</p></div>;
  const confirmModal = (slug: string, text: string, onYes: () => void) => (
    <Modal slug={slug} className="pdb-confirm">
      <div className="pdb-confirm__box"><p>{text}</p><div className="pdb-confirm__actions"><Button buttonStyle="secondary" onClick={() => closeModal(slug)}>Cancelar</Button><Button onClick={() => { closeModal(slug); onYes(); }}>Confirmar</Button></div></div>
    </Modal>
  );
  return (
    <div className="pdb-tools">
      <h4>Modelos e layout</h4>
      <label>Começar de um modelo
        <select value={sel} onChange={(e) => setSel(e.target.value)}><option value="">— escolher —</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      </label>
      <Button size="small" disabled={!sel || busy} onClick={() => openModal("pdb-apply")}>Aplicar modelo</Button>
      <Button size="small" buttonStyle="secondary" disabled={busy} onClick={saveAsTemplate}>Salvar como modelo</Button>
      <Button size="small" buttonStyle="secondary" disabled={busy} onClick={exportJson}>Exportar layout (JSON)</Button>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={6} placeholder="Cole aqui um layout em JSON (gerado pela IA ou exportado de outra página)" />
      <Button size="small" buttonStyle="secondary" disabled={!json.trim() || busy} onClick={() => { const r = parseLayoutImport(json, PAGE_BLOCK_SLUGS); if (!r.ok) { setMsg(r.error); return; } setMsg(""); openModal("pdb-import"); }}>Importar layout (JSON)</Button>
      <h4>Trechos</h4>
      <label>Inserir um trecho no fim da página
        <select value={snipSel} onChange={(e) => setSnipSel(e.target.value)}><option value="">— escolher —</option>{snippets.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      </label>
      <Button size="small" disabled={!snipSel || busy} onClick={() => openModal("pdb-snippet-insert")}>Inserir trecho</Button>
      <label>Salvar blocos como trecho (esta página tem {layoutLen} blocos)
        <input type="number" min={1} max={layoutLen || 1} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="do bloco nº" placeholder="do bloco nº" />
        <input type="number" min={1} max={layoutLen || 1} value={to} onChange={(e) => setTo(e.target.value)} aria-label="ao nº" placeholder="ao nº" />
        <input type="text" value={snipTitle} onChange={(e) => setSnipTitle(e.target.value)} placeholder="Nome do trecho" />
      </label>
      <Button size="small" buttonStyle="secondary" disabled={busy} onClick={() => openModal("pdb-snippet-save")}>Salvar como trecho</Button>
      {msg && <p className="pdb-tools__msg">{msg}</p>}
      {confirmModal("pdb-apply", "Aplicar o modelo substitui TODOS os blocos desta página (fica como rascunho). Continuar?", applyTemplate)}
      {confirmModal("pdb-snippet-insert", "Inserir o trecho no fim desta página (fica como rascunho)?", insertSnippet)}
      {confirmModal("pdb-snippet-save", `Salvar os blocos ${from} a ${to} como trecho "${snipTitle}"?`, saveSnippet)}
      {confirmModal("pdb-import", "Importar substitui TODOS os blocos desta página (fica como rascunho). Continuar?", importJson)}
    </div>
  );
}
