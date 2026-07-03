import { getPayload } from "payload";
import config from "@payload-config";

// Patrocinadores (collection `sponsors` no /cms). Um cadastro é reusado em:
//  - card inline no editor (bloco "Patrocinador (card)" do Lexical → sponsorCardHtml),
//  - faixa no rodapé da página do jogo do municipal e da página principal (SponsorStrip).
// Todo link do card aponta pra /parceiro/{slug} (conta clique + UTM) e sai rel="sponsored".
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Sponsor {
  id: number | string;
  name: string;
  slug: string;
  tagline: string;
  logo: string; // URL (vazio se não tem)
  site: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
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

// Link "de verdade" do patrocinador (o /parceiro redireciona pra cá). Prioridade: site.
export function sponsorTarget(s: Sponsor): string {
  return (
    normalizeUrl("site", s.site) ||
    normalizeUrl("whatsapp", s.whatsapp) ||
    normalizeUrl("instagram", s.instagram) ||
    normalizeUrl("facebook", s.facebook)
  );
}

export function normalizeSponsor(doc: any): Sponsor {
  const logo = doc?.logo;
  const logoUrl = logo && typeof logo === "object" ? String(logo.url || "") : "";
  return {
    id: doc?.id,
    name: doc?.name || "",
    slug: doc?.slug || "",
    tagline: doc?.tagline || "",
    logo: logoUrl,
    site: doc?.site || "",
    whatsapp: doc?.whatsapp || "",
    instagram: doc?.instagram || "",
    facebook: doc?.facebook || "",
    active: doc?.active !== false,
    clicks: Number(doc?.clicks || 0),
  };
}

// HTML de UM card (usado pelo conversor Lexical e pela faixa). `de` vira UTM no /parceiro.
export function sponsorCardHtml(s: Sponsor, de = "site"): string {
  if (!s || !s.slug) return "";
  const href = `/parceiro/${encodeURIComponent(s.slug)}?de=${encodeURIComponent(de)}`;
  const initials = s.name.replace(/[^A-Za-zÀ-ÿ ]/g, "").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const logo = s.logo
    ? `<img src="${esc(s.logo)}" alt="${esc(s.name)}" loading="lazy" />`
    : `<span class="pdb-sponsor-ini">${esc(initials)}</span>`;
  const tag = s.tagline ? `<span class="pdb-sponsor-tag">${esc(s.tagline)}</span>` : "";
  return (
    `<a class="pdb-sponsor" href="${href}" rel="sponsored noopener" target="_blank">` +
    `<span class="pdb-sponsor-logo">${logo}</span>` +
    `<span class="pdb-sponsor-body"><span class="pdb-sponsor-name">${esc(s.name)}</span>${tag}</span>` +
    `<span class="pdb-sponsor-cta">Visitar</span>` +
    `</a>`
  );
}

// HTML da faixa inteira (rótulo "Patrocínio" + grid de cards).
export function sponsorStripHtml(list: Sponsor[], de = "site", label = "Patrocínio"): string {
  const cards = list.filter((s) => s && s.slug).map((s) => sponsorCardHtml(s, de)).join("");
  if (!cards) return "";
  return (
    `<aside class="pdb-sponsors" aria-label="Patrocinadores">` +
    `<span class="pdb-sponsors-label">${esc(label)}</span>` +
    `<div class="pdb-sponsors-grid">${cards}</div>` +
    `</aside>`
  );
}

export async function getActiveSponsors(): Promise<Sponsor[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "sponsors",
      where: { active: { equals: true } },
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
