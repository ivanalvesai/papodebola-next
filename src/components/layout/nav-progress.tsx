"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Barra fina de progresso no topo (estilo ge/YouTube): aparece NO CLIQUE de um link
// interno e some quando a nova rota termina de abrir. Sem ela, a navegação parecia
// travada enquanto o servidor montava a página. Não usa loading.tsx de propósito
// (loading.tsx global causou soft-404 — ver memória soft404_e_paginas_legais).
export function NavProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0); // 0 = escondida
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  // Rota mudou → completa e esconde.
  useEffect(() => {
    if (!timer.current) return;
    stop();
    setProgress(100);
    const t = setTimeout(() => setProgress(0), 250);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // âncora/mesma página
      stop();
      setProgress(12);
      // Avança devagar até ~90% enquanto espera o servidor.
      timer.current = setInterval(() => {
        setProgress((p) => (p < 90 ? p + (90 - p) * 0.08 : p));
      }, 200);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      stop();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] bg-green transition-[width,opacity] duration-200 ease-out"
      style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
    />
  );
}
