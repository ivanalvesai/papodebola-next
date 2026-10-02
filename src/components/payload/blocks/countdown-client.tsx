"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { splitCountdown, type CountdownParts } from "@/lib/countdown";

export interface CountdownMatch {
  home: string;
  away: string;
  homeId?: number | null;
  awayId?: number | null;
  timestamp: number; // unix (segundos)
  league?: string | null;
  when?: string | null; // "sáb, 04/10 · 16:00" (formatado no servidor, fuso de Brasília)
  href?: string | null;
}

function Team({ name, id }: { name: string; id?: number | null }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      {id ? (
        <img src={`/api/team-img/${id}`} alt={`Escudo ${name}`} width={48} height={48} className="h-12 w-12 object-contain" loading="lazy" />
      ) : null}
      <span className="text-sm font-bold text-text-primary">{name}</span>
    </div>
  );
}

const LABELS: [keyof CountdownParts, string][] = [["d", "Dias"], ["h", "Horas"], ["m", "Min"], ["s", "Seg"]];

// Contagem regressiva até o apito. No servidor (e no 1º render do cliente) mostra "--" pra não
// dar mismatch de hidratação; os números entram no mount e atualizam a cada 1 s.
export function CountdownClient({ title, match, showInfo }: { title: string; match: CountdownMatch; showInfo: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const startMs = match.timestamp * 1000;
  const started = now !== null && startMs <= now;
  const parts = now === null ? null : splitCountdown(startMs - now);
  const info = [match.league, match.when].filter(Boolean).join(" · ");

  return (
    <div className="rounded-lg border border-border-custom bg-card-bg p-5">
      <h2 className="mb-4 text-center text-lg font-bold text-text-primary">{title}</h2>
      <div className="flex items-center justify-center gap-3">
        <Team name={match.home} id={match.homeId} />
        <span className="text-sm font-semibold text-text-muted">x</span>
        <Team name={match.away} id={match.awayId} />
      </div>
      {showInfo && info && <p className="mt-3 text-center text-sm text-text-muted">{info}</p>}
      {started ? (
        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-green">Começou!</p>
          {match.href && (
            <a href={match.href} className="mt-1 inline-block text-sm font-semibold text-green hover:underline">
              Acompanhe o jogo
            </a>
          )}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2" aria-live="off">
          {LABELS.map(([k, label]) => (
            <div key={k} className="flex flex-col items-center rounded-lg bg-green/10 px-2 py-3">
              <span className="text-2xl font-bold tabular-nums text-green">
                {parts ? String(parts[k]).padStart(2, "0") : "--"}
              </span>
              <span className="text-xs font-semibold uppercase text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
