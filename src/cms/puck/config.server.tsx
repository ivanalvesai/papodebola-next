// Config do Puck pro SERVIDOR: mesmos campos do editor (fields.ts), mas cada componente
// é convertido no bloco da biblioteca e renderizado pelo PageBlock real do site.
import type { Config } from "@puckeditor/core";
import { FIELDS } from "./fields";
import { PageBlock } from "@/components/payload/page-blocks";
import { puckPropsToBlock } from "./to-block";
/* eslint-disable @typescript-eslint/no-explicit-any */

const viaBlock = (type: string) => ({
  fields: FIELDS[type],
  render: (props: any) => {
    const b = puckPropsToBlock(type, props);
    return b ? <PageBlock block={b} pageWidth="wide" /> : <></>;
  },
});

const BG: Record<string, string> = {
  none: "",
  card: "rounded-lg border border-border-custom bg-card-bg p-6",
  green: "rounded-lg bg-green p-6 text-white [&_h2]:text-white",
  dark: "rounded-lg bg-[#111827] p-6 text-white [&_h2]:text-white",
};

// Slots do Puck renderizam um <div> próprio e aceitam className.
const COL = "min-w-0 space-y-5";

export const serverConfig: Config = {
  components: {
    Heading: viaBlock("Heading"),
    Text: viaBlock("Text"),
    Image: viaBlock("Image"),
    Button: viaBlock("Button"),
    TeamWidget: viaBlock("TeamWidget"),
    Standings: viaBlock("Standings"),
    Scorers: viaBlock("Scorers"),
    NewsFeed: viaBlock("NewsFeed"),
    LiveMatch: viaBlock("LiveMatch"),
    TodayGames: viaBlock("TodayGames"),
    Columns: {
      fields: FIELDS.Columns,
      render: ({ count, col1: C1, col2: C2, col3: C3 }: any) => (
        <div className={`grid gap-4 ${(count || 2) === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <C1 className={COL} />
          <C2 className={COL} />
          {(count || 2) === 3 && <C3 className={COL} />}
        </div>
      ),
    },
    Section: {
      fields: FIELDS.Section,
      render: ({ title, background, content: Content }: any) => (
        <section className={BG[background || "none"] || undefined}>
          {title && <h2 className="mb-4 text-lg font-bold text-text-primary">{title}</h2>}
          <Content className="space-y-5" />
        </section>
      ),
    },
  },
};
