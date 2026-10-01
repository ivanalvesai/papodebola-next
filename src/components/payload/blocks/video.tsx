/* eslint-disable @typescript-eslint/no-explicit-any */

// Extrai o ID do vídeo de qualquer formato de link do YouTube (watch, youtu.be, shorts, embed).
export function ytId(url: string): string {
  if (!url) return "";
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : "";
}

// Extrai o ID numérico de um link do Vimeo (vimeo.com/123, player.vimeo.com/video/123, …).
export function vimeoId(url: string): string {
  if (!url) return "";
  const m = String(url).match(/vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?(\d+)/);
  return m ? m[1] : "";
}

// Vimeo quando o editor escolheu (provider) ou, no "auto", quando o link é do Vimeo.
function VimeoVideo({ block, id }: { block: any; id: string }) {
  return (
    <figure className="my-1">
      {block.title && (
        <h3 className="mb-2 text-base font-bold text-text-primary">{block.title}</h3>
      )}
      <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={`https://player.vimeo.com/video/${id}?dnt=1`}
          title={block.title || "Vídeo do Vimeo"}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
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

// Bloco "youtube" (Vídeo YouTube/Vimeo). Links do YouTube renderizam exatamente como antes.
export function VideoBlock({ block }: { block: any }) {
  if (block.provider !== "youtube") {
    const vid = vimeoId(block.url);
    if (vid) return <VimeoVideo block={block} id={vid} />;
    if (block.provider === "vimeo") return null;
  }
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
