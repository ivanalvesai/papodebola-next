"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useRef } from "react";

const ASPECT: Record<string, string> = { "16:9": "aspect-video", "4:3": "aspect-[4/3]", "1:1": "aspect-square" };

// Carrossel de imagens: scroll-snap nativo + botões anterior/próximo (sem lib).
export function CarouselBlock({ block }: { block: any }) {
  const track = useRef<HTMLDivElement>(null);
  const images = (block.images || []).filter(
    (it: any) => it?.image && typeof it.image === "object" && it.image.url
  );
  if (!images.length) return null;
  const aspect = ASPECT[block.aspect] || ASPECT["16:9"];
  const go = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };
  const btn =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl leading-none text-white hover:bg-black/80";
  return (
    <div>
      {block.title && <h2 className="mb-3 text-lg font-bold text-text-primary">{block.title}</h2>}
      <div className="relative">
        <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none]">
          {images.map((it: any, i: number) => (
            <figure key={i} className="w-full shrink-0 snap-start">
              <img
                src={it.image.url}
                alt={it.image.alt || it.caption || ""}
                className={`${aspect} w-full object-cover`}
                loading={i ? "lazy" : undefined}
              />
              {it.caption && <figcaption className="mt-1 text-center text-xs text-text-muted">{it.caption}</figcaption>}
            </figure>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Imagem anterior" onClick={() => go(-1)} className={`${btn} left-2`}>
              ‹
            </button>
            <button type="button" aria-label="Próxima imagem" onClick={() => go(1)} className={`${btn} right-2`}>
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
