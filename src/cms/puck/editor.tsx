"use client";
// Construtor (beta): editor Puck dentro do /cms. Grava só o RASCUNHO da página
// (PATCH ?draft=true com puckData + editor). Nada é publicado daqui — publicar continua na
// aba Editar. Por isso o botão padrão do Puck ("Publish") é escondido e trocado pelos nossos.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Puck, useGetPuck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { editorConfig } from "./config.editor";
import { SiteStylesIframe } from "./iframe-styles";
import { parsePuckJson, snippetItem } from "./json-io";

/* eslint-disable @typescript-eslint/no-explicit-any */
const EMPTY: Data = { content: [], root: { props: {} }, zones: {} };
type Mode = "puck" | "blocks";

const btn: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid #00965E",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(17,24,39,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
const panel: React.CSSProperties = {
  background: "#fff",
  color: "#111827",
  borderRadius: 10,
  padding: 20,
  width: "min(720px, 100%)",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
};

type Dialog = null | "import" | "snippet";

// Importar JSON: cola, valida (content[] + tipos conhecidos) e troca o conteúdo do canvas.
function ImportDialog({ onClose }: { onClose: () => void }) {
  const getPuck = useGetPuck();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const apply = () => {
    const { dispatch, config } = getPuck();
    const r = parsePuckJson(text, Object.keys(config.components));
    if (!r.ok) return setError(r.error);
    dispatch({ type: "setData", data: r.data });
    onClose();
  };
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <strong>Importar JSON do Construtor</strong>
        <span style={{ fontSize: 13, color: "#6B7280" }}>Substitui todo o conteúdo do canvas. Nada é salvo até você clicar em &quot;Salvar rascunho&quot;.</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} style={{ width: "100%", fontFamily: "monospace", fontSize: 12, padding: 8 }} placeholder='{"content": [...], "root": {"props": {}}}' />
        {error && <span style={{ color: "#E8312A", fontSize: 13 }}>{error}</span>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ ...btn, background: "#fff", color: "#00965E" }}>Cancelar</button>
          <button type="button" onClick={apply} style={{ ...btn, background: "#00965E", color: "#fff" }}>Importar</button>
        </div>
      </div>
    </div>
  );
}

// Inserir trecho: lista os Trechos do /cms e acrescenta um componente "Trecho" no fim da página.
function SnippetDialog({ onClose }: { onClose: () => void }) {
  const getPuck = useGetPuck();
  const [items, setItems] = useState<{ id: number | string; title: string }[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/cms-api/snippets?limit=100&depth=0&sort=title", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((r) => setItems((r.docs || []).map((d: any) => ({ id: d.id, title: d.title || `Trecho ${d.id}` }))))
      .catch(() => setError("Não foi possível carregar os trechos."));
  }, []);
  const insert = (it: { id: number | string; title: string }) => {
    const { dispatch, appState } = getPuck();
    const data = appState.data as Data;
    dispatch({ type: "setData", data: { content: [...(data.content || []), snippetItem(it) as any] } });
    onClose();
  };
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <strong>Inserir trecho reutilizável</strong>
        <span style={{ fontSize: 13, color: "#6B7280" }}>O trecho entra no fim da página. Edite o trecho em Conteúdo → Trechos (vale pra todas as páginas que o usam).</span>
        {error && <span style={{ color: "#E8312A", fontSize: 13 }}>{error}</span>}
        {!items && !error && <span>Carregando…</span>}
        {items && !items.length && <span>Nenhum trecho criado ainda.</span>}
        <div style={{ overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {(items || []).map((it) => (
            <button key={it.id} type="button" onClick={() => insert(it)} style={{ ...btn, textAlign: "left", background: "#fff", color: "#111827", borderColor: "#E5E7EB" }}>
              {it.title}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ ...btn, background: "#fff", color: "#00965E" }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// Renderizado dentro do <Puck> (override do header) → pode usar useGetPuck.
function HeaderButtons({ save, busy, setStatus }: { save: (d: Data, mode: Mode) => void; busy: boolean; setStatus: (s: string) => void }) {
  const getPuck = useGetPuck();
  const [dialog, setDialog] = useState<Dialog>(null);
  const run = (mode: Mode) => save(getPuck().appState.data as Data, mode);
  const exportJson = async () => {
    const json = JSON.stringify(getPuck().appState.data, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setStatus("JSON copiado pra área de transferência.");
    } catch {
      const blob = new Blob([json], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "construtor.json";
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus("JSON baixado (a área de transferência não estava disponível).");
    }
  };
  const ghost: React.CSSProperties = { ...btn, background: "#fff", color: "#374151", borderColor: "#D1D5DB" };
  return (
    <>
      <button type="button" onClick={() => setDialog("snippet")} style={ghost}>
        Inserir trecho
      </button>
      <button type="button" onClick={exportJson} style={ghost}>
        Exportar JSON
      </button>
      <button type="button" onClick={() => setDialog("import")} style={ghost}>
        Importar JSON
      </button>
      <button type="button" disabled={busy} onClick={() => run("puck")} style={{ ...btn, background: "#00965E", color: "#fff" }}>
        Salvar rascunho
      </button>
      <button type="button" disabled={busy} onClick={() => run("blocks")} style={{ ...btn, background: "#fff", color: "#00965E" }}>
        Voltar o site pros Blocos
      </button>
      {dialog === "import" && <ImportDialog onClose={() => setDialog(null)} />}
      {dialog === "snippet" && <SnippetDialog onClose={() => setDialog(null)} />}
    </>
  );
}

export function PuckEditor({ id }: { id?: number | string }) {
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/cms-api/pages/${id}?draft=true&depth=0`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          setLoadError(`Não foi possível carregar a página (HTTP ${r.status}). Recarregue a aba antes de editar.`);
          return;
        }
        const d = await r.json();
        setData(Array.isArray(d?.puckData?.content) ? d.puckData : EMPTY);
      })
      .catch(() => setLoadError("Não foi possível carregar a página. Recarregue a aba antes de editar."));
  }, [id]);

  const save = useCallback(
    async (d: Data, editor: Mode) => {
      setBusy(true);
      setStatus("Salvando…");
      try {
        const r = await fetch(`/cms-api/pages/${id}?draft=true`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ puckData: d, editor }),
        });
        setStatus(
          r.ok
            ? `Rascunho salvo (${editor === "puck" ? "a página usa o Construtor" : "a página volta a usar os Blocos"}). Publicar continua na aba Editar.`
            : `Erro ao salvar (${r.status}).`
        );
      } catch {
        setStatus("Erro de rede ao salvar.");
      } finally {
        setBusy(false);
      }
    },
    [id]
  );

  // Estável entre renders (senão o Puck remonta o header e fecha os diálogos).
  const overrides = useMemo(
    () => ({
      headerActions: () => <HeaderButtons save={save} busy={busy} setStatus={setStatus} />,
      iframe: SiteStylesIframe,
    }),
    [save, busy]
  );

  if (!id) {
    return (
      <div style={{ padding: 32 }}>
        <p>Salve a página (rascunho) na aba Editar antes de usar o Construtor.</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div style={{ padding: 32 }}>
        <p style={{ color: "#E8312A" }}>{loadError}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      </div>
    );
  }
  if (!data) return <div style={{ padding: 32 }}>Carregando…</div>;

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 16px", fontSize: 13, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", borderBottom: "1px solid #E5E7EB" }}>
        <strong>Construtor (beta)</strong>
        <span>Arraste componentes pro canvas. &quot;Salvar rascunho&quot; grava e faz a página usar o Construtor.</span>
        <a href={`/cms-preview/pagina/${id}`} target="_blank" rel="noreferrer">
          Ver preview ↗
        </a>
        <span style={{ marginLeft: "auto", color: status.startsWith("Erro") ? "#E8312A" : "#00965E" }}>{status}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Puck
          config={editorConfig}
          data={data}
          onPublish={(d) => save(d, "puck")}
          viewports={[
            { width: 390, height: "auto", label: "Celular", icon: "Smartphone" },
            { width: 768, height: "auto", label: "Tablet", icon: "Tablet" },
            { width: 1440, height: "auto", label: "Desktop", icon: "Monitor" },
          ]}
          iframe={{ syncHostStyles: false }}
          overrides={overrides}
        />
      </div>
    </div>
  );
}
