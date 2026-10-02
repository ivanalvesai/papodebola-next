/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

export function GalleryBlock({ block }: { block: any }) {
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
