import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getArticles } from "@/lib/data/articles";
import { slugifyCategory, WP_CATEGORY_BY_SLUG } from "@/lib/config";
import { NewsListView } from "@/components/news/news-list-view";
import { ItemListSchema } from "@/components/seo/item-list-schema";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Notícias de Futebol",
  description:
    "Últimas notícias de futebol brasileiro e mundial. Brasileirão, Copa do Brasil, Libertadores, Champions League e mais.",
  alternates: { canonical: "/noticias" },
};

interface PageProps {
  searchParams: Promise<{ cat?: string; search?: string; page?: string }>;
}

export default async function NoticiasPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Redireciona o ?cat= legado pras URLs limpas (/noticias/brasileirao) — 308
  if (params.cat) {
    const slug = slugifyCategory(params.cat);
    if (WP_CATEGORY_BY_SLUG[slug]) {
      const qs = new URLSearchParams();
      if (params.search) qs.set("search", params.search);
      if (params.page && params.page !== "1") qs.set("page", params.page);
      const q = qs.toString();
      permanentRedirect(`/noticias/${slug}${q ? `?${q}` : ""}`);
    }
  }

  const search = params.search || undefined;
  const page = parseInt(params.page || "1");
  const perPage = 12;

  const { articles, total } = await getArticles({ page, perPage, search });

  return (
    <>
      <ItemListSchema
        items={articles.map((a) => ({ url: a.url, name: a.rewrittenTitle }))}
      />
      <NewsListView
        articles={articles}
        total={total}
        page={page}
        perPage={perPage}
        search={search}
      />
    </>
  );
}
