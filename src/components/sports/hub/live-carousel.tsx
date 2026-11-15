"use client";

import { useEffect, useState } from "react";
import { MatchCarousel } from "@/components/match-bar/match-carousel";
import type { MatchBarCardProps } from "@/components/match-bar/match-bar-card";
import type { HubEvent } from "@/lib/data/sport-hub";

type LiveItem = { event: HubEvent; league: string };

function toCard({ event: e, league }: LiveItem, hideScore: boolean): MatchBarCardProps {
  return {
    id: `hub_${e.id}`,
    homeTeam: e.home.short || e.home.name,
    awayTeam: e.away.short || e.away.name,
    homeLogo: e.home.id ? `/api/team-img/${e.home.id}` : null,
    awayLogo: e.away.id ? `/api/team-img/${e.away.id}` : null,
    homeScore: hideScore ? null : e.hs,
    awayScore: hideScore ? null : e.as,
    time: "",
    timestamp: e.ts,
    status: "live",
    statusText: "Ao vivo",
    league,
  };
}

// Carrossel só com os jogos AO VIVO do esporte (sem link: fora do futebol não há lance a
// lance). Atualiza a cada 60 s lendo /api/sport-hub/live (disco, nunca a API). Some quando
// não há jogo ao vivo.
export function HubLiveCarousel({ sport, initial, hideScore = false }: { sport: string; initial: LiveItem[]; hideScore?: boolean }) {
  const [items, setItems] = useState<LiveItem[]>(initial);
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/sport-hub/live?sport=${encodeURIComponent(sport)}`, { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (!stop && Array.isArray(d.live)) setItems(d.live);
      } catch {
        /* mantém a tela */
      }
    };
    const id = setInterval(tick, 60_000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [sport]);
  if (!items.length) return null;
  return <MatchCarousel title="Ao vivo agora" count={items.length} matches={items.map((i) => toCard(i, hideScore))} />;
}
