import type { ComponentType } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HeadingBlock } from "./heading";
import { RichTextBlock } from "./rich-text";
import { ImageBlock } from "./image";
import { ColumnsBlock } from "./columns";
import { TableBlock } from "./table";
import { GalleryBlock } from "./gallery";
import { QuoteBlock } from "./quote";
import { ButtonBlock } from "./button";
import { ListBlock } from "./list";
import { InfoCardBlock } from "./info-card";
import { NoteBlock } from "./note";
import { VideoBlock } from "./video";
import { LinkCardsBlock } from "./link-cards";
import { HeroBlock } from "./hero";
import { CtaBlock } from "./cta";
import { CardsBlock } from "./cards";
import { StatsBlock } from "./stats";
import { MediaTextBlock } from "./media-text";
import { PeopleBlock } from "./people";
import { TimelineBlock } from "./timeline";
import { ButtonsBlock } from "./buttons";
import { SocialBlock } from "./social";
import { IconListBlock } from "./icon-list";
import { DividerBlock } from "./divider";

// Blocos "puros" (só apresentação, sem buscar dados) por slug do Payload. Seção, blocos de dados
// e os ricos que dependem de servidor/relacionamento ficam no switch do PageBlock.
export const BLOCK_COMPONENTS: Record<string, ComponentType<{ block: any }>> = {
  heading: HeadingBlock,
  richText: RichTextBlock,
  image: ImageBlock,
  columns: ColumnsBlock,
  table: TableBlock,
  gallery: GalleryBlock,
  quote: QuoteBlock,
  button: ButtonBlock,
  list: ListBlock,
  infoCard: InfoCardBlock,
  note: NoteBlock,
  youtube: VideoBlock,
  linkCards: LinkCardsBlock,
  hero: HeroBlock,
  cta: CtaBlock,
  cards: CardsBlock,
  stats: StatsBlock,
  mediaText: MediaTextBlock,
  people: PeopleBlock,
  timeline: TimelineBlock,
  buttons: ButtonsBlock,
  social: SocialBlock,
  iconList: IconListBlock,
  divider: DividerBlock,
};

// Podem ser importados por client components (canvas do editor visual). Ficam de fora os que
// usam lexicalToHtml (server-only, @/lib/data) ou o RichText do Lexical: richText, columns,
// list, mediaText (e tabs, quando existir) — o editor visual trata esses à parte.
const NOT_CLIENT_SAFE = new Set(["richText", "columns", "list", "mediaText", "tabs"]);
export const CLIENT_SAFE_SLUGS: readonly string[] = Object.keys(BLOCK_COMPONENTS).filter((s) => !NOT_CLIENT_SAFE.has(s));

export { BlockButtons } from "./buttons";
export { lucideIcon } from "./icon-list";
export { hideOnClass } from "./hide-on";
