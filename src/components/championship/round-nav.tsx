"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface RoundNavItem {
  key: string;
  label: string;
}

interface RoundNavProps {
  rounds: RoundNavItem[];
  currentKey: string;
  selectedKey: string;
  onChange: (key: string) => void;
}

export function RoundNav({ rounds, currentKey, selectedKey, onChange }: RoundNavProps) {
  const idx = rounds.findIndex((r) => r.key === selectedKey);
  const current = rounds[idx];

  return (
    <div className="flex items-center justify-between bg-body rounded-lg px-3 py-2">
      <button
        onClick={() => idx > 0 && onChange(rounds[idx - 1].key)}
        disabled={idx <= 0}
        className="p-1 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
        aria-label="Rodada anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="text-sm font-semibold text-text-primary text-center">
        {current?.label || "—"}
        {selectedKey === currentKey && (
          <span className="ml-2 text-[10px] bg-green text-white px-1.5 py-0.5 rounded-full">
            Atual
          </span>
        )}
      </div>

      <button
        onClick={() => idx < rounds.length - 1 && onChange(rounds[idx + 1].key)}
        disabled={idx >= rounds.length - 1}
        className="p-1 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
        aria-label="Próxima rodada"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
