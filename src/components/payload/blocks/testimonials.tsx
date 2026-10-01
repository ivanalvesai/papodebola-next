/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

// Depoimentos: grade, ou faixa rolável (scroll-snap) no layout "carousel".
export function TestimonialsBlock({ block }: { block: any }) {
  const items = (block.items || []).filter((it: any) => it?.quote && it?.name);
  if (!items.length) return null;
  const carousel = block.layout === "carousel";
  return (
    <div>
      {block.title && <h2 className="mb-3 text-lg font-bold text-text-primary">{block.title}</h2>}
      <div
        className={
          carousel
            ? "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
            : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((it: any, i: number) => {
          const photo = it.photo && typeof it.photo === "object" && it.photo.url ? it.photo : null;
          return (
            <figure
              key={i}
              className={`flex flex-col gap-3 rounded-lg border border-border-custom bg-card-bg p-5 ${
                carousel ? "w-[85%] shrink-0 snap-start sm:w-80" : ""
              }`}
            >
              <blockquote className="whitespace-pre-line text-text-secondary">&ldquo;{it.quote}&rdquo;</blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                {photo && <img src={photo.url} alt={photo.alt || it.name} className="h-10 w-10 rounded-full object-cover" />}
                <span>
                  <span className="block font-bold text-text-primary">{it.name}</span>
                  {it.role && <span className="block text-sm text-text-muted">{it.role}</span>}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
