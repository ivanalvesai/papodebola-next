import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type { MatchCommentary } from "./match-detail";

// Comentários MANUAIS (editoriais) de um jogo, cadastrados no /cms (collection matchComments).
// Injetados no lance a lance pelo minuto (ver getMatchDetail/getMatchLive). Conteúdo rico:
// texto + imagem + link (nova aba). Retorna [] em erro/no build (nunca derruba o render).
/* eslint-disable @typescript-eslint/no-explicit-any */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// Fase (sem minuto) → posição no feed + rótulo exibido. O feed é DESCENDENTE por minuto
// (mais recente no topo). Pré-jogo vai pro fundo (minuto baixo), fim vai pro topo (minuto alto).
function resolveMoment(moment: string, minute: number | null): { pos: number | null; label: string | null } {
  const m = moment.trim();
  // sem fase → usa o minuto; se também não tiver minuto, vai pro topo (999 = mais recente).
  if (!m) return { pos: minute ?? 999, label: null };
  const key = m
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // tira acento pra casar "pré"/"pre", "prorrogação"/"prorrogacao"
  let pos: number;
  if (/(pre-?jogo|antes|aquecimento|escala)/.test(key)) pos = -5; // fundo (antes do apito)
  else if (/intervalo/.test(key)) pos = 45; // entre 1º e 2º tempo
  else if (/prorrog/.test(key)) pos = 91; // após os 90
  else if (/(fim|encerr|pos-?jogo|final|apito final)/.test(key)) pos = 999; // topo (jogo acabou)
  else pos = typeof minute === "number" ? minute : 999; // fase livre: usa o minuto, senão topo
  return { pos, label: m };
}

// Conversor do upload (imagem) do Lexical -> <figure><img>. Links/negrito/etc. vêm do default.
const converters: any = ({ defaultConverters }: any) => ({
  ...defaultConverters,
  upload: ({ node }: any) => {
    const doc = node?.value;
    if (!doc || typeof doc !== "object" || !doc.url) return "";
    const src = String(doc.url).startsWith("http") ? doc.url : `${SITE_URL}${doc.url}`;
    const alt = String(doc.alt || "").replace(/"/g, "&quot;");
    const cap = String(node?.fields?.caption || "").trim();
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const figcap = cap ? `<figcaption>${esc(cap)}</figcaption>` : "";
    return `<figure class="pdb-comment-img"><img src="${src}" alt="${alt}" loading="lazy" />${figcap}</figure>`;
  },
});

export async function getMatchComments(matchId: number): Promise<MatchCommentary[]> {
  if (!matchId || process.env.NEXT_PHASE === "phase-production-build") return [];
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "matchComments",
      where: { matchId: { equals: matchId } },
      sort: "minute",
      limit: 50,
      depth: 1,
    });
    return res.docs.map((d: any) => {
      let html = "";
      const c = d.content;
      if (c && c.root && Array.isArray(c.root.children) && c.root.children.length) {
        try {
          html = convertLexicalToHTML({ data: c, converters });
        } catch {
          html = "";
        }
      }
      // highlight=false → sem cabeçalho (só o texto/foto). text vazio = o render não mostra o header.
      const highlighted = d.highlight !== false;
      // Fase (pré-jogo/intervalo/...) posiciona no feed e vira o rótulo do minuto.
      const { pos, label: momentLabel } = resolveMoment(
        typeof d.moment === "string" ? d.moment : "",
        typeof d.minute === "number" ? d.minute : null
      );
      return {
        id: 3_000_000_000 + (d.id || 0),
        type: "editorial",
        text: highlighted ? d.label || "Comentário da Redação" : "",
        textPt: null,
        html,
        isHome: null,
        player: null,
        playerId: null,
        playerIn: null,
        playerInId: null,
        playerOut: null,
        reason: null,
        minute: pos,
        minuteLabel: momentLabel,
      } as MatchCommentary;
    });
  } catch {
    return [];
  }
}
