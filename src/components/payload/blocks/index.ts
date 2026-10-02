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
import { FaqBlock } from "./faq";
import { TestimonialsBlock } from "./testimonials";
import { CarouselBlock } from "./carousel-client";
import { InstagramBlock } from "./instagram";
import { XPostBlock } from "./x-post";
import { EmbedBlock } from "./embed";
import { CLIENT_SAFE_COMPONENTS } from "./client-safe";

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
  faq: FaqBlock,
  testimonials: TestimonialsBlock,
  carousel: CarouselBlock,
  instagram: InstagramBlock,
  xPost: XPostBlock,
  embed: EmbedBlock,
};

// Client-safe = os do barrel ./client-safe (sem richText, columns, list, mediaText, tabs, snippet, countdown).
// Client components importam de ./client-safe, NUNCA deste index (puxa rich-text, server-only).
export const CLIENT_SAFE_SLUGS: readonly string[] = Object.keys(CLIENT_SAFE_COMPONENTS);
export { CLIENT_SAFE_COMPONENTS };

export { BlockButtons } from "./buttons";
export { lucideIcon } from "./icon-list";
export { hideOnClass } from "./hide-on";
