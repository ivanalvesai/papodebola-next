/* eslint-disable @typescript-eslint/no-explicit-any */
import { TweetEmbedLoader } from "@/components/article/x-embed";

// Post do X (Twitter): blockquote oficial + widgets.js. A legenda vai no texto do <a>
// (aparece só até o script trocar o blockquote pelo card).
export function XPostBlock({ block }: { block: any }) {
  const url = String(block.url || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?x\.com\//i, "https://twitter.com/");
  if (!/^https?:\/\/(www\.|mobile\.)?twitter\.com\//i.test(url)) return null;
  return (
    <div className="flex justify-center">
      <blockquote className="twitter-tweet" data-lang="pt" data-dnt="true">
        <a href={url}>{block.caption || "Ver post no X"}</a>
      </blockquote>
      <TweetEmbedLoader />
    </div>
  );
}
