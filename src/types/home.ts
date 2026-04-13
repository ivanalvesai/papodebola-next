import type { Highlight, Transfer } from "./team";
import type { TopMatch } from "./match";

export interface HomeNews {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image: string;
}

export interface HomeData {
  highlights: Highlight[];
  transfers: Transfer[];
  news: HomeNews[];
  topMatches: TopMatch[];
  updatedAt: string;
}
