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

// URL de um upload populado (depth>=1). `size` usa a versão redimensionada quando existe.
function mediaUrl(doc: any, size?: string): string {
  if (!doc || typeof doc !== "object") return "";
  const u = (size && doc.sizes?.[size]?.url) || doc.url || "";
  if (!u) return "";
  return String(u).startsWith("http") ? u : `${SITE_URL}${u}`;
}

// Âncora estável a partir do texto do título (usada pelo índice "Nesta página").
export function anchorSlug(s: string): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Link externo sai como afiliado (sponsored nofollow, nova aba); interno sai normal.
function linkAttrs(href: string): string {
  return /^https?:\/\//i.test(href)
    ? ` target="_blank" rel="sponsored nofollow noopener"`
    : "";
}

// Converte o richText de um campo DENTRO de um bloco (análise, resposta do FAQ, bio do
// autor) — usa os conversores padrão (evita recursão infinita nos blocos customizados).
function innerHtml(x: any): string {
  if (!x || typeof x !== "object" || !x.root?.children?.length) return "";
  try {
    return convertLexicalToHTML({ data: x });
  } catch {
    return "";
  }
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

// Link de post do X/Twitter (x.com ou twitter.com) -> URL canônica do status. O
// widgets.js do X renderiza o card a partir dessa URL. Aceita query params (?s=).
function normalizeTweetUrl(url: string): string {
  const m = String(url || "").match(/(?:twitter|x)\.com\/([A-Za-z0-9_]+)\/status\/(\d+)/i);
  if (!m) return "";
  return `https://twitter.com/${m[1]}/status/${m[2]}`;
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
    // Card do X (Twitter): blockquote oficial (twitter-tweet). O widgets.js (carregado
    // pelo TweetEmbedLoader no article-view) troca o blockquote pelo card do post a partir
    // da URL do status. Se não carregar, fica o link + o texto de reserva (opcional).
    tweet: ({ node }: any) => {
      const url = normalizeTweetUrl(node?.fields?.url || "");
      if (!url) return "";
      // A legenda (se houver) vira o TEXTO do link — o widgets.js substitui o
      // blockquote inteiro pelo card; se não carregar, fica esse link. Nada de <p>
      // solto (o widget do X não remove conteúdo extra, aí vazaria abaixo do card).
      const label = node?.fields?.caption
        ? escHtml(String(node.fields.caption))
        : "Ver post no X";
      return `<blockquote class="twitter-tweet" data-dnt="true" data-lang="pt"><a href="${escAttr(url)}" target="_blank" rel="noopener nofollow">${label}</a></blockquote>`;
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
    // ── Vertical de apostas ──
    // Tabela comparativa: # / Casa (logo + nome) / Nota / Licença / Pagamento / Diferencial.
    // Linha sem nota mostra "Em avaliação" — nunca inventa nota (regra editorial do brief).
    bettingTable: ({ node }: any) => {
      const f = node?.fields || {};
      const rows = (f.rows || []).filter((r: any) => r?.name);
      if (!rows.length) return "";
      const empty = escHtml(f.emptyScoreLabel || "Em avaliação");
      const cap = f.title ? `<caption>${escHtml(f.title)}</caption>` : "";
      const body = rows
        .map((r: any, i: number) => {
          const logo = mediaUrl(r.logo);
          const img = logo
            ? `<img class="pdb-bt-logo" src="${escAttr(logo)}" alt="${escAttr(r.name)}" width="18" height="18" loading="lazy" />`
            : "";
          const href = String(r.href || "").trim();
          const name = href
            ? `<a href="${escAttr(href)}"${linkAttrs(href)}>${escHtml(r.name)}</a>`
            : escHtml(r.name);
          const score = String(r.score || "").trim();
          const scoreCell = score
            ? `<span class="pdb-bt-score">${escHtml(score)}</span>`
            : `<span class="pdb-bt-pending">${empty}</span>`;
          return `<tr><td class="pdb-bt-rank">${i + 1}</td><td class="pdb-bt-name">${img}${name}</td><td>${scoreCell}</td><td>${escHtml(r.license || "")}</td><td>${escHtml(r.payment || "")}</td><td>${escHtml(r.highlight || "")}</td></tr>`;
        })
        .join("");
      return `<div class="pdb-bt-wrap"><table class="pdb-bt">${cap}<thead><tr><th>#</th><th>Casa</th><th>Nota</th><th>Licença</th><th>Pagamento</th><th>Diferencial</th></tr></thead><tbody>${body}</tbody></table></div>`;
    },
    // Card de casa: com nota = review completo; sem nota = card "em avaliação".
    bettingReview: ({ node }: any) => {
      const f = node?.fields || {};
      if (!f.name) return "";
      const score = String(f.score || "").trim();
      const rank = String(f.rank || "").trim();
      const logo = mediaUrl(f.logo);
      const head = [
        rank ? `<span class="pdb-br-rank">${escHtml(rank)}</span>` : "",
        logo ? `<img class="pdb-br-logo" src="${escAttr(logo)}" alt="${escAttr(f.name)}" width="32" height="32" loading="lazy" />` : "",
        `<span class="pdb-br-name">${escHtml(f.name)}</span>`,
        score
          ? `<span class="pdb-br-score">${escHtml(score)}</span>`
          : `<span class="pdb-br-pending">Em avaliação</span>`,
      ]
        .filter(Boolean)
        .join("");
      const meta = [
        f.license ? `<li><span>Licença</span><strong>${escHtml(f.license)}</strong></li>` : "",
        f.ra
          ? `<li><span>Reclame Aqui</span><strong>${
              f.raUrl
                ? `<a href="${escAttr(f.raUrl)}" target="_blank" rel="nofollow noopener">${escHtml(f.ra)}</a>`
                : escHtml(f.ra)
            }</strong></li>`
          : "",
      ]
        .filter(Boolean)
        .join("");
      const metaList = meta ? `<ul class="pdb-br-meta">${meta}</ul>` : "";
      const shots = [
        ...(mediaUrl(f.raProof) ? [{ url: mediaUrl(f.raProof), caption: "Reclame Aqui" }] : []),
        ...(f.images || [])
          .map((im: any) => ({ url: mediaUrl(im?.image), caption: im?.caption || "" }))
          .filter((im: any) => im.url),
      ];
      const gallery = shots.length
        ? `<div class="pdb-br-shots">${shots
            .map(
              (im: any) =>
                `<figure><img src="${escAttr(im.url)}" alt="${escAttr(
                  `${f.name} — ${im.caption || "captura de tela"}`
                )}" loading="lazy" />${im.caption ? `<figcaption>${escHtml(im.caption)}</figcaption>` : ""}</figure>`
            )
            .join("")}</div>`
        : "";
      const summary = innerHtml(f.summary);
      const pros = (f.pros || []).filter((p: any) => p?.item).map((p: any) => `<li>${escHtml(p.item)}</li>`).join("");
      const cons = (f.cons || []).filter((c: any) => c?.item).map((c: any) => `<li>${escHtml(c.item)}</li>`).join("");
      const pc =
        pros || cons
          ? `<div class="pdb-proscons ${themeClass(f.cor)}"><div class="pdb-pros"><div class="pdb-pc-title">${escHtml(
              f.prosTitle || "Prós"
            )}</div><ul>${pros}</ul></div><div class="pdb-cons"><div class="pdb-pc-title">${escHtml(
              f.consTitle || "Contras"
            )}</div><ul>${cons}</ul></div></div>`
          : "";
      // CTA de afiliado só sai com link real — placeholder nunca vai pro ar (regra do brief).
      const ctaUrl = String(f.ctaUrl || "").trim();
      const cta = ctaUrl
        ? `<a class="pdb-cta pdb-cta-primary ${themeClass(f.cor)}" href="${escAttr(ctaUrl)}" target="_blank" rel="sponsored nofollow noopener">${escHtml(
            f.ctaLabel || "Abrir conta"
          )}</a>`
        : "";
      const linkHref = String(f.linkHref || "").trim();
      const link = linkHref
        ? `<a class="pdb-cta pdb-cta-outline ${themeClass(f.cor)}" href="${escAttr(linkHref)}"${linkAttrs(linkHref)}>${escHtml(
            f.linkLabel || "Ver análise completa"
          )}</a>`
        : "";
      const ctas = cta || link ? `<div class="pdb-br-ctas">${link}${cta}</div>` : "";
      return `<div class="pdb-br ${themeClass(f.cor)}" id="casa-${escAttr(anchorSlug(f.name))}"><div class="pdb-br-head">${head}</div>${metaList}${summary}${gallery}${pc}${ctas}</div>`;
    },
    // FAQ em accordion (<details>). Vira schema FAQPage em article-view (ver extractFaq).
    faq: ({ node }: any) => {
      const f = node?.fields || {};
      const items = (f.items || []).filter((i: any) => i?.question);
      if (!items.length) return "";
      const title = f.title ? `<h2 id="${escAttr(anchorSlug(f.title))}">${escHtml(f.title)}</h2>` : "";
      const list = items
        .map(
          (it: any, i: number) =>
            `<details class="pdb-faq-item"${i === 0 && f.firstOpen ? " open" : ""}><summary>${escHtml(
              it.question
            )}</summary><div class="pdb-faq-answer">${innerHtml(it.answer)}</div></details>`
        )
        .join("");
      return `${title}<div class="pdb-faq">${list}</div>`;
    },
    // Índice "Nesta página". Com auto=true sai um marcador que o postBodyHtml preenche
    // com os H2 do texto (assim o editor não precisa manter âncoras na mão).
    toc: ({ node }: any) => {
      const f = node?.fields || {};
      const title = escHtml(f.title || "Nesta página");
      if (f.auto !== false) {
        return `<nav class="pdb-toc" data-pdb-toc="auto" data-toc-title="${escAttr(title)}" aria-label="${escAttr(title)}"></nav>`;
      }
      const items = (f.items || []).filter((i: any) => i?.label);
      if (!items.length) return "";
      const lis = items
        .map((i: any) => {
          const href = String(i.anchor || "").trim() || `#${anchorSlug(i.label)}`;
          return `<li><a href="${escAttr(href)}">${escHtml(i.label)}</a></li>`;
        })
        .join("");
      return `<nav class="pdb-toc" aria-label="${escAttr(title)}"><div class="pdb-toc-title">${title}</div><ul>${lis}</ul></nav>`;
    },
    // "Sobre o Autor" (E-E-A-T): foto + bio da collection Autores. Precisa de depth>=2
    // pra foto vir populada (ver getArticleBySlugPayload).
    authorBox: ({ node }: any) => {
      const a = node?.fields?.author;
      if (!a || typeof a !== "object" || !a.name) return "";
      const f = node?.fields || {};
      const photo = mediaUrl(a.photo, "card");
      const img = photo
        ? `<img class="pdb-author-photo" src="${escAttr(photo)}" alt="${escAttr(a.name)}" width="72" height="72" loading="lazy" />`
        : "";
      const href = a.slug ? `/autor/${encodeURIComponent(a.slug)}` : "";
      const name = href ? `<a href="${escAttr(href)}">${escHtml(a.name)}</a>` : escHtml(a.name);
      const intro = f.intro ? `<div class="pdb-author-intro">${escHtml(f.intro)}</div>` : "";
      const role = a.role ? `<div class="pdb-author-role">${escHtml(a.role)}</div>` : "";
      const bio = innerHtml(a.bio);
      return `<aside class="pdb-author">${intro}<div class="pdb-author-head">${img}<div><div class="pdb-author-label">${escHtml(
        f.title || "Sobre o Autor"
      )}</div><div class="pdb-author-name">${name}</div>${role}</div></div><div class="pdb-author-bio">${bio}</div></aside>`;
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

// Dá `id` aos títulos (H2/H3) que ainda não têm — é o que faz o índice "Nesta página"
// e os links âncora funcionarem sem o editor precisar cuidar disso na mão.
function withHeadingAnchors(html: string): string {
  const used = new Set<string>();
  return html.replace(/<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (full, tag, attrs = "", inner) => {
    if (/\sid=/i.test(attrs || "")) {
      const m = String(attrs).match(/\sid="([^"]*)"/i);
      if (m) used.add(m[1]);
      return full;
    }
    const base = anchorSlug(stripHtml(inner));
    if (!base) return full;
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return `<${tag}${attrs || ""} id="${id}">${inner}</${tag}>`;
  });
}

// Preenche o marcador do bloco "Nesta página" (auto) com os H2 do texto já ancorados.
function fillAutoToc(html: string): string {
  if (!html.includes('data-pdb-toc="auto"')) return html;
  const items: { id: string; label: string }[] = [];
  const re = /<h2[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const label = stripHtml(m[2]);
    if (label) items.push({ id: m[1], label });
  }
  return html.replace(
    /<nav class="pdb-toc" data-pdb-toc="auto" data-toc-title="([^"]*)"([^>]*)><\/nav>/gi,
    (full, title, rest) => {
      if (!items.length) return "";
      const lis = items.map((i) => `<li><a href="#${escAttr(i.id)}">${escHtml(i.label)}</a></li>`).join("");
      return `<nav class="pdb-toc"${rest}><div class="pdb-toc-title">${title}</div><ul>${lis}</ul></nav>`;
    }
  );
}

function postBodyHtml(p: any): string {
  const c = p.content;
  if (c && typeof c === "object" && c.root && Array.isArray(c.root.children) && c.root.children.length) {
    try {
      return fillAutoToc(withHeadingAnchors(convertLexicalToHTML({ data: c, converters: lexicalConverters })));
    } catch {
      return p.body || "";
    }
  }
  return p.body || "";
}

// ── Dados estruturados extraídos do corpo (blocos do editor) ──
// Percorre a árvore Lexical atrás dos blocos `faq` (→ schema FAQPage) e
// `bettingTable`/`bettingReview` (→ schema ItemList do ranking).
function walkBlocks(node: any, out: any[]): void {
  if (!node || typeof node !== "object") return;
  if (node.type === "block" && node.fields?.blockType) out.push(node.fields);
  for (const child of node.children || []) walkBlocks(child, out);
}

export function extractStructured(content: any): {
  faq: { question: string; answer: string }[];
  ranking: { name: string; href?: string }[];
} {
  const faq: { question: string; answer: string }[] = [];
  const ranking: { name: string; href?: string }[] = [];
  if (!content || typeof content !== "object" || !content.root) return { faq, ranking };
  const blocks: any[] = [];
  walkBlocks(content.root, blocks);
  for (const b of blocks) {
    if (b.blockType === "faq") {
      for (const it of b.items || []) {
        const answer = stripHtml(innerHtml(it?.answer));
        if (it?.question && answer) faq.push({ question: String(it.question), answer });
      }
    }
    if (b.blockType === "bettingTable" && !ranking.length) {
      for (const r of b.rows || []) {
        if (r?.name) ranking.push({ name: String(r.name), href: String(r.href || "") || undefined });
      }
    }
  }
  // Sem tabela, o ranking vem dos cards (mesma ordem do texto).
  if (!ranking.length) {
    for (const b of blocks) {
      if (b.blockType === "bettingReview" && b.name) {
        ranking.push({ name: String(b.name), href: String(b.linkHref || "") || undefined });
      }
    }
  }
  return { faq, ranking };
}

// Converte um campo richText (Lexical do editor completo) em HTML, com os MESMOS
// conversores dos posts (vídeo, Instagram, X, escalação, colunas, destaque). Usado pelas
// PÁGINAS do CMS (PageBlock) para renderizar os cards igual aos posts. Ver [[ProseBody]].
export function lexicalToHtml(content: any): string {
  if (!content || typeof content !== "object" || !content.root?.children?.length) return "";
  try {
    // Mesmo pós-processamento do corpo do post: âncoras nos títulos + índice automático.
    return fillAutoToc(withHeadingAnchors(convertLexicalToHTML({ data: content, converters: lexicalConverters })));
  } catch {
    return "";
  }
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
  // FAQ e ranking dos blocos do editor → JSON-LD (FAQPage / ItemList) na página do artigo.
  const structured = extractStructured(p.content);
  return {
    faq: structured.faq.length ? structured.faq : undefined,
    ranking: structured.ranking.length ? structured.ranking : undefined,
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
      // depth 2: popula relações DENTRO dos blocos do corpo (ex.: a foto do autor no
      // bloco "Sobre o autor", que é upload dentro da relação `authors`).
      depth: 2,
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
