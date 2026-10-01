import { RichText } from "@payloadcms/richtext-lexical/react";
import type { PayloadPage } from "@/lib/data/payload-pages";
import { lexicalToHtml } from "@/lib/data/articles-payload";
import { ProseBody } from "@/components/article/prose-body";
import { SectionBlock } from "./section-block";
import { TeamWidgetBlock, StandingsBlock, ScorersBlock, NewsFeedBlock, LiveMatchBlock, TodayGamesDataBlock } from "./data-blocks";

// Renderiza uma "Página" do Payload (hero + blocos) com o visual do site.
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

// Extrai o ID do vídeo de qualquer formato de link do YouTube (watch, youtu.be, shorts, embed).
function ytId(url: string): string {
  if (!url) return "";
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : "";
}

export async function PageBlock({ block, pageWidth = "narrow" }: { block: any; pageWidth?: string }) {
  switch (block.blockType) {
    case "heading": {
      const Tag = block.level === "h3" ? "h3" : "h2";
      const size = block.level === "h3" ? "text-base" : "text-lg";
      return <Tag className={`pt-2 ${size} font-bold text-text-primary`}>{block.text}</Tag>;
    }
    case "richText": {
      // Editor completo (mesmos cards dos posts) → converte pra HTML e renderiza com o
      // corpo "prose-article" (estilos + loaders de Instagram/X). Ver ProseBody.
      const html = lexicalToHtml(block.content);
      return html ? <ProseBody html={html} /> : null;
    }
    case "image": {
      const url = block.image?.url;
      if (!url) return null;
      const align =
        block.align === "left" ? "mr-auto" : block.align === "right" ? "ml-auto" : "mx-auto";
      return (
        <figure className={`max-w-full ${align}`}>
          <img src={url} alt={block.image?.alt || ""} className="rounded-lg" />
          {block.caption && (
            <figcaption className="mt-1 text-center text-xs text-text-muted">{block.caption}</figcaption>
          )}
        </figure>
      );
    }
    case "columns": {
      const cols = block.columns || [];
      const gridCols =
        cols.length >= 4 ? "sm:grid-cols-4" : cols.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
      return (
        <div className={`grid gap-4 ${gridCols}`}>
          {cols.map((c: any, i: number) => (
            <div key={i}>{c.content ? <RichText data={c.content} /> : null}</div>
          ))}
        </div>
      );
    }
    case "table": {
      const headers = block.headers || [];
      const rows = block.rows || [];
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {headers.length > 0 && (
              <thead>
                <tr>
                  {headers.map((h: any, i: number) => (
                    <th key={i} className="border border-border-custom bg-body px-3 py-2 text-left font-semibold">
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={i}>
                  {(r.cells || []).map((cell: any, j: number) => (
                    <td key={j} className="border border-border-custom px-3 py-2">
                      {cell.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "gallery": {
      const images = block.images || [];
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((g: any, i: number) =>
            g.image?.url ? (
              <img key={i} src={g.image.url} alt={g.image?.alt || ""} className="aspect-square w-full rounded-lg object-cover" />
            ) : null
          )}
        </div>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-4 border-green pl-4 italic text-text-primary">
          <p>{block.text}</p>
          {block.author && <footer className="mt-1 text-sm not-italic text-text-muted">— {block.author}</footer>}
        </blockquote>
      );
    case "button":
      return (
        <a
          href={block.url}
          className={`inline-block rounded-lg px-4 py-2 text-sm font-semibold ${
            block.style === "outline" ? "border border-green text-green" : "bg-green text-white"
          }`}
        >
          {block.label}
        </a>
      );
    case "list": {
      const items = block.items || [];
      return (
        <ul className="list-disc space-y-2 pl-5 [&_a]:text-green [&_a:hover]:underline [&_p]:m-0">
          {items.map((it: any, i: number) => (
            <li key={i}>{it.content ? <RichText data={it.content} /> : null}</li>
          ))}
        </ul>
      );
    }
    case "infoCard":
      return (
        <div className="rounded-lg bg-body p-4">
          <div className="text-sm font-semibold text-text-primary">{block.label}</div>
          <div className="text-sm text-text-muted">
            {block.href ? (
              <a href={block.href} className="text-green hover:underline">
                {block.value}
              </a>
            ) : (
              block.value
            )}
          </div>
        </div>
      );
    case "note":
      return <p className="text-xs text-text-muted">{block.text}</p>;
    case "youtube": {
      const id = ytId(block.url);
      if (!id) return null;
      return (
        <figure className="my-1">
          {block.title && (
            <h3 className="mb-2 text-base font-bold text-text-primary">{block.title}</h3>
          )}
          <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={block.title || "Vídeo do YouTube"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-1 text-center text-xs text-text-muted">{block.caption}</figcaption>
          )}
        </figure>
      );
    }
    case "linkCards": {
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
    case "section":
      return <SectionBlock block={block} pageWidth={pageWidth} renderBlocks={(bs) => bs.map((b, i) => <PageBlock key={i} block={b} pageWidth="narrow" />)} />;
    case "teamWidget": return <TeamWidgetBlock block={block} />;
    case "standings": return <StandingsBlock block={block} />;
    case "scorers": return <ScorersBlock block={block} />;
    case "newsFeed": return <NewsFeedBlock block={block} />;
    case "liveMatch": return <LiveMatchBlock block={block} />;
    case "todayGames": return <TodayGamesDataBlock block={block} />;
    default:
      return null;
  }
}

export { PageBlocks } from "./page-shell";
