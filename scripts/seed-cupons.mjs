// Monta a seção de CUPONS (10/11/2026): hub /cupons + páginas fixas por loja
// (/cupons/mercado-livre, /cupons/amazon, /cupons/shopee) e os 6 banners promocionais
// (11.11 e Black Friday × 3 lojas).
//
// Regras:
//  - Páginas SEMPRE como RASCUNHO (só o Ivan publica). Revisar em /cms-preview/pagina/{id}.
//  - Cupons de exemplo vão SEM link e SEM código → o bloco não aparece no site até a
//    redação preencher (nunca inventar cupom).
//  - Banners sem link de afiliado → não aparecem no site (só com ?banner=preview).
//  - Idempotente: se o slug já existe, não sobrescreve.
//
// Como rodar (ver memória criar_post_payload_run): container efêmero pdb-migrate na
// pdb-net com o volume montado, artes em /app/banners/*.png →
//   npx payload run scripts/seed-cupons.mjs   (log em /app/out.txt)
import fs from "fs";

const LOG = "/app/out.txt";
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

// ── helpers Lexical ──
const T = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const B = (text) => T(text, 1);
const P = (...children) => ({ type: "paragraph", children: children.map((c) => (typeof c === "string" ? T(c) : c)), direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const H = (tag, text) => ({ type: "heading", tag, children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1 });
const LIST = (kind, items) => ({
  type: "list", listType: kind === "ol" ? "number" : "bullet", tag: kind, start: 1, direction: "ltr", format: "", indent: 0, version: 1,
  children: items.map((it, i) => ({ type: "listitem", value: i + 1, checked: undefined, direction: "ltr", format: "", indent: 0, version: 1,
    children: (Array.isArray(it) ? it : [it]).map((c) => (typeof c === "string" ? T(c) : c)) })),
});
const RT = (...nodes) => ({ root: { type: "root", children: nodes, direction: "ltr", format: "", indent: 0, version: 1 } });
const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { blockType, ...fields } });
const FAQ = (items) => BLOCK("faq", { title: "Perguntas frequentes", firstOpen: true, items: items.map(([question, answer]) => ({ question, answer: RT(P(answer)) })) });
// Cupom-modelo: sem link e sem código = invisível no site; serve de molde no /cms.
const COUPON_MODEL = (store, title) => BLOCK("coupon", { store, title, code: "", details: "Modelo: preencha o código e/ou o link de afiliado para o cupom aparecer no site. Sem link e sem código ele fica oculto.", validUntil: "", url: "", buttonLabel: "Ir para a loja" });

const DISCLOSURE = "Transparência: esta página tem links de afiliado. Se você comprar por eles, o Papo de Bola pode receber uma comissão da loja, sem custo a mais para você. Cupons e preços mudam sem aviso; confira as condições na loja antes de pagar.";

const CALENDAR = LIST("ul", [
  [B("11.11 (11 de novembro): "), T("nasceu na China como o Dia dos Solteiros e virou data de ofertas no Brasil, puxada pelas lojas de marketplace. Funciona como um esquenta da Black Friday.")],
  [B("Black Friday (27 de novembro de 2026): "), T("o maior dia de descontos do ano no varejo. Muitas lojas começam as ofertas dias antes e estendem pelo fim de semana.")],
  [B("Cyber Monday (30 de novembro de 2026): "), T("a segunda-feira depois da Black Friday, com foco em eletrônicos e compras online.")],
  [B("12.12 e Natal: "), T("última leva de cupons do ano, boa para presentes. Atenção ao prazo de entrega antes do dia 25.")],
]);

const otherStores = (self) => ({
  blockType: "linkCards",
  title: "Cupons de outras lojas",
  items: [
    { label: "Todos os cupons", href: "/cupons" },
    ...[
      ["mercado-livre", "Cupom Mercado Livre"],
      ["amazon", "Cupom Amazon"],
      ["shopee", "Cupom Shopee"],
    ].filter(([s]) => s !== self).map(([s, label]) => ({ label, href: `/cupons/${s}` })),
  ],
});
const feed = { blockType: "newsFeed", source: "category", value: "Cupons", limit: 6, layout: "grid", title: "Ofertas e cupons do dia" };

// ── Páginas por loja ──
const STORES = [
  {
    key: "mercadolivre", slug: "cupom-mercado-livre", path: "/cupons/mercado-livre", name: "Mercado Livre", self: "mercado-livre",
    h1: "Cupom Mercado Livre: cupons de desconto de hoje",
    subtitle: "Cupons conferidos pela redação, com regras e validade de cada um.",
    metaTitle: "Cupom Mercado Livre hoje: cupons de desconto válidos | Papo de Bola",
    metaDescription: "Cupons de desconto do Mercado Livre conferidos pela redação, com regras e validade. Veja como aplicar o cupom e economizar no 11.11 e na Black Friday.",
    intro: "Nesta página reunimos os cupons de desconto do Mercado Livre que estão valendo, com as regras de cada um: valor mínimo, categorias, limite de uso e validade. A lista é atualizada pela redação do Papo de Bola e fica mais movimentada nas datas de promoção, como o 11.11 e a Black Friday.",
    howTo: [
      "Entre na sua conta do Mercado Livre pelo app ou pelo site.",
      "Se o cupom tiver código, copie o código aqui na página. Se for um cupom ativado pelo link, toque no botão da oferta para abrir a loja.",
      "Coloque os produtos no carrinho e confira se eles entram na regra do cupom (categoria, vendedor e valor mínimo).",
      "No resumo da compra, abra a área de cupons, cole o código ou escolha o cupom disponível e confira o desconto antes de pagar.",
    ],
    tips: [
      "Compare o preço com o de outros vendedores do mesmo produto. Um cupom alto sobre um preço inflado não é desconto de verdade.",
      "Veja a reputação do vendedor e se o produto tem envio pelo Mercado Livre (Full), que costuma chegar mais rápido.",
      "Leia as condições: muitos cupons valem só para algumas categorias ou para a primeira compra.",
      "Some o cupom com o desconto do pagamento à vista quando a loja permitir.",
    ],
    faq: [
      ["Onde ficam os cupons do Mercado Livre?", "Os cupons ativos aparecem na área de cupons da sua conta e no resumo da compra. Os cupons desta página indicam se precisam de código ou se são ativados pelo link."],
      ["Posso usar mais de um cupom na mesma compra?", "Em geral, o Mercado Livre aceita um cupom por compra. A regra de cada cupom aparece no resumo do pedido antes do pagamento."],
      ["Por que o cupom não funcionou?", "Os motivos mais comuns são valor mínimo não atingido, produto fora da categoria do cupom, cupom já usado ou fora da validade. Confira as regras listadas em cada cupom."],
      ["Quando aparecem os melhores cupons?", "Nas grandes datas do varejo: 11.11, Black Friday, Cyber Monday e Natal. Nesses dias atualizamos esta página com mais frequência."],
    ],
  },
  {
    key: "amazon", slug: "cupom-amazon", path: "/cupons/amazon", name: "Amazon", self: "amazon",
    h1: "Cupom Amazon: cupons de desconto de hoje",
    subtitle: "Códigos promocionais e cupons de produto conferidos pela redação.",
    metaTitle: "Cupom Amazon hoje: códigos promocionais válidos | Papo de Bola",
    metaDescription: "Cupons e códigos promocionais da Amazon conferidos pela redação, com regras e validade. Saiba aplicar o cupom e economizar no 11.11 e na Black Friday.",
    intro: "Aqui você encontra os cupons de desconto da Amazon que estão valendo, com as regras de cada um. Na Amazon há dois tipos de desconto: o código promocional, digitado no fechamento do pedido, e o cupom de produto, ativado com um clique na própria página do item. Indicamos em cada oferta qual é o caso.",
    howTo: [
      "Entre na sua conta da Amazon.",
      "Se o cupom tiver código, copie o código aqui na página. Se for cupom de produto, toque no botão da oferta e, na página do item, marque a opção de aplicar o cupom.",
      "Adicione o produto ao carrinho e vá para o fechamento do pedido.",
      "Na etapa de pagamento, use o campo de código promocional ou vale-presente para colar o código e confira o desconto no resumo.",
    ],
    tips: [
      "Confira se o produto é vendido e entregue pela Amazon ou por um vendedor parceiro: prazo, frete e troca podem mudar.",
      "Fique de olho nas ofertas relâmpago, que têm estoque e tempo limitados.",
      "Assinantes Prime costumam ter frete grátis e ofertas exclusivas nas grandes datas.",
      "Desconfie de preço muito abaixo do normal em vendedor sem avaliações.",
    ],
    faq: [
      ["Qual a diferença entre cupom e código promocional na Amazon?", "O cupom de produto é ativado na própria página do item, marcando a opção de aplicar o cupom. O código promocional é digitado no fechamento do pedido."],
      ["O cupom da Amazon vale para qualquer produto?", "Não. Cada cupom tem regras de produtos, vendedores e valor mínimo. As condições aparecem junto de cada cupom nesta página."],
      ["Por que o desconto não apareceu no pedido?", "O desconto do cupom de produto só entra se a opção foi marcada antes de colocar o item no carrinho. Já o código promocional precisa ser aplicado na etapa de pagamento."],
      ["Quando a Amazon tem mais cupons?", "Nas grandes datas, como Black Friday, Cyber Monday e Natal, além dos eventos próprios da loja. Nesses períodos atualizamos esta página com mais frequência."],
    ],
  },
  {
    key: "shopee", slug: "cupom-shopee", path: "/cupons/shopee", name: "Shopee", self: "shopee",
    h1: "Cupom Shopee: cupons de desconto e frete grátis de hoje",
    subtitle: "Cupons da loja, de vendedores e de frete grátis conferidos pela redação.",
    metaTitle: "Cupom Shopee hoje: desconto e frete grátis | Papo de Bola",
    metaDescription: "Cupons de desconto e de frete grátis da Shopee conferidos pela redação, com regras e validade. Veja como resgatar e economizar no 11.11 e na Black Friday.",
    intro: "Esta página reúne os cupons da Shopee que estão valendo, com as regras de cada um. Na Shopee existem cupons da própria loja, cupons de vendedores e cupons de frete grátis, e a maioria precisa ser resgatada antes da compra. As datas duplas, como o 11.11 e o 12.12, são as campanhas mais fortes da Shopee.",
    howTo: [
      "Entre na sua conta da Shopee, de preferência pelo app.",
      "Toque no botão da oferta aqui na página e resgate o cupom na loja. Se houver código, copie o código antes.",
      "Coloque os produtos no carrinho e confira se o cupom vale para aquele vendedor e para o valor mínimo da compra.",
      "No fechamento do pedido, escolha o cupom de desconto e o de frete grátis (quando houver) e confira o total antes de pagar.",
    ],
    tips: [
      "Resgate os cupons assim que eles aparecerem: muitos têm quantidade limitada e acabam rápido nas datas duplas.",
      "Combine o cupom da loja com o de frete grátis quando as regras permitirem.",
      "Veja a avaliação do vendedor, o prazo de envio e se o produto vem do exterior.",
      "Confira o preço antes da data de promoção para saber se o desconto é real.",
    ],
    faq: [
      ["Como resgatar cupom na Shopee?", "Toque em resgatar (ou salvar) na página do cupom. Ele fica guardado na sua conta e aparece para escolha no fechamento do pedido."],
      ["Dá para usar cupom de desconto e de frete grátis juntos?", "Na maioria das vezes, sim: a Shopee costuma permitir um cupom de desconto e um de frete na mesma compra, desde que as regras de cada um sejam atendidas."],
      ["Por que meu cupom da Shopee sumiu?", "Cupons têm validade e quantidade limitada. Se a quantidade acabou ou o prazo venceu, ele sai da sua conta."],
      ["Quando a Shopee tem mais cupons?", "Nas datas duplas (como 11.11 e 12.12), na Black Friday e no Natal. Nesses dias atualizamos esta página com mais frequência."],
    ],
  },
];

function storePage(s) {
  const content = RT(
    P(s.intro),
    H("h2", `Cupons ${s.name} de hoje`),
    P("Os cupons abaixo foram conferidos pela redação. Cada um mostra a regra, a validade e se precisa de código ou se é ativado pelo link."),
    COUPON_MODEL(s.key, `Modelo de cupom ${s.name} (preencher)`),
    COUPON_MODEL(s.key, `Modelo de cupom ${s.name} (preencher)`),
    H("h2", `Como usar cupom no ${s.name === "Mercado Livre" ? "Mercado Livre" : s.name === "Amazon" ? "site da Amazon" : "app da Shopee"}`),
    LIST("ol", s.howTo),
    H("h2", "Quando aparecem os melhores cupons"),
    P("Os descontos mais fortes se concentram em algumas datas do calendário do varejo. Nelas, esta página ganha atualizações ao longo do dia:"),
    CALENDAR,
    H("h2", "Dicas para economizar de verdade"),
    LIST("ul", s.tips),
    H("h2", "Cuidado com golpes"),
    P("Nas datas de promoção crescem os sites falsos e as mensagens com links que imitam as lojas. Antes de pagar, confira se o endereço no navegador é o oficial da loja, desconfie de preços muito abaixo do normal e nunca informe senha ou código de verificação recebido por SMS."),
    FAQ(s.faq),
  );
  return {
    title: `Cupom ${s.name}`,
    slug: s.slug,
    path: s.path,
    editor: "blocks",
    hero: { h1: s.h1, subtitle: s.subtitle, style: "left" },
    layoutStyle: { width: "narrow", showBreadcrumb: true },
    layout: [
      { blockType: "note", text: DISCLOSURE },
      { blockType: "richText", content },
      feed,
      otherStores(s.self),
    ],
    seo: { metaTitle: s.metaTitle, metaDescription: s.metaDescription },
  };
}

const hub = {
  title: "Cupons de desconto",
  slug: "cupons",
  path: "/cupons",
  editor: "blocks",
  hero: { h1: "Cupons de desconto", subtitle: "Mercado Livre, Amazon e Shopee: cupons conferidos pela redação do Papo de Bola.", style: "left" },
  layoutStyle: { width: "narrow", showBreadcrumb: true },
  layout: [
    { blockType: "note", text: DISCLOSURE },
    {
      blockType: "cards", columns: "3",
      items: [
        { title: "Cupom Mercado Livre", text: "Cupons de desconto e como aplicar no resumo da compra.", href: "/cupons/mercado-livre", linkLabel: "Ver cupons" },
        { title: "Cupom Amazon", text: "Códigos promocionais e cupons de produto.", href: "/cupons/amazon", linkLabel: "Ver cupons" },
        { title: "Cupom Shopee", text: "Cupons da loja, de vendedores e de frete grátis.", href: "/cupons/shopee", linkLabel: "Ver cupons" },
      ],
    },
    {
      blockType: "richText",
      content: RT(
        P("O Papo de Bola reúne aqui os cupons de desconto das maiores lojas online do Brasil. Cada loja tem uma página própria, com os cupons que estão valendo, as regras de uso e um passo a passo para aplicar o desconto. Nas grandes datas do varejo, publicamos também as ofertas do dia."),
        H("h2", "Calendário de promoções"),
        CALENDAR,
        H("h2", "Como escolhemos os cupons"),
        P("Antes de entrar na lista, cada cupom é conferido pela redação: se o código funciona, qual o valor mínimo, para quais produtos vale e até quando. Cupom vencido sai da página. Quando um desconto depende de ativação pelo link, avisamos no próprio cupom."),
        FAQ([
          ["Os cupons são gratuitos?", "Sim. Você não paga nada para usar os cupons. Se comprar pelos nossos links, a loja pode pagar uma comissão ao Papo de Bola, sem custo a mais para você."],
          ["Com que frequência a lista é atualizada?", "Conferimos os cupons regularmente e com mais frequência nas datas de promoção, como 11.11, Black Friday, Cyber Monday e Natal."],
          ["O cupom não funcionou. O que fazer?", "Confira as regras do cupom (valor mínimo, categoria, validade e limite de uso). Se ainda assim não funcionar, ele pode ter esgotado na loja."],
        ]),
      ),
    },
    feed,
  ],
  seo: {
    metaTitle: "Cupons de desconto: Mercado Livre, Amazon e Shopee | Papo de Bola",
    metaDescription: "Cupons de desconto do Mercado Livre, da Amazon e da Shopee conferidos pela redação, com regras e validade. Ofertas do 11.11, Black Friday e Cyber Monday.",
  },
};

// ── Banners (11.11 e Black Friday × 3 lojas) ──
const BANNER_STORES = [
  ["mercadolivre", "mercado-livre", "Mercado Livre", "no"],
  ["amazon", "amazon", "Amazon", "na"],
  ["shopee", "shopee", "Shopee", "na"],
];
const CAMPAIGNS = [
  { file: "11-11", slug: "1111", label: "11.11", alt: (n, p) => `11.11: ofertas antecipadas com cupom ${p} ${n}`, startsAt: "2026-11-10T00:00:00-03:00", endsAt: "2026-11-12T00:00:00-03:00" },
  { file: "black-friday", slug: "black-friday", label: "Black Friday", alt: (n, p) => `Black Friday: os maiores descontos do ano com cupom ${p} ${n}`, startsAt: "2026-11-12T00:00:00-03:00", endsAt: "2026-12-01T00:00:00-03:00" },
];

fs.writeFileSync(LOG, "");
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });

async function upsertPage(data) {
  const found = await payload.find({ collection: "pages", where: { slug: { equals: data.slug } }, limit: 1, depth: 0, draft: true });
  if (found.docs[0]) { log(`PAGE skip (já existe) ${data.slug} id=${found.docs[0].id}`); return; }
  const doc = await payload.create({ collection: "pages", draft: true, data: { ...data, _status: "draft" } });
  log(`PAGE ok ${data.slug} id=${doc.id} path=${data.path} (rascunho)`);
}

async function media(file, alt) {
  const filePath = `/app/banners/${file}`;
  if (!fs.existsSync(filePath)) throw new Error(`arte não encontrada: ${filePath}`);
  const doc = await payload.create({ collection: "media", filePath, data: { alt } });
  return doc.id;
}

try {
  await upsertPage(hub);
  for (const s of STORES) await upsertPage(storePage(s));

  for (const c of CAMPAIGNS) {
    for (const [fileKey, slugKey, name, prep] of BANNER_STORES) {
      const slug = `${c.slug}-${slugKey}`;
      const exists = await payload.find({ collection: "promoBanners", where: { slug: { equals: slug } }, limit: 1, depth: 0 });
      if (exists.docs[0]) { log(`BANNER skip (já existe) ${slug}`); continue; }
      const alt = c.alt(name, prep);
      const desk = await media(`${c.file}-${fileKey}-computador.png`, alt);
      const mob = await media(`${c.file}-${fileKey}-celular.png`, alt);
      const doc = await payload.create({
        collection: "promoBanners",
        data: { name: `${c.label} — ${name}`, slug, imageDesktop: desk, imageMobile: mob, alt, url: "", startsAt: c.startsAt, endsAt: c.endsAt, active: true },
      });
      log(`BANNER ok ${slug} id=${doc.id} (sem link: não aparece até colar o afiliado)`);
    }
  }
  log("FIM");
} catch (e) {
  log(`ERRO ${e?.stack || e}`);
}
