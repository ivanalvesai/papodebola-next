import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { articleHref, cleanTag } from "@/lib/config";
import { normalizeSponsor, sponsorCardHtml } from "./sponsor";
import type { Article } from "@/types/article";

// Leitura de artigos do Payload (Fase 3c). getArticles/getArticleBySlug tentam
// daqui primeiro; se der null (banco fora), caem pro WordPress (fallback).
/* eslint-disable @typescript-eslint/no-explicit-any */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function escHtml(s: string): string {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escAttr(s: string): string {
  return escHtml(s).replace(/"/g, "&quot;");
}
// Classe de tema de cor dos cards (whitelist — o valor vem de um select, mas garante).
const CARD_COLORS = ["verde", "azul", "vermelho", "dourado", "roxo", "escuro"];
function themeClass(cor: string): string {
  return "pdb-theme-" + (CARD_COLORS.includes(cor) ? cor : "verde");
}

// Corpo do post em HTML: prefere o editor visual (Lexical, campo `content`); cai pro
// HTML legado (`body`) enquanto o post não foi migrado. Garante que nada some na
// transição e que o HTML renderizado (logo, o SEO) continue equivalente.
// Normaliza um link do Instagram pro permalink canônico que o embed.js entende
// (post/reel/tv). Descarta query string e afins. Retorna "" se não for do Instagram.
function normalizeInstagramUrl(url: string): string {
  const m = String(url || "").match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (!m) return "";
  return `https://www.instagram.com/${m[1].toLowerCase()}/${m[2]}/`;
}

// URL do YouTube/Vimeo -> URL de embed (iframe).
function videoEmbedSrc(url: string): string {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return "";
}

// Conversores dos blocos do editor (vídeo, colunas, destaque) -> HTML. Os slugs batem
// com o BlocksFeature em payload.config.ts. A tabela usa os conversores padrão.
const lexicalConverters: any = ({ defaultConverters }: any) => ({
  ...defaultConverters,
  blocks: {
    video: ({ node }: any) => {
      const src = videoEmbedSrc(node?.fields?.url || "");
      if (!src) return "";
      const cap = node?.fields?.caption;
      const figcap = cap ? `<figcaption>${cap}</figcaption>` : "";
      return `<figure class="pdb-video"><div class="pdb-video-frame"><iframe src="${src}" title="${cap || "Vídeo"}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${figcap}</figure>`;
    },
    // Card do Instagram: blockquote oficial (instagram-media). `data-instgrm-captioned`
    // faz o embed.js renderizar a versão COM a legenda do post (o comentário do jogador) —
    // sem ele, o IG mostra só a foto + link. O embed.js (carregado pelo InstagramEmbedLoader
    // no article-view) troca o blockquote pelo card. Se não carregar, fica o link + a
    // legenda de reserva (fallback opcional do editor).
    instagram: ({ node }: any) => {
      const url = normalizeInstagramUrl(node?.fields?.url || "");
      if (!url) return "";
      const cap = node?.fields?.caption
        ? `<p style="margin:14px 0 0">${escHtml(String(node.fields.caption))}</p>`
        : "";
      return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${escAttr(url)}" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);margin:1px auto 32px;max-width:540px;min-width:326px;padding:0;width:99.375%"><a href="${escAttr(url)}" target="_blank" rel="noopener nofollow">Ver esta publicação no Instagram</a>${cap}</blockquote>`;
    },
    // Escalação no campo: desenha um campinho e posiciona os titulares pela formação
    // (ex.: 4-3-3). Os jogadores vêm na ordem goleiro→ataque; a formação define as linhas.
    lineup: ({ node }: any) => {
      const f = node?.fields || {};
      const players = (f.players || []).filter((p: any) => p?.name);
      if (!players.length) return "";
      const team = escHtml(String(f.team || ""));
      const formation = String(f.formation || "").trim();
      const label = String(f.label || "").trim();
      // Formação -> linhas de linha de fundo pra frente. Prefixa o goleiro (1).
      const outfield = formation.split(/[^0-9]+/).filter(Boolean).map(Number).filter((n) => n > 0);
      const lines = outfield.length ? [1, ...outfield] : [players.length];
      const rows: any[][] = [];
      let idx = 0;
      for (const cnt of lines) {
        rows.push(players.slice(idx, idx + cnt));
        idx += cnt;
      }
      if (idx < players.length) rows[rows.length - 1].push(...players.slice(idx)); // sobra vai pro ataque
      const playerHtml = (p: any) => {
        const num = escHtml(String(p.number || ""));
        const pid = String(p.playerId || "").trim();
        const marker = pid
          ? `<span class="pdb-player-photo"><img src="/api/player-img/${encodeURIComponent(pid)}" alt="${escAttr(p.name)}" loading="lazy" />${num ? `<span class="pdb-player-badge">${num}</span>` : ""}</span>`
          : `<span class="pdb-player-num">${num}</span>`;
        return `<span class="pdb-player">${marker}<span class="pdb-player-name">${escHtml(p.name)}</span></span>`;
      };
      const rowsHtml = rows
        .map((r) => `<div class="pdb-pitch-line">${r.map(playerHtml).join("")}</div>`)
        .join("");
      const meta = [label, formation].filter(Boolean).map(escHtml).join(" · ");
      const head = `<figcaption class="pdb-lineup-head"><span class="pdb-lineup-team">${team}</span>${meta ? `<span class="pdb-lineup-meta">${meta}</span>` : ""}</figcaption>`;
      return `<figure class="pdb-lineup">${head}<div class="pdb-pitch">${rowsHtml}</div></figure>`;
    },
    columns: ({ node }: any) => {
      const cols = [node?.fields?.col1, node?.fields?.col2, node?.fields?.col3].filter(
        (x: any) => x?.root?.children?.length
      );
      if (!cols.length) return "";
      const inner = cols
        .map((x: any) => `<div class="pdb-col">${convertLexicalToHTML({ data: x })}</div>`)
        .join("");
      return `<div class="pdb-columns pdb-cols-${cols.length}">${inner}</div>`;
    },
    callout: ({ node }: any) => {
      const style = node?.fields?.style || "info";
      const x = node?.fields?.content;
      const inner = x?.root?.children?.length ? convertLexicalToHTML({ data: x }) : "";
      return `<div class="pdb-callout pdb-callout-${style}">${inner}</div>`;
    },
    sponsorCard: ({ node }: any) => {
      const s = node?.fields?.sponsor;
      if (!s || typeof s !== "object") return "";
      return sponsorCardHtml(normalizeSponsor(s), "artigo");
    },
    // Card de palpite/previsão: rótulo + palpite + badge de odd/casa + análise + botão.
    prediction: ({ node }: any) => {
      const f = node?.fields || {};
      if (!f.text) return "";
      const oddHouse = [f.odd ? `Odd ${escHtml(f.odd)}` : "", f.house ? escHtml(f.house) : ""]
        .filter(Boolean)
        .join(" · ");
      const badge = oddHouse ? `<span class="pdb-pred-odd">${oddHouse}</span>` : "";
      const note = f.note ? `<p class="pdb-pred-note">${escHtml(f.note)}</p>` : "";
      const btn = f.url
        ? `<a class="pdb-cta pdb-cta-primary" href="${escAttr(f.url)}" target="_blank" rel="sponsored nofollow noopener">Apostar${f.house ? " na " + escHtml(f.house) : ""}</a>`
        : "";
      return `<div class="pdb-prediction ${themeClass(f.cor)}"><div class="pdb-pred-head"><span class="pdb-pred-label">${escHtml(f.label || "Palpite")}</span>${badge}</div><div class="pdb-pred-text">${escHtml(f.text)}</div>${note}${btn}</div>`;
    },
    // Card de destaque com dados: título + subtítulo + foto opcional + linhas rótulo/valor.
    statCard: ({ node }: any) => {
      const f = node?.fields || {};
      if (!f.title) return "";
      const img = f.imageUrl
        ? `<img class="pdb-statcard-img" src="${escAttr(f.imageUrl)}" alt="${escAttr(f.subtitle || f.title)}" loading="lazy" />`
        : "";
      const sub = f.subtitle ? `<div class="pdb-statcard-sub">${escHtml(f.subtitle)}</div>` : "";
      const rows = (f.rows || [])
        .filter((r: any) => r?.label || r?.value)
        .map((r: any) => `<li><span>${escHtml(r.label || "")}</span><strong>${escHtml(r.value || "")}</strong></li>`)
        .join("");
      const list = rows ? `<ul class="pdb-statcard-list">${rows}</ul>` : "";
      return `<div class="pdb-statcard ${themeClass(f.cor)}">${img}<div class="pdb-statcard-body"><div class="pdb-statcard-title">${escHtml(f.title)}</div>${sub}${list}</div></div>`;
    },
    // Botão call-to-action (afiliado): rel=sponsored nofollow.
    ctaButton: ({ node }: any) => {
      const f = node?.fields || {};
      if (!f.label || !f.url) return "";
      const cls = f.style === "outline" ? "pdb-cta-outline" : "pdb-cta-primary";
      return `<a class="pdb-cta ${cls} ${themeClass(f.cor)}" href="${escAttr(f.url)}" target="_blank" rel="sponsored nofollow noopener">${escHtml(f.label)}</a>`;
    },
    // Prós e contras em duas colunas (✅ / ❌).
    prosCons: ({ node }: any) => {
      const f = node?.fields || {};
      const pros = (f.pros || []).filter((p: any) => p?.item).map((p: any) => `<li>${escHtml(p.item)}</li>`).join("");
      const cons = (f.cons || []).filter((c: any) => c?.item).map((c: any) => `<li>${escHtml(c.item)}</li>`).join("");
      if (!pros && !cons) return "";
      return `<div class="pdb-proscons ${themeClass(f.cor)}"><div class="pdb-pros"><div class="pdb-pc-title">${escHtml(f.prosTitle || "Vantagens")}</div><ul>${pros}</ul></div><div class="pdb-cons"><div class="pdb-pc-title">${escHtml(f.consTitle || "Desvantagens")}</div><ul>${cons}</ul></div></div>`;
    },
  },
  // Imagem inserida no editor (upload node) com alinhamento (campo do UploadFeature).
  upload: ({ node }: any) => {
    const doc = node?.value;
    if (!doc || typeof doc !== "object" || !doc.url) return "";
    const align = node?.fields?.alignment || "center";
    const src = String(doc.url).startsWith("http") ? doc.url : `${SITE_URL}${doc.url}`;
    const alt = String(doc.alt || "").replace(/"/g, "&quot;");
    const dims = doc.width && doc.height ? ` width="${doc.width}" height="${doc.height}"` : "";
    // Legenda/crédito do bloco (campo do UploadFeature) → figcaption (semântico, bom p/ SEO).
    const escHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const capText = String(node?.fields?.caption || "").trim();
    const figcap = capText ? `<figcaption>${escHtml(capText)}</figcaption>` : "";
    return `<figure class="pdb-img pdb-img-${align}"><img src="${src}" alt="${alt}"${dims} loading="lazy" />${figcap}</figure>`;
  },
});

function postBodyHtml(p: any): string {
  const c = p.content;
  if (c && typeof c === "object" && c.root && Array.isArray(c.root.children) && c.root.children.length) {
    try {
      return convertLexicalToHTML({ data: c, converters: lexicalConverters });
    } catch {
      return p.body || "";
    }
  }
  return p.body || "";
}

function mapPost(p: any): Article {
  const tags = (p.tags || []).map((x: any) => cleanTag(x.tag)).filter(Boolean);
  const bodyHtml = postBodyHtml(p);
  // Autor: prefere o PERFIL relacionado (authorProfile, populado com depth>=1) — dá nome
  // + slug pro byline linkável e pra autoria no SEO. Cai pro texto livre (legado).
  const ap = p.authorProfile && typeof p.authorProfile === "object" ? p.authorProfile : null;
  const cover = typeof p.cover === "object" && p.cover ? p.cover : null;
  // Prefere a versão "card" (WebP 800px); cai pro original. URL absoluta (display + OG).
  const coverUrl = cover?.sizes?.card?.url || cover?.url || "";
  const image = coverUrl ? `${SITE_URL}${coverUrl}` : "";
  const category = p.category || "Futebol brasileiro";
  const pubDate = p.publishedDate || p.createdAt || new Date().toISOString();
  return {
    imageCaption: cover?.alt || "",
    originalTitle: p.title || "",
    rewrittenTitle: p.title || "",
    rewrittenText: stripHtml(bodyHtml).slice(0, 5000),
    excerpt: p.excerpt || "",
    contentHtml: bodyHtml,
    slug: p.slug,
    source: "WordPress",
    image,
    category,
    tags,
    team: tags[0] || null,
    author: ap?.name || p.author || "Redação",
    authorSlug: ap?.slug || undefined,
    pubDate,
    createdAt: pubDate,
    url: (p.pdbLink || "").trim() || articleHref(category, p.slug),
    wpId: p.wpId,
  };
}

const getClient = cache(async () => getPayload({ config }));

export async function getArticlesPayload(options?: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
  tag?: string;
}): Promise<{ articles: Article[]; total: number } | null> {
  // No build o Postgres não é alcançável (builder fora da pdb-net) → não tenta,
  // retorna null → getArticles cai pro WP. ISR popula do Payload em runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  try {
    const payload = await getClient();
    const { page = 1, perPage = 20, category, search, tag } = options || {};
    const and: any[] = [];
    // Só posts PUBLICADOS no site — rascunhos (Studio→CMS) ficam só no /cms.
    and.push({ _status: { equals: "published" } });
    if (category) and.push({ category: { equals: category } });
    // Categorias "siladas": têm página/seção PRÓPRIA e NÃO entram nas listagens gerais
    // (home "Últimas Notícias", /noticias, "Leia também", sitemap geral). Só aparecem quando
    // a categoria é pedida explicitamente. Craques = página própria; Casas de Apostas = seção
    // dedicada (card "Casas de Apostas" na home + hub /casas-de-apostas), fora do feed editorial.
    for (const siloed of ["Craques", "Casas de Apostas"]) {
      if (category !== siloed) and.push({ category: { not_equals: siloed } });
    }
    if (search) and.push({ title: { like: search } });
    if (tag) and.push({ "tags.tag": { like: tag } });

    const res = await payload.find({
      collection: "posts",
      where: and.length ? { and } : {},
      sort: "-publishedDate",
      page,
      limit: perPage,
      depth: 1,
    });
    return { articles: res.docs.map(mapPost), total: res.totalDocs };
  } catch {
    return null;
  }
}

export async function getArticleBySlugPayload(
  slug: string,
  draft = false
): Promise<Article | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  try {
    const payload = await getClient();
    // draft=true (preview do /cms): pega a última versão (rascunho), sem filtrar status.
    const res = await payload.find({
      collection: "posts",
      where: draft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      draft,
      overrideAccess: true,
      limit: 1,
      depth: 1,
    });
    return res.docs[0] ? mapPost(res.docs[0]) : null;
  } catch {
    return null;
  }
}

// Posts PUBLICADOS de um autor (pelo id do perfil em `authors`). Usado na página do
// autor (/autor/[slug]) pra listar os artigos dele. Vazio em erro/no build.
export async function getArticlesByAuthorId(
  authorId: number,
  perPage = 12
): Promise<Article[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "posts",
      where: {
        and: [{ _status: { equals: "published" } }, { authorProfile: { equals: authorId } }],
      },
      sort: "-publishedDate",
      limit: perPage,
      depth: 1,
    });
    return res.docs.map(mapPost);
  } catch {
    return [];
  }
}
