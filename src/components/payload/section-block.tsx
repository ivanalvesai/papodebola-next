import type { ReactNode } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
const BG: Record<string, string> = { none: "", card: "rounded-lg border border-border-custom bg-card-bg p-6", green: "rounded-lg bg-green p-6 text-white [&_h2]:text-white", dark: "rounded-lg bg-[#111827] p-6 text-white [&_h2]:text-white" };
const WIDTH: Record<string, string> = { narrow: "mx-auto max-w-[720px]", wide: "mx-auto max-w-[1240px]", full: "w-full" };

// Seção em colunas. `renderBlocks` é injetado pelo PageBlock (evita import circular).
export function SectionBlock({ block, pageWidth, renderBlocks }: { block: any; pageWidth: string; renderBlocks: (blocks: any[]) => ReactNode }) {
  const cols: any[] = block.columns?.length ? block.columns : [{ span: "1", blocks: [] }];
  const spans = cols.map((c) => (c.span === "2" ? 2 : 1));
  const multi = cols.length > 1;
  const inner = (
    <div className={BG[block.background || "none"]}>
      {block.title && <h2 className="mb-4 text-lg font-bold text-text-primary">{block.title}</h2>}
      <div
        className={multi ? "grid gap-4 max-md:!grid-cols-1" : "space-y-5"}
        style={multi ? { gridTemplateColumns: spans.map((s) => `${s}fr`).join(" ") } : undefined}
      >
        {cols.map((c, i) => <div key={i} className="min-w-0 space-y-5">{renderBlocks(c.blocks || [])}</div>)}
      </div>
    </div>
  );
  // Página estreita: a seção obedece ao card. Página larga/cheia: a seção escolhe a largura.
  if (pageWidth === "narrow") return inner;
  if (pageWidth === "full" && block.width === "full") return <div data-full className="w-full px-4">{inner}</div>;
  return <div className={`${WIDTH[block.width || "wide"]} px-4`}>{inner}</div>;
}
