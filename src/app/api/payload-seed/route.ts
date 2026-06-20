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
const a = (text: string, url: string, blank = false): any => ({
  type: "link",
  version: 3,
  format: "",
  indent: 0,
  direction: "ltr",
  fields: { linkType: "custom", url, newTab: blank },
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
const h3 = (text: string) => ({ blockType: "heading", text, level: "h3" });
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
  "politica-de-privacidade": {
    title: "Política de Privacidade",
    slug: "politica-de-privacidade",
    hero: { h1: "Política de Privacidade" },
    seo: {
      metaTitle: "Política de Privacidade",
      metaDescription:
        "Saiba como o Papo de Bola coleta, utiliza e protege os dados dos usuários, incluindo cookies, segurança, privacidade e seus direitos pela LGPD.",
    },
    layout: [
      note("Vigente desde 18 de junho de 2026."),
      para(
        rich(
          t("Esta Política de Privacidade descreve como o "),
          b("Papo de Bola"),
          t(
            ", portal de conteúdo esportivo disponível em www.papodebola.com.br, coleta, utiliza e protege as informações dos seus usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)."
          )
        )
      ),
      para(
        rich(
          t(
            "Ao navegar em nosso portal, você concorda com as práticas descritas neste documento. Caso tenha dúvidas, entre em contato conosco pelos canais indicados ao final desta política."
          )
        )
      ),
      h3("1. Informações Coletadas"),
      para(
        rich(
          t("O "),
          a("Papo de Bola", "/"),
          t(" coleta as seguintes categorias de dados durante a navegação em www.papodebola.com.br:")
        )
      ),
      list(
        [b("Dados de navegação anônimos:"), t(" endereço IP, tipo de dispositivo, navegador utilizado, páginas visitadas e tempo de permanência no site.")],
        [b("Cookies e tecnologias semelhantes:"), t(" utilizados para armazenar preferências e melhorar a experiência de uso (veja a Seção 2).")],
        [b("Dados fornecidos voluntariamente:"), t(" caso você preencha formulários de contato, cadastro de newsletter ou comentários, poderemos coletar nome, e-mail e outras informações por você informadas.")]
      ),
      para(rich(t("Não coletamos dados pessoais identificáveis sem o seu consentimento expresso."))),
      h3("2. Uso de Cookies"),
      para(
        rich(
          t(
            "O portal www.papodebola.com.br utiliza cookies para melhorar a navegação e entender como os usuários interagem com nossas páginas. Você pode gerenciar ou desativar os cookies nas configurações do seu navegador."
          )
        )
      ),
      para(rich(t("Tipos de cookies utilizados:"))),
      list(
        [b("Cookies funcionais:"), t(" garantem o funcionamento correto do site e o armazenamento de preferências de navegação.")],
        [b("Cookies de análise:"), t(" coletam dados anônimos sobre o comportamento dos visitantes por meio do Google Analytics.")],
        [
          b("Cookies de publicidade:"),
          t(" utilizados para exibição de anúncios relevantes, em conformidade com as políticas do Google Ads. Para veicular publicidade, utilizamos o "),
          b("Google AdSense"),
          t(" e fornecedores terceiros, que empregam cookies (como o cookie DoubleClick) para exibir anúncios mais relevantes em toda a Web, com base em visitas anteriores a este e a outros sites, e para limitar o número de vezes que um anúncio é exibido a você. Você pode desativar a publicidade personalizada nas "),
          a("Configurações de anúncios do Google", "https://www.google.com/settings/ads", true),
          t("."),
        ]
      ),
      para(rich(t("A desativação de cookies pode impactar o funcionamento de algumas funcionalidades do portal."))),
      h3("3. Finalidade do Uso dos Dados"),
      para(rich(t("As informações coletadas pelo Papo de Bola são utilizadas exclusivamente para:"))),
      list(
        [t("Melhorar a experiência de navegação e o conteúdo do portal.")],
        [t("Analisar o desempenho e o tráfego do site por meio do Google Analytics.")],
        [t("Exibir anúncios relevantes ao perfil de navegação por meio do Google AdSense e de fornecedores terceiros, em conformidade com as políticas do Google.")],
        [t("Enviar comunicações, como newsletters ou atualizações de conteúdo, caso você tenha se cadastrado.")],
        [t("Cumprir obrigações legais e regulatórias.")]
      ),
      h3("4. Compartilhamento de Dados"),
      para(rich(t("O Papo de Bola não vende, troca nem transfere seus dados pessoais a terceiros sem o seu consentimento. Podemos, entretanto:"))),
      list(
        [t("Compartilhar dados anônimos e agregados com parceiros analíticos para fins estatísticos.")],
        [t("Divulgar informações quando exigido por lei, ordem judicial ou autoridade competente.")],
        [t("Compartilhar dados com prestadores de serviço que auxiliam na operação do portal (ex.: hospedagem, plataformas de e-mail marketing), sempre sob acordos de confidencialidade alinhados à LGPD.")]
      ),
      h3("5. Segurança das Informações"),
      para(rich(t("O Papo de Bola adota medidas técnicas e organizacionais adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição, incluindo:"))),
      list(
        [t("Uso de conexões seguras (HTTPS) em todo o portal.")],
        [t("Controle de acesso restrito aos sistemas internos.")],
        [t("Monitoramento periódico de vulnerabilidades.")]
      ),
      para(rich(t("Embora nos esforcemos para garantir a segurança dos dados, nenhum sistema é completamente inviolável. Em caso de incidente de segurança que possa lhe afetar, notificaremos você conforme determinado pela LGPD."))),
      h3("6. Seus Direitos (LGPD)"),
      para(rich(t("Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem os seguintes direitos em relação aos seus dados pessoais:"))),
      list(
        [b("Acesso:"), t(" solicitar a confirmação da existência de tratamento e o acesso aos seus dados.")],
        [b("Correção:"), t(" requerer a correção de dados incompletos, inexatos ou desatualizados.")],
        [b("Exclusão:"), t(" solicitar a eliminação dos dados tratados com base no seu consentimento.")],
        [b("Portabilidade:"), t(" obter seus dados em formato estruturado para transferência a outro fornecedor.")],
        [b("Revogação do consentimento:"), t(" retirar o consentimento a qualquer momento, sem prejuízo ao tratamento realizado anteriormente.")],
        [b("Oposição:"), t(" opor-se ao tratamento de dados em caso de descumprimento da LGPD.")]
      ),
      para(rich(t("Para exercer qualquer um desses direitos, entre em contato conosco pelo e-mail indicado ao final desta política."))),
      h3("7. Retenção de Dados"),
      para(rich(t("Os dados pessoais coletados pelo Papo de Bola são armazenados pelo tempo necessário para cumprir as finalidades descritas nesta política, observados os prazos legais aplicáveis. Após o término do tratamento, os dados serão eliminados de forma segura ou anonimizados."))),
      h3("8. Links para Sites de Terceiros"),
      para(rich(t("O portal www.papodebola.com.br pode conter links para sites externos, como portais de notícias, federações esportivas, redes sociais e plataformas de vídeo. O Papo de Bola não se responsabiliza pelas práticas de privacidade desses sites e recomenda que você consulte as respectivas políticas de privacidade antes de fornecer quaisquer informações pessoais."))),
      h3("9. Alterações nesta Política"),
      para(rich(t("Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças nas nossas práticas ou na legislação aplicável. Quaisquer alterações serão publicadas nesta página, com atualização da data de vigência indicada no topo do documento. Recomendamos que você revise esta política regularmente."))),
      h3("10. Contato e Encarregado de Dados (DPO)"),
      para(
        rich(
          t("Para dúvidas, solicitações ou exercício dos seus direitos previstos na LGPD, "),
          a("entre em contato com o Papo de Bola", "/contato"),
          t(" ou envie um e-mail para "),
          a("contato@papodebola.com.br", "mailto:contato@papodebola.com.br"),
          t(". Responderemos no prazo de até 15 (quinze) dias úteis, conforme previsto na LGPD.")
        )
      ),
    ],
  },
  "termos-de-uso": {
    title: "Termos de Uso",
    slug: "termos-de-uso",
    hero: { h1: "Termos de Uso" },
    seo: {
      metaTitle: "Termos de Uso",
      metaDescription:
        "Conheça os Termos de Uso do Papo de Bola: regras de navegação, propriedade intelectual, condutas proibidas, privacidade e direitos dos usuários do portal.",
    },
    layout: [
      para(
        rich(
          t("Ao acessar e utilizar o portal "),
          a("www.papodebola.com.br", "/"),
          t(
            ", você concorda com os presentes Termos de Uso. Leia-os atentamente antes de navegar em nosso conteúdo. Caso não concorde com qualquer disposição, recomendamos que não utilize o portal."
          )
        )
      ),
      h3("1. Identificação"),
      para(rich(t("O portal Papo de Bola é operado por pessoa jurídica inscrita no CNPJ sob o nº 63.357.728/0001-95, com sede no Estado de São Paulo, Brasil, responsável por todo o conteúdo publicado em www.papodebola.com.br."))),
      h3("2. Sobre o Portal"),
      para(rich(t("O Papo de Bola é um portal de conteúdo esportivo dedicado ao futebol, oferecendo notícias, análises, opiniões, estatísticas e demais informações relacionadas ao esporte. O acesso ao portal é gratuito e não exige cadastro prévio para a leitura do conteúdo."))),
      h3("3. Uso Permitido"),
      para(rich(t("Ao acessar o Papo de Bola, você se compromete a utilizar o portal exclusivamente para fins lícitos e em conformidade com estes Termos de Uso. É permitido:"))),
      list(
        [t("Acessar e ler o conteúdo publicado no portal para uso pessoal e não comercial.")],
        [t("Compartilhar links para as páginas do portal em redes sociais e outros meios, desde que sem alteração do conteúdo original.")],
        [t("Entrar em contato com a equipe por meio dos canais oficiais disponibilizados.")]
      ),
      h3("4. Condutas Proibidas"),
      para(rich(t("É expressamente proibido ao usuário:"))),
      list(
        [t("Reproduzir, copiar, distribuir ou comercializar, total ou parcialmente, qualquer conteúdo do portal sem autorização prévia e por escrito do Papo de Bola.")],
        [t("Utilizar técnicas de scraping, crawling ou qualquer método automatizado para extração de dados do portal.")],
        [t("Publicar ou transmitir conteúdo ilegal, ofensivo, discriminatório, difamatório ou que viole direitos de terceiros.")],
        [t("Tentar acessar áreas restritas do portal ou comprometer a segurança dos sistemas.")],
        [t("Utilizar o portal para fins comerciais sem autorização expressa.")],
        [t("Praticar qualquer ato que interfira no funcionamento normal do portal ou prejudique outros usuários.")]
      ),
      h3("5. Propriedade Intelectual"),
      para(rich(t("Todo o conteúdo publicado no Papo de Bola, como textos, imagens, logotipos, vídeos e ilustrações, pertence ao portal ou aos seus respectivos autores e é protegido pela Lei de Direitos Autorais (Lei nº 9.610/1998)."))),
      para(rich(t("A reprodução parcial é permitida desde que citada a fonte com link para o conteúdo original. O uso comercial sem autorização prévia é proibido."))),
      h3("6. Isenção de Responsabilidade"),
      para(rich(t("O Papo de Bola se empenha em publicar informações precisas e atualizadas, porém não garante a completude, exatidão ou atualidade de todo o conteúdo disponível no portal. Assim, o Papo de Bola não se responsabiliza por:"))),
      list(
        [t("Eventuais imprecisões ou desatualizações nas informações publicadas.")],
        [t("Decisões tomadas pelo usuário com base no conteúdo do portal.")],
        [t("Indisponibilidade temporária do portal por manutenção, falhas técnicas ou motivos de força maior.")],
        [t("Conteúdo de sites de terceiros acessados por meio de links disponíveis no portal.")]
      ),
      h3("7. Links para Sites de Terceiros"),
      para(rich(t("O portal pode conter links para sites externos, como portais de notícias, federações esportivas, redes sociais e plataformas de vídeo. Esses links são disponibilizados apenas para conveniência do usuário. O Papo de Bola não controla o conteúdo desses sites e não se responsabiliza por suas práticas, políticas ou conteúdos."))),
      h3("8. Publicidade"),
      para(rich(t("O portal Papo de Bola pode exibir anúncios publicitários de terceiros, incluindo por meio do Google Ads. O Papo de Bola não se responsabiliza pelo conteúdo dos anúncios exibidos nem pelos produtos ou serviços anunciados. A relação entre o usuário e os anunciantes é de exclusiva responsabilidade das partes envolvidas."))),
      h3("9. Privacidade e Proteção de Dados"),
      para(
        rich(
          t("O tratamento de dados pessoais dos usuários é regido pela "),
          a("Política de Privacidade do Papo de Bola", "/politica-de-privacidade"),
          t(", em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018). Ao utilizar o portal, você concorda também com os termos da referida política.")
        )
      ),
      h3("10. Modificações nos Termos de Uso"),
      para(rich(t("O Papo de Bola reserva-se o direito de alterar estes Termos de Uso a qualquer momento, sem aviso prévio. As alterações entrarão em vigor a partir de sua publicação no portal. O uso continuado do portal após as alterações implica na aceitação dos novos termos. Recomendamos a leitura periódica deste documento."))),
      h3("11. Lei Aplicável e Foro"),
      para(rich(t("Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para a resolução de quaisquer controvérsias decorrentes do uso do portal, fica eleito o foro da Comarca do Estado de São Paulo, com exclusão de qualquer outro, por mais privilegiado que seja."))),
      h3("12. Contato"),
      para(
        rich(
          t("Para dúvidas, sugestões ou solicitações relacionadas a estes Termos de Uso, "),
          a("entre em contato com o Papo de Bola", "/contato"),
          t(" ou envie um e-mail para "),
          a("contato@papodebola.com.br", "mailto:contato@papodebola.com.br"),
          t(". Responderemos no prazo de até 15 (quinze) dias úteis.")
        )
      ),
      note("Última atualização: 18 de junho de 2026."),
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
