/* eslint-disable @typescript-eslint/no-explicit-any */
import { InstagramEmbedLoader } from "@/components/article/instagram-embed";

// Post do Instagram: blockquote oficial + embed.js (o loader transforma no card).
export function InstagramBlock({ block }: { block: any }) {
  const url = String(block.url || "").trim();
  if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) return null;
  return (
    <div className="flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ maxWidth: 540, width: "100%", margin: 0 }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          {block.caption || "Ver esta publicação no Instagram"}
        </a>
      </blockquote>
      <InstagramEmbedLoader />
    </div>
  );
}
