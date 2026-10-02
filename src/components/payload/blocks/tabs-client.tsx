"use client";

import { useId, useState, type ReactNode } from "react";

// Abas: todos os painéis vêm renderizados do servidor (conteúdo indexável); o cliente só alterna.
export function TabsClient({ labels, panels }: { labels: string[]; panels: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border-custom">
        {labels.map((label, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${base}-panel-${i}`}
            onClick={() => setActive(i)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold ${
              active === i ? "border-green text-green" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          hidden={active !== i}
          className="pt-4"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
