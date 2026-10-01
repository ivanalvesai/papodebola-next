"use client";
// Mini-preview de um bloco que depende do servidor (dados ao vivo, Lexical, formulário,
// trecho): POST do bloco em /api/cms/block-preview (devolve uma chave) + iframe pra
// /cms-block-preview?k=, que renderiza o PageBlock REAL do site. A altura vem por
// postMessage. O canvas do Puck já é um iframe, então o listener fica na janela que
// contém este iframe (ownerDocument), não na do /cms.
import { useEffect, useRef, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

const MIN = 120;
const MAX = 2000;

export function BlockFrame({ block, id }: { block: any; id: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN);
  const json = JSON.stringify(block ?? null);
  const [debounced, setDebounced] = useState(json);

  // Digitação nos campos não recarrega o iframe a cada tecla.
  useEffect(() => {
    if (json === debounced) return;
    const t = setTimeout(() => setDebounced(json), 600);
    return () => clearTimeout(t);
  }, [json, debounced]);

  // O bloco vai por POST pro store da prévia (nunca na URL); o iframe abre só a chave.
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (debounced === "null") return;
    let alive = true;
    fetch("/api/cms/block-preview", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ block: JSON.parse(debounced), width: "wide" }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok || !d.key) return setError(d.error || `Prévia indisponível (HTTP ${r.status}).`);
        setError("");
        setSrc(`${window.location.origin}/cms-block-preview?k=${encodeURIComponent(d.key)}&id=${encodeURIComponent(id)}`);
      })
      .catch(() => alive && setError("Prévia indisponível (rede)."));
    return () => {
      alive = false;
    };
  }, [debounced, id]);

  useEffect(() => {
    const win: Window | null = ref.current?.ownerDocument?.defaultView || (typeof window !== "undefined" ? window : null);
    if (!win) return;
    const onMessage = (e: MessageEvent) => {
      const h = Number(e.data?.pdbPreviewHeight);
      if (!h || e.data?.id !== id) return;
      setHeight(Math.max(MIN, Math.min(MAX, Math.ceil(h))));
    };
    win.addEventListener("message", onMessage);
    return () => win.removeEventListener("message", onMessage);
    // `src` nas deps: o iframe só existe depois da chave; aí o ref aponta pra janela do canvas.
  }, [id, src]);

  const note = (msg: string) => (
    <div style={{ border: "1px dashed #9CA3AF", borderRadius: 8, padding: 16, background: "#fff", color: "#6B7280", fontSize: 14 }}>{msg}</div>
  );
  if (!block) return note("Configure este bloco nos campos à direita.");
  if (error) return note(error);
  if (!src) return note("Carregando prévia…");
  return (
    <iframe
      ref={ref}
      title="Prévia do bloco"
      src={src}
      style={{ width: "100%", height, border: 0, display: "block", pointerEvents: "none" }}
    />
  );
}
