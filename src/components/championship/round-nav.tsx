"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface RoundNavProps {
  rounds: number[];
  currentRound: number;
  selectedRound: number;
  onRoundChange: (round: number) => void;
}

export function RoundNav({ rounds, currentRound, selectedRound, onRoundChange }: RoundNavProps) {
  const idx = rounds.indexOf(selectedRound);

  return (
    <div className="flex items-center justify-between bg-body rounded-lg px-3 py-2">
      <button
        onClick={() => idx > 0 && onRoundChange(rounds[idx - 1])}
        disabled={idx <= 0}
        className="p-1 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="text-sm font-semibold text-text-primary">
        Rodada {selectedRound}
        {selectedRound === currentRound && (
          <span className="ml-2 text-[10px] bg-green text-white px-1.5 py-0.5 rounded-full">
            Atual
          </span>
        )}
      </div>

      <button
        onClick={() => idx < rounds.length - 1 && onRoundChange(rounds[idx + 1])}
        disabled={idx >= rounds.length - 1}
        className="p-1 rounded hover:bg-border-light disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
