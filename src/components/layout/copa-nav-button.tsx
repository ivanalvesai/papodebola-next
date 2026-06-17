"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

// Mesma cor dourada do banner da Copa na home (WorldCupBanner).
const WC_GOLD =
  "linear-gradient(135deg, #8a6c1b 0%, #c9a227 22%, #f3d774 45%, #fbe6a6 52%, #f3d774 60%, #c9a227 80%, #8a6c1b 100%)";

/**
 * Botão especial da Copa do Mundo pro menu (topo e lateral). Dourado igual ao banner
 * da home, com troféu e um brilho que varre (shine) pra dar destaque. Aponta sempre
 * pra /futebol/copa-do-mundo.
 */
export function CopaNavButton({
  onClick,
  variant = "top",
}: {
  onClick?: () => void;
  variant?: "top" | "side";
}) {
  const full = variant === "side";
  return (
    <Link
      href="/futebol/copa-do-mundo"
      onClick={onClick}
      aria-label="Copa do Mundo 2026"
      className={`pdb-copa-btn group relative inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full font-extrabold uppercase tracking-wide text-black [text-shadow:0_1px_2px_rgba(255,255,255,0.5)] shadow-[0_2px_8px_rgba(201,162,39,0.45)] ring-1 ring-[#8a6c1b]/40 transition-transform duration-200 hover:scale-[1.04] ${
        full ? "w-full justify-center px-4 py-2.5 text-sm" : "px-3 py-1.5 text-[12px]"
      }`}
      style={{ background: WC_GOLD }}
    >
      <Trophy className={`shrink-0 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] ${full ? "h-4 w-4" : "h-3.5 w-3.5"}`} />
      <span className="relative z-[1]">Copa do Mundo</span>
      {/* brilho que varre */}
      <span aria-hidden className="pdb-copa-shine" />
      <style>{`
        .pdb-copa-btn .pdb-copa-shine {
          position: absolute;
          top: 0;
          left: -60%;
          height: 100%;
          width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.7), transparent);
          transform: skewX(-20deg);
          animation: pdbCopaShine 3.4s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes pdbCopaShine {
          0% { left: -60%; }
          60%, 100% { left: 140%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pdb-copa-btn .pdb-copa-shine { animation: none; opacity: 0; }
        }
      `}</style>
    </Link>
  );
}
