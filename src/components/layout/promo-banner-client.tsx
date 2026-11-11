"use client";

import { useEffect, useState } from "react";
import type { PromoBanner } from "@/lib/data/promo-banners";

// Lado do navegador do banner promocional:
//  - confere início/fim pela hora do visitante (a página pode estar em cache);
//  - com vários banners no período, sorteia um por visita;
//  - página gerada no build vem sem banners → busca em /api/promo-banners;
//  - ?banner=preview mostra também os sem link e os que ainda não começaram (teste).
function inWindow(b: PromoBanner, now: number): boolean {
  return (!b.startsAt || Date.parse(b.startsAt) <= now) && (!b.endsAt || Date.parse(b.endsAt) > now);
}

export function PromoBannerClient({ banners, initialSlug }: { banners: PromoBanner[]; initialSlug: string | null }) {
  const [list, setList] = useState(banners);
  const [slug, setSlug] = useState(initialSlug);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get("banner") === "preview";
    setPreview(isPreview);
    let alive = true;
    const pick = (items: PromoBanner[]) => {
      const now = Date.now();
      const ok = items.filter((b) => (isPreview ? !b.endsAt || Date.parse(b.endsAt) > now : b.hasLink && inWindow(b, now)));
      if (!alive) return;
      setList(items);
      setSlug(ok.length ? ok[Math.floor(Math.random() * ok.length)].slug : null);
    };
    // Sorteia já com o que veio no HTML e confirma com a lista atual: a página pode estar
    // em cache de antes de um banner ganhar link, trocar de arte ou sair do ar.
    if (banners.length) pick(banners);
    fetch("/api/promo-banners")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j || !Array.isArray(j.banners)) return;
        const fresh: PromoBanner[] = j.banners;
        const same = fresh.length === banners.length && fresh.every((b, i) => JSON.stringify(b) === JSON.stringify(banners[i]));
        if (!same) pick(fresh);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [banners]);

  const b = slug ? list.find((x) => x.slug === slug) : null;
  if (!b) return null;
  const linked = b.hasLink;

  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-3">
      <a
        href={linked ? `/oferta/${encodeURIComponent(b.slug)}` : "#"}
        target={linked ? "_blank" : undefined}
        rel="sponsored nofollow noopener"
        onClick={linked ? undefined : (e) => e.preventDefault()}
        className="relative block overflow-hidden rounded-xl shadow-sm"
        aria-label={b.alt}
      >
        <picture>
          <source media="(max-width: 640px)" srcSet={b.mobile} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.desktop}
            alt={b.alt}
            width={1200}
            height={300}
            className="block w-full h-auto aspect-[3/1] sm:aspect-[4/1] object-cover"
          />
        </picture>
        <span className="absolute bottom-1.5 right-2 rounded bg-black/45 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
          {preview && !linked ? "Prévia sem link" : "Publicidade"}
        </span>
      </a>
    </div>
  );
}
