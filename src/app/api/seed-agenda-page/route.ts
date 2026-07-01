import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// TEMPORÁRIA: cria/atualiza a Página do CMS "jogos-de-hoje-futebol" (collection pages).
// Idempotente por slug. Protegida por REVALIDATION_SECRET. Rodar depois da migração dos
// blocos todayGames + linkCards. REMOVER depois.  GET/POST /api/seed-agenda-page?secret=XXX
export const dynamic = "force-dynamic";

/* ---------- helpers lexical ---------- */
/* eslint-disable @typescript-eslint/no-explicit-any */
const t = (text: string, format = 0): any => ({ type: "text", version: 1, detail: 0, format, mode: "normal", style: "", text });
const a = (text: string, url: string): any => ({
  type: "link", version: 3, format: "", indent: 0, direction: "ltr",
  fields: { linkType: "custom", url, newTab: false }, children: [t(text)],
});
const rich = (...nodes: any[]): any => ({
  root: {
    type: "root", format: "", indent: 0, version: 1, direction: "ltr",
    children: [{ type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr", textFormat: 0, children: nodes }],
  },
});
const heading = (text: string, level: "h2" | "h3" = "h2") => ({ blockType: "heading", text, level });
const richBlock = (...nodes: any[]) => ({ blockType: "richText", content: rich(...nodes) });
const note = (text: string) => ({ blockType: "note", text });

const LAYOUT: any[] = [
  {
    blockType: "todayGames",
    league: "all",
    emptyTitle: "Nenhum jogo de futebol programado para hoje.",
    emptyText: "Confira os jogos de outras modalidades ou veja a agenda dos próximos dias.",
    primaryCtaLabel: "Ver jogos de hoje (Geral)",
    primaryCtaHref: "/jogos-de-hoje",
    secondaryCtaLabel: "Ver próximos jogos",
    secondaryCtaHref: "/jogos-de-hoje?d=amanha",
  },
  heading("Principais Campeonatos de Futebol", "h2"),
  {
    blockType: "linkCards",
    items: [
      { label: "Copa do Mundo 2026", href: "/futebol/copa-do-mundo" },
      { label: "Brasileirão Série A", href: "/futebol/brasileirao-serie-a" },
      { label: "Brasileirão Série B", href: "/futebol/brasileirao-serie-b" },
      { label: "Copa do Brasil", href: "/futebol/copa-do-brasil" },
      { label: "Copa Libertadores", href: "/futebol/libertadores" },
      { label: "Champions League", href: "/futebol/champions-league" },
    ],
  },
  heading("Perguntas Frequentes", "h2"),
  heading("Que horas passam os jogos de futebol de hoje?", "h3"),
  richBlock(
    t("Todos os horários aqui são de Brasília. Se você está planejando o dia em cima dos jogos, já vai encontrar cada partida com hora e campeonato certinho. Quer ver a programação de outro dia? Use o seletor de datas acima ou confira a aba "),
    a("Geral", "/jogos-de-hoje"),
    t(" com todos os esportes.")
  ),
  heading("Onde assistir aos jogos de futebol hoje?", "h3"),
  richBlock(
    t("O futebol está cada vez mais dividido entre canais e plataformas. O Brasileirão passa no Premiere e no SporTV, com alguns jogos abrindo pra Globo nas rodadas com transmissão aberta. A Copa do Mundo 2026 tem cobertura na Globo e na CazéTV. Libertadores e Champions League ficam no Paramount+ e no Disney+. Antes de sentar no sofá, confira a programação completa e atualizada na página "),
    a("Onde Assistir", "/futebol/onde-assistir"),
    t(".")
  ),
  heading("Quais campeonatos têm jogos hoje?", "h3"),
  richBlock(
    t("A agenda reúne os principais campeonatos em andamento. No momento você encontra aqui jogos do Brasileirão Série A, Série B, Copa do Brasil, Copa Libertadores e Copa do Mundo 2026. A listagem é atualizada automaticamente conforme os jogos são confirmados pelas entidades organizadoras, então o que aparece aqui é o que está oficialmente programado para hoje.")
  ),
  heading("A agenda de jogos de futebol é atualizada todos os dias?", "h3"),
  richBlock(
    t("Sim, todos os dias. Final de semana e feriado também, que é justamente quando a programação fica mais cheia. Acompanhe as "),
    a("Notícias", "/noticias"),
    t(" pelo menu para ficar por dentro de tudo que acontece no futebol.")
  ),
  note("Horários de Brasília. Mostramos os principais campeonatos de cada modalidade."),
];

const DATA: any = {
  title: "Jogos de Hoje — Futebol",
  slug: "jogos-de-hoje-futebol",
  hero: { h1: "Agenda dos Jogos de Hoje de Futebol" },
  layout: LAYOUT,
  seo: {
    metaTitle: "Jogos de Futebol: Agenda, Datas e Horários | Papo de Bola",
    metaDescription:
      "Acompanhe os jogos de futebol de hoje no Brasil e no mundo com datas, horários e informações atualizadas.",
  },
  _status: "published",
};

async function handle(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: DATA.slug } },
    limit: 1,
    draft: true,
  });
  let doc;
  if (existing.docs[0]) {
    doc = await payload.update({ collection: "pages", id: existing.docs[0].id, data: DATA });
  } else {
    doc = await payload.create({ collection: "pages", data: DATA });
  }
  return NextResponse.json({ ok: true, id: doc.id, slug: doc.slug, blocks: LAYOUT.length });
}

export const POST = handle;
export const GET = handle;
