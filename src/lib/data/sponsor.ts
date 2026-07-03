import { getPayload } from "payload";
import config from "@payload-config";

// Patrocinadores (collection `sponsors` no /cms). Um cadastro é reusado em:
//  - card inline no editor (bloco "Patrocinador (card)" do Lexical → sponsorCardHtml),
//  - faixa no rodapé da página do jogo do municipal e da página principal (SponsorStrip).
// Todo link do card aponta pra /parceiro/{slug} (conta clique + UTM) e sai rel="sponsored".
/* eslint-disable @typescript-eslint/no-explicit-any */

export type SponsorFormat = "card" | "banner";

export interface Sponsor {
  id: number | string;
  name: string;
  slug: string;
  tagline: string;
  format: SponsorFormat;
  logo: string; // URL da logo do card (vazio se não tem)
  banner: string; // URL da imagem larga do banner (vazio se não tem)
  bannerCentered: boolean; // true = imagem centralizada/transparente; false = esticada
  site: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  linkTo: "auto" | "site" | "whatsapp" | "instagram" | "facebook" | "custom";
  linkCustom: string;
  active: boolean;
  clicks: number;
}

const esc = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// aceita @user, wa.me/..., número solto, ou URL completa → devolve URL clicável.
export function normalizeUrl(kind: "site" | "whatsapp" | "instagram" | "facebook", raw: string): string {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (kind === "whatsapp") {
    const digits = v.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits.length <= 11 ? "55" + digits : digits}` : "";
  }
  if (kind === "instagram") return `https://instagram.com/${v.replace(/^@/, "")}`;
  if (kind === "facebook") return `https://facebook.com/${v.replace(/^@/, "")}`;
  return `https://${v}`; // site
}

// Link "de verdade" do patrocinador (o /parceiro redireciona pra cá). Respeita o destino
// escolhido em linkTo; "auto" usa a ordem site → whatsapp → instagram → facebook. Se o
// destino escolhido estiver vazio, cai no automático.
export function sponsorTarget(s: Sponsor): string {
  const auto = () =>
    normalizeUrl("site", s.site) ||
    normalizeUrl("whatsapp", s.whatsapp) ||
    normalizeUrl("instagram", s.instagram) ||
    normalizeUrl("facebook", s.facebook);
  switch (s.linkTo) {
    case "site":
      return normalizeUrl("site", s.site) || auto();
    case "whatsapp":
      return normalizeUrl("whatsapp", s.whatsapp) || auto();
    case "instagram":
      return normalizeUrl("instagram", s.instagram) || auto();
    case "facebook":
      return normalizeUrl("facebook", s.facebook) || auto();
    case "custom":
      return (s.linkCustom && (/^https?:\/\//i.test(s.linkCustom) ? s.linkCustom : `https://${s.linkCustom}`)) || auto();
    default:
      return auto();
  }
}

const mediaUrl = (m: any): string => (m && typeof m === "object" ? String(m.url || "") : "");

export function normalizeSponsor(doc: any): Sponsor {
  return {
    id: doc?.id,
    name: doc?.name || "",
    slug: doc?.slug || "",
    tagline: doc?.tagline || "",
    format: doc?.format === "banner" ? "banner" : "card",
    logo: mediaUrl(doc?.logo),
    banner: mediaUrl(doc?.banner),
    bannerCentered: doc?.bannerCentered === true,
    site: doc?.site || "",
    whatsapp: doc?.whatsapp || "",
    instagram: doc?.instagram || "",
    facebook: doc?.facebook || "",
    linkTo: doc?.linkTo || "auto",
    linkCustom: doc?.linkCustom || "",
    active: doc?.active !== false,
    clicks: Number(doc?.clicks || 0),
  };
}

// HTML de UM card = tile de logo (logo grande cobrindo o card, sem botão). Clicável.
// Usado pelo conversor Lexical e pela faixa. `de` vira UTM no /parceiro.
export function sponsorCardHtml(s: Sponsor, de = "site"): string {
  if (!s || !s.slug) return "";
  const href = `/parceiro/${encodeURIComponent(s.slug)}?de=${encodeURIComponent(de)}`;
  const initials = s.name.replace(/[^A-Za-zÀ-ÿ ]/g, "").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const logo = s.logo
    ? `<img src="${esc(s.logo)}" alt="${esc(s.name)}" loading="lazy" />`
    : `<span class="pdb-sponsor-ini">${esc(initials)}</span>`;
  // Sem nome no card: a logo preenche o card; o nome fica no title/alt (tooltip).
  return (
    `<a class="pdb-sponsor" href="${href}" rel="sponsored noopener" target="_blank" title="${esc(s.name)}">` +
    `<span class="pdb-sponsor-logo">${logo}</span>` +
    `</a>`
  );
}

// HTML de um BANNER grande (imagem larga clicável). Fallback textual se não tiver imagem.
export function sponsorBannerHtml(s: Sponsor, position = "above-score"): string {
  if (!s || !s.slug) return "";
  const href = `/parceiro/${encodeURIComponent(s.slug)}?de=banner-${encodeURIComponent(position)}`;
  const inner = s.banner
    ? `<img src="${esc(s.banner)}" alt="${esc(s.name)}" loading="lazy" />`
    : `<span class="pdb-banner-fallback"><strong>${esc(s.name)}</strong>${s.tagline ? `<span>${esc(s.tagline)}</span>` : ""}</span>`;
  // Centralizado (transparente, tamanho natural) só quando tem imagem; o fallback textual
  // sempre estica.
  const cls = s.banner && s.bannerCentered ? "pdb-banner pdb-banner-contain" : "pdb-banner";
  return (
    `<div class="pdb-banner-wrap">` +
    `<span class="pdb-ad-label">Patrocínio</span>` +
    `<a class="${cls}" href="${href}" rel="sponsored noopener" target="_blank" title="${esc(s.name)}">${inner}</a>` +
    `</div>`
  );
}

// HTML da faixa do rodapé. Com 3+ logos vira CARROSSEL (passa devagar, pausa no hover);
// com 1-2, fica estático e centralizado.
export function sponsorStripHtml(list: Sponsor[], de = "site", label = "Patrocínio"): string {
  const items = list.filter((s) => s && s.slug);
  if (!items.length) return "";
  const cards = items.map((s) => sponsorCardHtml(s, de)).join("");
  const inner =
    items.length >= 3
      ? `<div class="pdb-marquee"><div class="pdb-marquee-track" style="animation-duration:${items.length * 6}s">${cards}${cards}</div></div>`
      : `<div class="pdb-strip-static">${cards}</div>`;
  return (
    `<aside class="pdb-sponsors" aria-label="Patrocinadores">` +
    `<span class="pdb-sponsors-label">${esc(label)}</span>` +
    inner +
    `</aside>`
  );
}

// Patrocinadores ATIVOS. Por padrão só os de tipo "card" (a faixa do rodapé); passe
// format:"banner" pra buscar os banners.
export async function getActiveSponsors(opts?: { format?: SponsorFormat }): Promise<Sponsor[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const format = opts?.format || "card";
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "sponsors",
      where: { active: { equals: true }, format: { equals: format } },
      sort: "name",
      limit: 50,
      depth: 1,
      pagination: false,
    });
    return res.docs.map(normalizeSponsor);
  } catch {
    return [];
  }
}

export async function getSponsorBySlug(slug: string): Promise<Sponsor | null> {
  if (!slug) return null;
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "sponsors",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const d = res.docs[0];
    return d ? normalizeSponsor(d) : null;
  } catch {
    return null;
  }
}
