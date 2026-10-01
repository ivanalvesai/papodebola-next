import type { ComponentType } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HeadingBlock } from "./heading";
import { ImageBlock } from "./image";
import { TableBlock } from "./table";
import { GalleryBlock } from "./gallery";
import { QuoteBlock } from "./quote";
import { ButtonBlock } from "./button";
import { InfoCardBlock } from "./info-card";
import { NoteBlock } from "./note";
import { VideoBlock } from "./video";
import { LinkCardsBlock } from "./link-cards";
import { HeroBlock } from "./hero";
import { CtaBlock } from "./cta";
import { CardsBlock } from "./cards";
import { StatsBlock } from "./stats";
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

// Barrel seguro pra client components (canvas do editor visual). NÃO importar aqui rich-text,
// columns, list, media-text, tabs, snippet nem countdown (lexicalToHtml server-only / RichText do Lexical).
// O barrel completo (server) é ./index.ts.
export const CLIENT_SAFE_COMPONENTS: Record<string, ComponentType<{ block: any }>> = {
  heading: HeadingBlock,
  image: ImageBlock,
  table: TableBlock,
  gallery: GalleryBlock,
  quote: QuoteBlock,
  button: ButtonBlock,
  infoCard: InfoCardBlock,
  note: NoteBlock,
  youtube: VideoBlock,
  linkCards: LinkCardsBlock,
  hero: HeroBlock,
  cta: CtaBlock,
  cards: CardsBlock,
  stats: StatsBlock,
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
