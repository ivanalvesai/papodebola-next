import { RichText } from "@payloadcms/richtext-lexical/react";
import type { PayloadPage } from "@/lib/data/payload-pages";

// Renderiza uma "Página" do Payload (hero + blocos) com o visual do site.
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

function Block({ block }: { block: any }) {
  switch (block.blockType) {
    case "heading": {
      const Tag = block.level === "h3" ? "h3" : "h2";
      return <Tag className="pt-2 text-lg font-bold text-text-primary">{block.text}</Tag>;
    }
    case "richText":
      return block.content ? <RichText data={block.content} /> : null;
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
    default:
      return null;
  }
}

export function PageBlocks({ page }: { page: PayloadPage }) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12">
      {page.hero?.h1 && <h1 className="text-2xl font-bold text-text-primary">{page.hero.h1}</h1>}
      {page.hero?.subtitle && <p className="mt-2 text-text-muted">{page.hero.subtitle}</p>}
      <div className="mt-6 space-y-5 leading-relaxed text-text-secondary">
        {(page.layout || []).map((block: any, i: number) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
