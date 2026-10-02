/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatsCounter } from "./stats-counter";

const BG: Record<string, string> = {
  green: "rounded-lg bg-green p-6 text-white sm:p-8",
  dark: "rounded-lg bg-[#111827] p-6 text-white sm:p-8",
  none: "",
};
const COLS: Record<number, string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

// Números (2 a 4): valor grande + legenda. O contador animado é client (StatsCounter).
export function StatsBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.value);
  if (!items.length) return null;
  const onColor = block.background === "green" || block.background === "dark";
  return (
    <div className={BG[block.background] || ""}>
      {block.title && (
        <h2 className={`mb-4 text-lg font-bold ${onColor ? "" : "text-text-primary"}`}>{block.title}</h2>
      )}
      <div className={`grid grid-cols-2 gap-4 ${COLS[Math.min(items.length, 4)] || ""}`}>
        {items.map((it: any, i: number) => (
          <div key={i} className="text-center">
            <div className={`text-3xl font-bold ${onColor ? "" : "text-green"}`}>
              <StatsCounter value={String(it.value)} suffix={it.suffix} />
            </div>
            {it.label && (
              <div className={`mt-1 text-sm ${onColor ? "opacity-90" : "text-text-secondary"}`}>{it.label}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
