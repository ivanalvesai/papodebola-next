import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import type { PayloadPage } from "@/lib/data/payload-pages";
import { pathBreadcrumb } from "@/lib/cms-render";
import { PageBlock } from "./page-blocks";
import { PuckRender } from "@/cms/puck/render"; // Task 9; até lá, criar stub que retorna null

/* eslint-disable @typescript-eslint/no-explicit-any */
function Hero({ page }: { page: PayloadPage }) {
  const h = page.hero || {};
  if (!h.h1 && !h.subtitle) return null;
  if (h.style === "banner") {
    const img = h.image && typeof h.image === "object" ? h.image : null;
    return (
      <div className="relative mb-8 overflow-hidden rounded-lg bg-[#0B3D2E] text-white">
        {img?.url && <img src={img.url} alt={img.alt || ""} className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="relative px-6 py-14 sm:px-10">
          {h.h1 && <h1 className="text-3xl font-bold sm:text-4xl">{h.h1}</h1>}
          {h.subtitle && <p className="mt-3 max-w-2xl text-base text-white/85">{h.subtitle}</p>}
        </div>
      </div>
    );
  }
  const align = h.style === "left" ? "text-left" : "text-center";
  return (
    <div className={`mb-8 ${align}`}>
      {h.h1 && <h1 className="text-2xl font-bold text-text-primary">{h.h1}</h1>}
      {h.subtitle && <p className="mt-2 text-sm text-text-muted">{h.subtitle}</p>}
    </div>
  );
}

export function PageBlocks({ page }: { page: PayloadPage }) {
  const width = page.layoutStyle?.width || "narrow";
  const crumbs = page.layoutStyle?.showBreadcrumb && page.path ? pathBreadcrumb(page.path, page.hero?.h1 || page.title || "") : null;
  const body = page.editor === "puck" && page.puckData?.content?.length
    ? <PuckRender data={page.puckData} />
    : (page.layout || []).map((block: any, i: number) => <PageBlock key={i} block={block} pageWidth={width} />);

  if (width === "narrow") {
    // IDÊNTICO ao HTML atual quando não há breadcrumb (default) — não mudar classes.
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12">
        {crumbs && <PageBreadcrumb className="mb-4" items={crumbs} />}
        <Hero page={page} />
        <div className="space-y-5 rounded-lg border border-border-custom bg-card-bg p-8 leading-relaxed text-text-secondary">{body}</div>
      </div>
    );
  }
  if (width === "wide") {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8">
        {crumbs && <PageBreadcrumb className="mb-4" items={crumbs} />}
        <Hero page={page} />
        <div className="space-y-6 text-text-secondary">{body}</div>
      </div>
    );
  }
  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-[1240px] px-4">{crumbs && <PageBreadcrumb className="mb-4" items={crumbs} />}<Hero page={page} /></div>
      <div className="space-y-6 text-text-secondary [&>*:not([data-full])]:mx-auto [&>*:not([data-full])]:max-w-[1240px] [&>*:not([data-full])]:px-4">{body}</div>
    </div>
  );
}
