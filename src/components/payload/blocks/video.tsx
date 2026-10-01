/* eslint-disable @typescript-eslint/no-explicit-any */

// Extrai o ID do vídeo de qualquer formato de link do YouTube (watch, youtu.be, shorts, embed).
export function ytId(url: string): string {
  if (!url) return "";
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : "";
}

// Bloco "youtube" (Vídeo). O suporte a Vimeo (campo `provider`) entra na Task 6.
export function VideoBlock({ block }: { block: any }) {
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
