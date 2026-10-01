"use client";
import React, { useEffect, useState } from "react";
import { useDocumentInfo, useModal, Modal, Button } from "@payloadcms/ui";
import { parseLayoutImport } from "@/cms/lib/layout-io";
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

  useEffect(() => { api("/pageTemplates?limit=100&depth=0&sort=title").then((r) => setTemplates(r.docs || [])).catch(() => {}); }, []);

  const patch = async (data: any) => { await api(`/pages/${id}?draft=true`, { method: "PATCH", body: JSON.stringify(data) }); window.location.reload(); };
  const current = async () => api(`/pages/${id}?draft=true&depth=0`);

  const applyTemplate = async () => {
    const t = templates.find((x) => String(x.id) === sel); if (!t) return;
    setBusy(true);
    try { await patch({ layout: (t.layout || []).map(({ id: _i, ...b }: any) => b), hero: t.hero, layoutStyle: t.layoutStyle }); }
    catch (e: any) { setMsg(`Erro ao aplicar: ${e.message}`); setBusy(false); }
  };
  const saveAsTemplate = async () => {
    const title = window.prompt("Nome do modelo:"); if (!title) return;
    setBusy(true);
    try { const doc = await current(); await api("/pageTemplates", { method: "POST", body: JSON.stringify({ title, hero: doc.hero, layoutStyle: doc.layoutStyle, layout: (doc.layout || []).map(({ id: _i, ...b }: any) => b) }) }); setMsg(`Modelo "${title}" salvo.`); }
    catch (e: any) { setMsg(`Erro ao salvar: ${e.message}`); } finally { setBusy(false); }
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
  const confirm = (slug: string, text: string, onYes: () => void) => (
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
      <Button size="small" buttonStyle="secondary" onClick={exportJson}>Exportar layout (JSON)</Button>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={6} placeholder="Cole aqui um layout em JSON (gerado pela IA ou exportado de outra página)" />
      <Button size="small" buttonStyle="secondary" disabled={!json.trim() || busy} onClick={() => openModal("pdb-import")}>Importar layout (JSON)</Button>
      {msg && <p className="pdb-tools__msg">{msg}</p>}
      {confirm("pdb-apply", "Aplicar o modelo substitui TODOS os blocos desta página (fica como rascunho). Continuar?", applyTemplate)}
      {confirm("pdb-import", "Importar substitui TODOS os blocos desta página (fica como rascunho). Continuar?", importJson)}
    </div>
  );
}
