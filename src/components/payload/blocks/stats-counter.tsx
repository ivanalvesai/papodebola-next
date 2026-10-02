"use client";

import { useEffect, useRef, useState } from "react";
import { formatStatValue, parseStatValue } from "@/lib/cms-render";

// Número que "conta" de 0 até o valor quando entra na tela. O HTML do servidor já traz o valor
// final (SEO / sem JS); valores não inteiros ("3,5", "R$ 10") ficam estáticos.
export function StatsCounter({ value, suffix }: { value: string; suffix?: string | null }) {
  const parsed = parseStatValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<string>(String(value ?? ""));

  useEffect(() => {
    const el = ref.current;
    if (!parsed || !el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const { target, sep } = parsed;
    let raf = 0;
    setShown(formatStatValue(0, sep));
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        const start = performance.now();
        const duration = 1200;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(formatStatValue(target * eased, sep));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}
