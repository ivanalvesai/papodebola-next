"use client";

import { useEffect, useState } from "react";

// Badge "AO VIVO" que consulta /api/municipal-live e só aparece enquanto o jogo está no ar.
// Usado na página do jogo (a lista usa o mapa próprio pra não fazer N polls).
export function LiveBadge({ slug, size = "md" }: { slug: string; size?: "sm" | "md" }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const r = await fetch("/api/municipal-live", { cache: "no-store" });
        const d = await r.json();
        if (!cancelled) setLive(!!d?.[slug]?.live);
      } catch {
        /* ignora */
      }
    };
    check();
    const t = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [slug]);

  if (!live) return null;
  const sm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-bold uppercase tracking-wide text-white ${
        sm ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-xs"
      }`}
      style={{ background: "#E8312A" }}
    >
      <span className={`rounded-full bg-white ${sm ? "h-1.5 w-1.5" : "h-2 w-2"} animate-pulse`} />
      Ao vivo
    </span>
  );
}
