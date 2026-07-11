"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds?: { process?: () => void } };
  }
}

/**
 * Carrega o embed.js do Instagram e processa os blockquotes `instagram-media` do
 * corpo do post (transforma no card com foto + legenda completa). Só roda quando
 * há de fato um card na página (custo zero nos posts sem Instagram). Renderizado
 * condicionalmente pelo ArticleView. Processa de novo em navegação SPA (o corpo
 * muda sem full reload) via re-mount do componente por rota.
 */
export function InstagramEmbedLoader() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!document.querySelector(".instagram-media")) return;

    const process = () => window.instgrm?.Embeds?.process?.();

    // Script já carregado (ex.: outro card na sessão) → só reprocessa.
    if (window.instgrm?.Embeds?.process) {
      process();
      return;
    }

    let script = document.getElementById("instagram-embed-js") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "instagram-embed-js";
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(script);
    }
    script.addEventListener("load", process, { once: true });

    // Rede de segurança: o script pode já estar em cache (load não dispara de novo).
    const t = window.setTimeout(process, 1500);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
