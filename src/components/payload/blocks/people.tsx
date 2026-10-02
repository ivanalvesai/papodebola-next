/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { gridColsClass } from "@/lib/cms-render";

// Pessoas / equipe: foto redonda, nome, cargo, texto curto e links.
export function PeopleBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.name);
  if (!items.length) return null;
  return (
    <div>
      {block.title && <h2 className="mb-3 text-lg font-bold text-text-primary">{block.title}</h2>}
      <div className={`grid grid-cols-1 gap-4 ${gridColsClass(block.columns)}`}>
        {items.map((it: any, i: number) => {
          const photo = it.photo && typeof it.photo === "object" && it.photo.url ? it.photo : null;
          const links = (it.links || []).filter((l: any) => l?.url);
          return (
            <div key={i} className="flex flex-col items-center gap-2 rounded-lg border border-border-custom bg-card-bg p-5 text-center">
              {photo && (
                <img src={photo.url} alt={photo.alt || it.name} className="h-24 w-24 rounded-full object-cover" />
              )}
              <h3 className="text-base font-bold text-text-primary">{it.name}</h3>
              {it.role && <p className="text-sm text-text-muted">{it.role}</p>}
              {it.text && <p className="text-sm text-text-secondary">{it.text}</p>}
              {links.length > 0 && (
                <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
                  {links.map((l: any, j: number) => (
                    <a key={j} href={l.url} className="text-sm font-semibold text-green hover:underline">
                      {l.label || l.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
