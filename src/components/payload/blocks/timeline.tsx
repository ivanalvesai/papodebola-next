/* eslint-disable @typescript-eslint/no-explicit-any */

// Linha do tempo vertical: borda verde à esquerda com um ponto por marco.
export function TimelineBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.title || it?.date);
  if (!items.length) return null;
  return (
    <div>
      {block.title && <h2 className="mb-4 text-lg font-bold text-text-primary">{block.title}</h2>}
      <ol className="ml-2 space-y-6 border-l-2 border-green pl-6">
        {items.map((it: any, i: number) => (
          <li key={i} className="relative">
            <span aria-hidden="true" className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 border-white bg-green" />
            {it.date && <div className="text-sm font-semibold text-green">{it.date}</div>}
            {it.title && <h3 className="text-base font-bold text-text-primary">{it.title}</h3>}
            {it.text && <p className="mt-1 text-sm text-text-secondary">{it.text}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
