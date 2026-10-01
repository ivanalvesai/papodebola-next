"use client";
// Construtor (beta): editor Puck dentro do /cms. Grava só o RASCUNHO da página
// (PATCH ?draft=true com puckData + editor). Nada é publicado daqui — publicar continua na
// aba Editar. Por isso o botão padrão do Puck ("Publish") é escondido e trocado pelos nossos.
import React, { useCallback, useEffect, useState } from "react";
import { Puck, useGetPuck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { editorConfig } from "./config.editor";

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

// Renderizado dentro do <Puck> (override do header) → pode usar useGetPuck.
function HeaderButtons({ save, busy }: { save: (d: Data, mode: Mode) => void; busy: boolean }) {
  const getPuck = useGetPuck();
  const run = (mode: Mode) => save(getPuck().appState.data as Data, mode);
  return (
    <>
      <button type="button" disabled={busy} onClick={() => run("puck")} style={{ ...btn, background: "#00965E", color: "#fff" }}>
        Salvar rascunho
      </button>
      <button type="button" disabled={busy} onClick={() => run("blocks")} style={{ ...btn, background: "#fff", color: "#00965E" }}>
        Voltar o site pros Blocos
      </button>
    </>
  );
}

export function PuckEditor({ id }: { id?: number | string }) {
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/cms-api/pages/${id}?draft=true&depth=0`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d?.puckData?.content) ? d.puckData : EMPTY))
      .catch(() => setData(EMPTY));
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

  if (!id) {
    return (
      <div style={{ padding: 32 }}>
        <p>Salve a página (rascunho) na aba Editar antes de usar o Construtor.</p>
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
          overrides={{ headerActions: () => <HeaderButtons save={save} busy={busy} /> }}
        />
      </div>
    </div>
  );
}
