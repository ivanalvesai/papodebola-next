"use client";
// Mini-preview de um bloco que depende do servidor (dados ao vivo, Lexical, formulário,
// trecho): um iframe pra /cms-block-preview, que renderiza o PageBlock REAL do site. A altura
// vem por postMessage da página do preview. O canvas do Puck já é um iframe, então o
// listener fica na janela que contém este iframe (ownerDocument), não na do /cms.
import { useEffect, useMemo, useRef, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

function base64url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

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

  const src = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const b = base64url(JSON.stringify({ block: JSON.parse(debounced), width: "wide" }));
    return `${origin}/cms-block-preview?b=${b}&id=${encodeURIComponent(id)}`;
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
  }, [id]);

  if (!block) {
    return (
      <div style={{ border: "1px dashed #9CA3AF", borderRadius: 8, padding: 16, background: "#fff", color: "#6B7280", fontSize: 14 }}>
        Configure este bloco nos campos à direita.
      </div>
    );
  }
  return (
    <iframe
      ref={ref}
      title="Prévia do bloco"
      src={src}
      style={{ width: "100%", height, border: 0, display: "block", pointerEvents: "none" }}
    />
  );
}
