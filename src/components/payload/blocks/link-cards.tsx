/* eslint-disable @typescript-eslint/no-explicit-any */

export function LinkCardsBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.label && it?.href);
  if (!items.length) return null;
  return (
    <div>
      {block.title && (
        <h2 className="mb-3 text-lg font-bold text-text-primary">{block.title}</h2>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it: any, i: number) => (
          <a
            key={i}
            href={it.href}
            className="rounded-lg border border-border-custom bg-card-bg px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-green hover:text-green"
          >
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );
}
