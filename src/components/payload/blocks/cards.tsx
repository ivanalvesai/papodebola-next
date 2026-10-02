/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { gridColsClass } from "@/lib/cms-render";

export function CardsBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.title);
  if (!items.length) return null;
  return (
    <div>
      {block.title && <h2 className="mb-3 text-lg font-bold text-text-primary">{block.title}</h2>}
      <div className={`grid grid-cols-1 gap-4 ${gridColsClass(block.columns)}`}>
        {items.map((it: any, i: number) => {
          const img = it.image && typeof it.image === "object" && it.image.url ? it.image : null;
          return (
            <article key={i} className="flex flex-col overflow-hidden rounded-lg border border-border-custom bg-card-bg">
              {img && <img src={img.url} alt={img.alt || it.title} className="aspect-[16/10] w-full object-cover" />}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-base font-bold text-text-primary">
                  {it.href ? (
                    <a href={it.href} className="hover:text-green">
                      {it.title}
                    </a>
                  ) : (
                    it.title
                  )}
                </h3>
                {it.text && <p className="text-sm text-text-secondary">{it.text}</p>}
                {it.href && (
                  <a href={it.href} className="mt-auto pt-1 text-sm font-semibold text-green hover:underline">
                    {it.linkLabel || "Saiba mais"}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
