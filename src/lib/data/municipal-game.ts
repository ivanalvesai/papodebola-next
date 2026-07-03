import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { readFile } from "fs/promises";
import { join } from "path";

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
  homeBadge: string;
  awayBadge: string;
  startTs: number; // epoch ms do apito (data+hora em Brasília); 0 se não der pra parsear
}

// Escudos: o municipalGames não guarda badge; puxamos do sisgel.json (a partida com o
// mesmo slug tem homeBadgeLocal/awayBadgeLocal). Reaproveita os escudos já baixados.
async function sisgelBadges(slug: string): Promise<{ home: string; away: string }> {
  try {
    const raw = await readFile(join(process.cwd(), "data", "sisgel.json"), "utf-8");
    const champs = JSON.parse(raw);
    for (const c of champs || []) {
      for (const m of c.matches || []) {
        if (m.slug === slug) return { home: m.homeBadgeLocal || "", away: m.awayBadgeLocal || "" };
      }
    }
  } catch {
    /* sem arquivo */
  }
  return { home: "", away: "" };
}

// "05/07/2026" + "09h40" (Brasília, UTC-3) → epoch ms. 0 se inválido.
function parseStart(date: string, time: string): number {
  const d = String(date).match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const t = String(time).match(/(\d{1,2})[h:](\d{2})/);
  if (!d) return 0;
  const [, dd, mm, yyyy] = d;
  const hh = t ? t[1] : "00";
  const mi = t ? t[2] : "00";
  // BRT = UTC-3 → adiciona 3h pra virar UTC
  return Date.UTC(+yyyy, +mm - 1, +dd, +hh + 3, +mi);
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
    const badges = await sisgelBadges(d.slug);
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
      homeBadge: badges.home,
      awayBadge: badges.away,
      startTs: parseStart(d.date || "", d.time || ""),
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
