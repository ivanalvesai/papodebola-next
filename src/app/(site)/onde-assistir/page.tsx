import type { Metadata } from "next";
import { jsonLd } from "@/lib/json-ld";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { getWatchPosts, type WatchPost } from "@/lib/data/watch";
import { PageBlock } from "@/components/payload/page-blocks";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { FaqSchema } from "@/components/seo/faq-schema";
import { FeaturedCard } from "@/components/home/news-section";
import { WatchPostCard } from "@/components/onde-assistir/watch-post-card";
import { buildMetadata } from "@/lib/seo/build-metadata";

// HUB "Onde assistir": jogos de hoje com canal + cards dos posts de onde assistir por dia
// do jogo. Os posts moram em /onde-assistir/{slug}; aqui só os cards (sem duplicar texto).
// Textos opcionais no /cms → Páginas, slug "onde-assistir" (rota dedicada).
export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
const PATH = "/onde-assistir";
const DEFAULT_TITLE = "Onde assistir futebol hoje: jogos, horários e canais | Papo de Bola";
const DEFAULT_DESC =
  "Saiba onde assistir aos jogos de futebol de hoje: horários, canais de TV e streaming, prováveis escalações e o lance a lance ao vivo no Papo de Bola.";
const DEFAULT_H1 = "Onde assistir futebol hoje";
const DEFAULT_SUBTITLE =
  "Guias de cada partida com canal de TV e streaming, horário de Brasília, escalações prováveis, arbitragem e local do jogo.";

const FAQ = [
  {
    question: "Onde assistir aos jogos de futebol de hoje?",
    answer:
      "Cada guia desta página traz o canal de TV ou streaming que transmite a partida, o horário de Brasília, as escalações prováveis, a arbitragem e o local. Para ver todos os jogos do dia com placar em tempo real, acesse a página de jogos ao vivo.",
  },
  {
    question: "Os horários estão no horário de Brasília?",
    answer: "Sim. Todos os horários do Papo de Bola estão no horário de Brasília.",
  },
  {
    question: "Dá para acompanhar o jogo ao vivo pelo Papo de Bola?",
    answer:
      "Sim. Cada jogo tem uma página de lance a lance com placar em tempo real, estatísticas e escalações, atualizada durante a partida.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage("onde-assistir").catch(() => null);
  const title = page?.seo?.metaTitle || DEFAULT_TITLE;
  const description = page?.seo?.metaDescription || DEFAULT_DESC;
  return buildMetadata(PATH, {
    title: { absolute: title },
    description,
    alternates: { canonical: PATH },
    openGraph: { title, description, url: `${SITE_URL}${PATH}`, type: "website", siteName: "Papo de Bola", locale: "pt_BR" },
    twitter: { card: "summary_large_image", title, description },
  });
}

export default async function OndeAssistirHubPage() {
  const [page, posts] = await Promise.all([
    getPayloadPage("onde-assistir").catch(() => null),
    getWatchPosts({ limit: 80 }).catch(() => [] as WatchPost[]),
  ]);
  const h1 = page?.hero?.h1 || DEFAULT_H1;
  const subtitle = page?.hero?.subtitle || DEFAULT_SUBTITLE;
  const blocks = page?.layout || [];

  // Mais recentes primeiro (data de publicação): os 3 primeiros no destaque (igual à home),
  // o resto abaixo. Os jogos do dia ficam na /ao-vivo; aqui só os guias.
  const recent = [...posts].sort((x, y) => Date.parse(y.article.pubDate) - Date.parse(x.article.pubDate));
  const featured = recent.slice(0, 3);
  const older = recent.slice(3, 43);


  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Onde Assistir", item: `${SITE_URL}${PATH}` },
    ],
  };
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h1,
    description: DEFAULT_DESC,
    url: `${SITE_URL}${PATH}`,
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", name: "Papo de Bola", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${p.article.url}`,
        name: p.article.rewrittenTitle,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb className="mb-3" items={[{ label: "Início", href: "/" }, { label: "Onde Assistir" }]} />
      <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl">{h1}</h1>
      <p className="mb-8 mt-2 max-w-[760px] text-base text-text-secondary">{subtitle}</p>

      <div className="space-y-10">
        {featured.length > 0 && (
          <section className="rounded-lg border border-border-custom bg-card-bg p-6">
            <h2 className="mb-4 text-lg font-bold text-text-primary">Últimos guias: onde assistir, horário e escalações</h2>
            <div className="grid gap-3 lg:grid-cols-[2fr_1fr] lg:grid-rows-2">
              <FeaturedCard article={featured[0].article} big />
              {featured.slice(1).map((p) => (
                <FeaturedCard key={p.article.slug} article={p.article} />
              ))}
            </div>
          </section>
        )}

        {older.length > 0 && (
          <section>
            <h2 className="mb-3 border-b-2 border-green pb-2 text-lg font-bold text-text-primary">Guias anteriores</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {older.map((p) => (
                <WatchPostCard key={p.article.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {!posts.length && (
          <p className="rounded-lg border border-border-custom bg-card-bg p-6 text-center text-text-secondary">
            Nenhum guia publicado agora. Veja os{" "}
            <a href="/ao-vivo" className="font-semibold text-green">
              jogos ao vivo hoje
            </a>
            .
          </p>
        )}

        {blocks.length > 0 && (
          <div className="space-y-4 leading-relaxed text-text-secondary">
            {blocks.map((block: unknown, i: number) => (
              <PageBlock key={i} block={block} />
            ))}
          </div>
        )}

        <section>
          <h2 className="mb-3 border-b-2 border-green pb-2 text-lg font-bold text-text-primary">Perguntas frequentes</h2>
          <div className="space-y-2">
            {FAQ.map((f) => (
              <details key={f.question} className="rounded-lg border border-border-custom bg-card-bg px-4 py-3">
                <summary className="cursor-pointer text-base font-semibold text-text-primary">{f.question}</summary>
                <p className="mt-2 text-base text-text-secondary">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <FaqSchema items={FAQ} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionLd) }} />
    </div>
  );
}
