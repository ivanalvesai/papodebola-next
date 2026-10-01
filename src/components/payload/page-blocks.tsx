import type { PayloadPage } from "@/lib/data/payload-pages";
import { SectionBlock } from "./section-block";
import { TeamWidgetBlock, StandingsBlock, ScorersBlock, NewsFeedBlock, LiveMatchBlock, TodayGamesDataBlock } from "./data-blocks";
import { BLOCK_COMPONENTS } from "./blocks";
import { hideOnClass } from "./blocks/hide-on";
import { isFullBleedSection } from "@/lib/cms-render";

// Renderiza uma "Página" do Payload (hero + blocos) com o visual do site. Os blocos puros
// (apresentação) vivem em ./blocks; aqui ficam a Seção e os blocos de dados.
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function PageBlock({ block, pageWidth = "narrow" }: { block: any; pageWidth?: string }) {
  const node = renderBlock(block, pageWidth);
  // Só embrulha quando o bloco é escondido em algum dispositivo — sem hideOn o HTML não muda.
  // (Se o componente devolver null, sobra um <div> vazio escondido — inofensivo.)
  const cls = hideOnClass(block);
  if (!cls || !node) return node;
  // Seção largura total: o wrapper vira o filho direto do page-shell, então herda o data-full.
  return isFullBleedSection(block, pageWidth) ? <div data-full="" className={cls}>{node}</div> : <div className={cls}>{node}</div>;
}

function renderBlock(block: any, pageWidth: string) {
  switch (block.blockType) {
    case "section":
      return <SectionBlock block={block} pageWidth={pageWidth} renderBlocks={(bs) => bs.map((b, i) => <PageBlock key={i} block={b} pageWidth="narrow" />)} />;
    case "teamWidget": return <TeamWidgetBlock block={block} />;
    case "standings": return <StandingsBlock block={block} />;
    case "scorers": return <ScorersBlock block={block} />;
    case "newsFeed": return <NewsFeedBlock block={block} />;
    case "liveMatch": return <LiveMatchBlock block={block} />;
    case "todayGames": return <TodayGamesDataBlock block={block} />;
    default: {
      const Comp = BLOCK_COMPONENTS[block.blockType];
      return Comp ? <Comp block={block} /> : null;
    }
  }
}

export { PageBlocks } from "./page-shell";
