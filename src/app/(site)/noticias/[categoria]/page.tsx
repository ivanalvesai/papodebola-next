import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticles } from "@/lib/data/articles";
import { WP_CATEGORY_BY_SLUG } from "@/lib/config";
import { NewsListView } from "@/components/news/news-list-view";
import { buildMetadata } from "@/lib/seo/build-metadata";

export const revalidate = 1800;
// Só os slugs conhecidos são válidos; qualquer outro vira 404 de verdade.
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
}

export function generateStaticParams() {
  return Object.keys(WP_CATEGORY_BY_SLUG).map((categoria) => ({ categoria }));
}

async function metadataDefaults({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const name = WP_CATEGORY_BY_SLUG[categoria];
  if (!name) return {};
  return {
    title: `${name}: notícias e últimas`,
    description: `Últimas notícias de ${name}: resultados, análises e bastidores no Papo de Bola.`,
    alternates: { canonical: `/noticias/${categoria}` },
  };
}

// SEO editável no /cms (Textos e SEO das páginas, rota "/noticias/:categoria") sobre os defaults acima.
export async function generateMetadata(
  props: Parameters<typeof metadataDefaults>[0]
): Promise<Metadata> {
  return buildMetadata("/noticias/:categoria", await metadataDefaults(props));
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { categoria } = await params;
  const name = WP_CATEGORY_BY_SLUG[categoria];
  if (!name) notFound();

  const sp = await searchParams;
  const search = sp.search || undefined;
  const page = parseInt(sp.page || "1");
  const perPage = 12;

  const { articles, total } = await getArticles({ page, perPage, category: name, search });

  return (
    <NewsListView
      articles={articles}
      total={total}
      page={page}
      perPage={perPage}
      activeSlug={categoria}
      categoryName={name}
      search={search}
    />
  );
}
