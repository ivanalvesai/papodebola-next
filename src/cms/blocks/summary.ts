// Import relativo (com .ts) de propósito: o node:test não resolve o alias "@/".
import { TOURNAMENT_BY_SLUG } from "../../lib/config.ts";

// Rótulo curto de um bloco colapsado no /cms (ex.: "Cruzeiro · Próximos jogos").
// Puro: usado pelo componente BlockSummaryLabel (client) e testado em node:test.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const WIDGET_LABELS: Record<string, string> = {
  todayMatch: "Jogo de hoje",
  upcoming: "Próximos jogos",
  results: "Resultados recentes",
  standing: "Classificação (posição)",
  news: "Notícias do time",
  scorers: "Artilheiros",
  whereToWatch: "Onde assistir",
  lineup: "Escalação provável",
};

export function tournamentLabel(slug: string | undefined): string {
  if (!slug) return "";
  if (slug === "copa-do-mundo") return "Copa do Mundo 2026";
  return TOURNAMENT_BY_SLUG[slug]?.name || slug;
}

function lexicalText(content: any): string {
  const out: string[] = [];
  const walk = (n: any) => {
    if (!n) return;
    if (typeof n.text === "string") out.push(n.text);
    (n.children || []).forEach(walk);
  };
  walk(content?.root);
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function clip(s: string, max = 52): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function cols(n: number): string {
  return `${n} ${n === 1 ? "coluna" : "colunas"}`;
}

function count(arr: unknown, one: string, many: string): string {
  const n = Array.isArray(arr) ? arr.length : 0;
  return `${n} ${n === 1 ? one : many}`;
}

function join(...parts: (string | number | undefined | null | false)[]): string {
  return parts.filter((p) => p !== undefined && p !== null && p !== false && p !== "").join(" · ");
}

export function blockSummary(blockType: string, data: any): string {
  const d = data || {};
  switch (blockType) {
    case "heading": return clip(d.text || "");
    case "richText": { const t = lexicalText(d.content); return t ? clip(t) : "Texto vazio"; }
    case "image": return d.caption ? clip(d.caption) : (d.image?.alt ? clip(d.image.alt) : "Imagem");
    case "gallery": return `${(d.images || []).length} imagens`;
    case "quote": return clip(d.text || "");
    case "button": return join(d.label, d.url);
    case "list": return `${(d.items || []).length} itens`;
    case "infoCard": return join(d.label, d.value);
    case "note": return clip(d.text || "");
    case "youtube": return clip(d.title || d.url || "");
    case "linkCards": return join(d.title, `${(d.items || []).length} cards`);
    case "columns": return cols((d.columns || []).length);
    case "table": return `${(d.rows || []).length} linhas`;
    case "todayGames": return join(d.title, d.league && d.league !== "all" ? tournamentLabel(d.league) : "Todas as ligas");
    case "teamWidget": {
      const team = d.team && typeof d.team === "object" ? d.team.name : undefined;
      return join(team, WIDGET_LABELS[d.widget] || d.widget);
    }
    case "standings": return join(d.title, tournamentLabel(d.tournament), d.compact && "compacta");
    case "scorers": return join(d.title, tournamentLabel(d.tournament), d.limit);
    case "newsFeed": {
      const src = d.source === "category" ? `Categoria ${d.value || ""}`.trim()
        : d.source === "tag" ? `Tag ${d.value || ""}`.trim()
        : d.source === "team" ? `Time ${d.team && typeof d.team === "object" ? d.team.name : ""}`.trim()
        : "Últimas notícias";
      return join(d.title, src, d.limit);
    }
    case "liveMatch": return join(d.title, d.matchId && `jogo ${d.matchId}`);
    case "section": return join(d.title, cols((d.columns || []).length || 1));
    // ── blocos ricos ──
    case "hero": return clip(d.title || "");
    case "cta": return clip(d.title || "");
    case "mediaText": return clip(d.title || "");
    case "faq": return join(d.title, count(d.items, "pergunta", "perguntas"));
    case "tabs": return join(d.title, count(d.items, "aba", "abas"));
    case "carousel": return join(d.title, count(d.images, "imagem", "imagens"));
    case "buttons": return count(d.items, "botão", "botões");
    case "social": return count(d.items, "rede", "redes");
    case "stats": case "testimonials": case "people": case "timeline": case "iconList": case "cards":
      return join(d.title, count(d.items, "item", "itens"));
    case "divider": return d.style === "space" ? "Espaço" : "Linha";
    case "instagram": case "xPost": return clip((d.url || "").replace(/^https?:\/\/(www\.)?/, ""));
    case "embed": return `HTML (${(d.html || "").length} caracteres)`;
    case "formBlock": return (d.form && typeof d.form === "object" && d.form.title) || "Formulário";
    case "countdown": return (d.team && typeof d.team === "object" && d.team.name) || (d.matchId && `jogo ${d.matchId}`) || "";
    case "snippet": return (d.snippet && typeof d.snippet === "object" && d.snippet.title) || "Trecho";
    default: return "";
  }
}
