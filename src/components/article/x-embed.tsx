"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: { widgets?: { load?: (el?: HTMLElement) => void } };
  }
}

/**
 * Carrega o widgets.js do X (Twitter) e processa os blockquotes `twitter-tweet` do
 * corpo do post (transforma no card oficial do post). Só roda quando há de fato um
 * card na página (custo zero nos posts sem X). Renderizado condicionalmente pelo
 * ArticleView. Reprocessa em navegação SPA via re-mount por rota.
 */
export function TweetEmbedLoader() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!document.querySelector(".twitter-tweet")) return;

    const process = () => window.twttr?.widgets?.load?.();

    // Script já carregado (ex.: outro card na sessão) → só reprocessa.
    if (window.twttr?.widgets?.load) {
      process();
      return;
    }

    let script = document.getElementById("twitter-embed-js") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "twitter-embed-js";
      script.async = true;
      script.src = "https://platform.twitter.com/widgets.js";
      document.body.appendChild(script);
    }
    script.addEventListener("load", process, { once: true });

    // Rede de segurança: o script pode já estar em cache (load não dispara de novo).
    const t = window.setTimeout(process, 1500);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
