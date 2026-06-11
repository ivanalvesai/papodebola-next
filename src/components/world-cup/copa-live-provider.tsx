"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { WorldCupLiveScore } from "@/lib/data/match-detail";

const LiveCtx = createContext<Record<number, WorldCupLiveScore>>({});

export function useLiveScore(id: number): WorldCupLiveScore | undefined {
  return useContext(LiveCtx)[id];
}

// Faz polling de /api/copa/ao-vivo a cada 30s e fornece um mapa id->placar pros
// confrontos na tabela da Copa atualizarem placar/status sem recarregar a página.
export function CopaLiveProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<number, WorldCupLiveScore>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/copa/ao-vivo", { cache: "no-store" });
        if (!r.ok) return;
        const arr: WorldCupLiveScore[] = await r.json();
        if (!alive) return;
        const m: Record<number, WorldCupLiveScore> = {};
        for (const s of arr) m[s.id] = s;
        setMap(m);
      } catch {
        /* tenta de novo no próximo ciclo */
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return <LiveCtx.Provider value={map}>{children}</LiveCtx.Provider>;
}
