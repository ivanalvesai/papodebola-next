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

// Provider GENÉRICO da barra da home: faz polling dos endpoints de placar ao vivo que
// JÁ EXISTEM e são cacheados+gateados (ex.: /api/championship/{liga}/ao-vivo, /api/copa/
// ao-vivo). Reusa o cache (N visitantes = 1 chamada à API) e, fora da janela do jogo,
// esses endpoints retornam vazio — então não bate na API à toa. Mesmo contexto/useLiveScore.
export function LiveScoreProvider({
  endpoints,
  children,
}: {
  endpoints: string[];
  children: ReactNode;
}) {
  const [map, setMap] = useState<Record<number, WorldCupLiveScore>>({});
  const key = endpoints.join("|"); // dep estável

  useEffect(() => {
    if (!key) return; // sem endpoints (ex.: nada relevante) → não faz polling
    let alive = true;
    const urls = key.split("|");
    const load = async () => {
      try {
        const results = await Promise.all(
          urls.map((u) =>
            fetch(u, { cache: "no-store" })
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => [])
          )
        );
        if (!alive) return;
        const m: Record<number, WorldCupLiveScore> = {};
        for (const arr of results) for (const s of arr as WorldCupLiveScore[]) m[s.id] = s;
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
  }, [key]);

  return <LiveCtx.Provider value={map}>{children}</LiveCtx.Provider>;
}
