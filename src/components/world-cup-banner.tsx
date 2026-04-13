"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TARGET = new Date("2026-06-11T00:00:00-03:00").getTime();

function calcTimeLeft() {
  const diff = TARGET - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/15 rounded px-2 py-1 text-center min-w-[40px]">
      <div className="text-base font-bold text-yellow-400 leading-none">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[8px] text-white/60 uppercase">{label}</div>
    </div>
  );
}

export function WorldCupBanner() {
  const [time, setTime] = useState(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href="/noticias?cat=Copa%20do%20Mundo"
      className="block"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      <div className="flex items-center justify-center gap-5 px-5 py-2.5 flex-wrap">
        <span className="text-xl">&#127482;&#127480; &#127474;&#127485; &#127464;&#127462;</span>
        <span className="text-[15px] font-bold text-white uppercase tracking-wider">
          Copa do Mundo <span className="text-yellow-400">2026</span>
        </span>
        <div className="flex gap-1.5">
          <CountdownUnit value={time.days} label="Dias" />
          <CountdownUnit value={time.hours} label="Horas" />
          <CountdownUnit value={time.mins} label="Min" />
          <CountdownUnit value={time.secs} label="Seg" />
        </div>
        <span className="bg-yellow-400 text-[#1a1a2e] px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">
          Acompanhe &rarr;
        </span>
      </div>
    </Link>
  );
}
