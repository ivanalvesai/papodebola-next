/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

export function ImageBlock({ block }: { block: any }) {
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
