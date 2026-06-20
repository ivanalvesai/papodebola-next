import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Seeder das páginas institucionais pro Payload (migração "em partes"). Cria/atualiza
// a Página com o MESMO conteúdo de hoje, via API local (sem auth). Protegido por
// REVALIDATION_SECRET. Idempotente (upsert por slug). Ex:
//   POST /api/payload-seed?secret=XXX&page=sobre
export const dynamic = "force-dynamic";

/* ---------- helpers lexical (rich text) ---------- */
/* eslint-disable @typescript-eslint/no-explicit-any */
const t = (text: string): any => ({
  type: "text",
  version: 1,
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text,
});
const a = (text: string, url: string): any => ({
  type: "link",
  version: 3,
  format: "",
  indent: 0,
  direction: "ltr",
  fields: { linkType: "custom", url, newTab: false },
  children: [t(text)],
});
// rich(): um parágrafo só, recebe nós de texto/link
const rich = (...nodes: any[]): any => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      { type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr", textFormat: 0, children: nodes },
    ],
  },
});
const b = (text: string): any => ({
  type: "text",
  version: 1,
  detail: 0,
  format: 1, // bold
  mode: "normal",
  style: "",
  text,
});
const para = (content: any) => ({ blockType: "richText", content });
const h2 = (text: string) => ({ blockType: "heading", text, level: "h2" });
const note = (text: string) => ({ blockType: "note", text });
const infoCard = (label: string, value: string, href?: string) => ({
  blockType: "infoCard",
  label,
  value,
  href,
});
// list(...items) onde cada item é um array de nós (texto/link/bold)
const list = (...items: any[][]) => ({
  blockType: "list",
  items: items.map((nodes) => ({ content: rich(...nodes) })),
});

/* ---------- conteúdo das páginas (fiel ao atual) ---------- */
const PAGES: Record<string, any> = {
  contato: {
    title: "Contato",
    slug: "contato",
    hero: { h1: "Contato" },
    seo: {
      metaTitle: "Contato",
      metaDescription:
        "Entre em contato com o Papo de Bola. Envie sugestões, dúvidas ou parcerias.",
    },
    layout: [
      para(
        rich(
          t(
            "Tem alguma sugestão, dúvida ou gostaria de propor uma parceria? Entre em contato conosco pelos canais abaixo."
          )
        )
      ),
      infoCard("E-mail", "contato@papodebola.com.br", "mailto:contato@papodebola.com.br"),
      note("Respondemos todas as mensagens em até 48 horas úteis."),
    ],
  },
  parceiros: {
    title: "Parceiros",
    slug: "parceiros",
    hero: { h1: "Parceiros" },
    seo: {
      metaTitle: "Parceiros",
      metaDescription:
        "Seja um parceiro do Papo de Bola. Divulgação, publieditoriais e parcerias comerciais.",
    },
    layout: [
      para(
        rich(
          t(
            "O Papo de Bola está aberto a parcerias com marcas, clubes, ligas, casas de apostas, produtoras de conteúdo e anunciantes que queiram alcançar uma audiência qualificada de fãs de futebol e outros esportes."
          )
        )
      ),
      h2("Formatos de parceria"),
      list(
        [t("Conteúdo patrocinado (publieditoriais)")],
        [t("Banners em páginas-chave (home, campeonatos, páginas de times)")],
        [t("Cobertura editorial de eventos e campanhas")],
        [t("Integração de API/dados esportivos")],
        [t("Distribuição em canais (newsletter, Telegram, WhatsApp)")]
      ),
      h2("Fale com a gente"),
      para(
        rich(
          t("Envie proposta para "),
          a("parceiros@papodebola.com.br", "mailto:parceiros@papodebola.com.br"),
          t(
            " com uma breve apresentação da empresa, objetivos da campanha e formatos de interesse. Retornamos em até 2 dias úteis."
          )
        )
      ),
    ],
  },
  sobre: {
    title: "Sobre Nós",
    slug: "sobre",
    hero: {
      h1: "Sobre Nós",
      subtitle: "Futebol e esporte, com a paixão de quem vive a bola desde 2004.",
    },
    seo: {
      metaTitle: "Sobre Nós",
      metaDescription:
        "Conheça quem está por trás do Papo de Bola, portal independente de futebol e esportes desde 2004, com notícias, placares e classificações.",
    },
    layout: [
      para(
        rich(
          t(
            "Somos um portal independente de esportes com notícias, placares ao vivo, classificações, calendários, escalações, estatísticas e os bastidores das principais competições, tudo de forma rápida, gratuita e acessível no computador ou no celular."
          )
        )
      ),
      h2("Nossa História"),
      para(
        rich(
          t(
            "Somos Lucas Lima e Ivan Alves, profissionais com mais de 15 anos em TI e marketing digital. Retomamos um portal criado em 2004 com foco exclusivo em futebol e decidimos ir além: reconstruímos tudo do zero com tecnologia moderna e expandimos a cobertura para todos os esportes. Acompanhamos futebol de perto, brasileiro, mundial e de várzea, com contato direto com a cena do futebol amador de Santana de Parnaíba e região, mas nossa visão sempre foi atender amantes de todos os esportes, entregando páginas rápidas, dados em tempo real e uma experiência de leitura limpa."
          )
        )
      ),
      h2("O Que Você Encontra Aqui"),
      para(
        rich(
          t(
            "Cobrimos os principais campeonatos do Brasil e do mundo, Brasileirão Série A e B, Copa do Brasil, Libertadores, Champions League, Premier League, Copa do Mundo e muito mais, com "
          ),
          a("jogos de hoje", "/jogos-de-hoje"),
          t(", "),
          a("resultados ao vivo", "/ao-vivo"),
          t(
            " e tabelas atualizadas a cada rodada. Também acompanhamos NBA, tênis, Fórmula 1, vôlei, MMA e futebol americano, com calendários, classificações e chaveamentos."
          )
        )
      ),
      para(
        rich(
          t("Na seção de "),
          a("notícias", "/noticias"),
          t(
            " você acompanha a cobertura editorial do dia a dia da bola: análises, repercussão dos jogos, mercado da bola e os assuntos que movimentam o torcedor."
          )
        )
      ),
      h2("Como Produzimos o Conteúdo"),
      para(
        rich(
          t(
            "Acreditamos em informação correta e bem apurada. Nossas matérias são escritas e revisadas com foco em clareza, contexto e linguagem acessível ao torcedor. Os dados esportivos, placares, escalações, classificações e estatísticas são extraídos diretamente das fontes oficiais de cada competição e atualizados em tempo real para refletir o que acontece em campo."
          )
        )
      ),
      para(
        rich(
          t(
            "Quando um conteúdo é corrigido ou atualizado, fazemos isso de forma transparente. Se você encontrar alguma informação imprecisa, fale com a gente, levamos isso a sério."
          )
        )
      ),
      h2("Independência e Publicidade"),
      para(
        rich(
          t(
            "O site é mantido de forma independente. Para custear a operação e seguir oferecendo conteúdo gratuito, exibimos anúncios e podemos firmar parcerias comerciais. A publicidade nunca interfere na cobertura editorial. O tratamento dos seus dados e o uso de cookies estão descritos na nossa "
          ),
          a("Política de Privacidade", "/politica-de-privacidade"),
          t(", e as regras de uso do site, nos "),
          a("Termos de Uso", "/termos-de-uso"),
          t(".")
        )
      ),
      h2("Fale com a gente"),
      para(
        rich(
          t(
            "Sugestões de pauta, correções, dúvidas ou propostas de parceria são sempre bem-vindas. Entre em contato pela nossa página de "
          ),
          a("contato", "/contato"),
          t(" ou pelo e-mail "),
          a("contato@papodebola.com.br", "mailto:contato@papodebola.com.br"),
          t(".")
        )
      ),
      para(
        rich(
          t(
            "Nosso compromisso é simples: entregar informação de qualidade para quem vive o esporte. Bom papo e bom jogo! ⚽"
          )
        )
      ),
    ],
  },
};

async function handle(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const which = url.searchParams.get("page");
  const asSlug = url.searchParams.get("as"); // override de slug (ex: preview sem tocar na rota real)
  const slugs = which ? [which] : Object.keys(PAGES);
  const payload = await getPayload({ config });
  const results: any[] = [];
  for (const key of slugs) {
    const base = PAGES[key];
    if (!base) {
      results.push({ slug: key, error: "sem definição" });
      continue;
    }
    // se ?as= veio, grava sob esse slug (preview); senão usa o slug real
    const slug = asSlug || base.slug;
    const data = { ...base, slug };
    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (existing.docs[0]) {
      const doc = await payload.update({ collection: "pages", id: existing.docs[0].id, data });
      results.push({ slug, action: "updated", id: doc.id });
    } else {
      const doc = await payload.create({ collection: "pages", data });
      results.push({ slug, action: "created", id: doc.id });
    }
  }
  return NextResponse.json({ ok: true, results }, { headers: { "Cache-Control": "no-store" } });
}

export const POST = handle;
export const GET = handle;
