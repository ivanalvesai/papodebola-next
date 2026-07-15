import { InstagramEmbedLoader } from "./instagram-embed";
import { TweetEmbedLoader } from "./x-embed";
import { ProseStyles } from "./prose-styles";

// Corpo "prose-article" (HTML já convertido do Lexical) com os MESMOS estilos e loaders
// dos posts. Usado nas páginas do CMS (PageBlock) para os cards (Instagram, X, escalação,
// tabela, colunas, destaque) renderizarem igual aos posts. Os loaders só entram quando há
// de fato um card na página (custo zero sem eles).
export function ProseBody({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  return (
    <>
      <ProseStyles />
      <div
        className={`prose-article${className ? " " + className : ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {html.includes("instagram-media") && <InstagramEmbedLoader />}
      {html.includes("twitter-tweet") && <TweetEmbedLoader />}
    </>
  );
}
