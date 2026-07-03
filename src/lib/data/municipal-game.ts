import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

// Jogo do municipal com VÍDEO + comentários editáveis (collection municipalGames no /cms).
// Sem lance a lance da API — a "página de jogo" é montada com o vídeo + textos do CMS.
/* eslint-disable @typescript-eslint/no-explicit-any */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export interface MunicipalGame {
  slug: string;
  matchup: string;
  home: string;
  away: string;
  date: string;
  time: string;
  roundLabel: string;
  venue: string;
  division: string;
  youtubeUrl: string;
  homeLineup: string[];
  awayLineup: string[];
  contentHtml: string;
}

// callout (bloco de comentário verde) → <div class="pdb-callout pdb-callout-{style}">;
// upload (imagem) → <figure>. Mesmo visual dos posts (a CSS .pdb-callout-* já existe).
const converters: any = ({ defaultConverters }: any) => ({
  ...defaultConverters,
  blocks: {
    callout: ({ node }: any) => {
      const style = node?.fields?.style || "info";
      const x = node?.fields?.content;
      const inner = x?.root?.children?.length ? convertLexicalToHTML({ data: x }) : "";
      return `<div class="pdb-callout pdb-callout-${style}">${inner}</div>`;
    },
  },
  upload: ({ node }: any) => {
    const doc = node?.value;
    if (!doc || typeof doc !== "object" || !doc.url) return "";
    const src = String(doc.url).startsWith("http") ? doc.url : `${SITE_URL}${doc.url}`;
    const alt = String(doc.alt || "").replace(/"/g, "&quot;");
    const cap = String(node?.fields?.caption || "").trim();
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const figcap = cap ? `<figcaption>${esc(cap)}</figcaption>` : "";
    return `<figure class="pdb-img pdb-img-center"><img src="${src}" alt="${alt}" loading="lazy" />${figcap}</figure>`;
  },
});

const lines = (s: unknown): string[] =>
  String(s || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

export async function getMunicipalGame(slug: string): Promise<MunicipalGame | null> {
  if (!slug || process.env.NEXT_PHASE === "phase-production-build") return null;
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "municipalGames",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    const d: any = res.docs[0];
    if (!d) return null;
    let html = "";
    const c = d.content;
    if (c?.root?.children?.length) {
      try {
        html = convertLexicalToHTML({ data: c, converters });
      } catch {
        html = "";
      }
    }
    return {
      slug: d.slug,
      matchup: d.matchup || [d.home, d.away].filter(Boolean).join(" x "),
      home: d.home || "",
      away: d.away || "",
      date: d.date || "",
      time: d.time || "",
      roundLabel: d.roundLabel || "",
      venue: d.venue || "",
      division: d.division || "",
      youtubeUrl: d.youtubeUrl || "",
      homeLineup: lines(d.homeLineup),
      awayLineup: lines(d.awayLineup),
      contentHtml: html,
    };
  } catch {
    return null;
  }
}

export async function getMunicipalGameSlugs(): Promise<string[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "municipalGames",
      limit: 200,
      depth: 0,
      pagination: false,
    });
    return res.docs.map((d: any) => d.slug).filter(Boolean);
  } catch {
    return [];
  }
}
