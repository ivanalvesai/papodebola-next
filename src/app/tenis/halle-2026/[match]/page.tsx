import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { TennisMatchView } from "@/components/tennis/tennis-match";
import { getTennisMatchDetail, TENNIS_TOURNAMENTS } from "@/lib/data/tennis";

const SLUG = "halle-2026" as const;
const T = TENNIS_TOURNAMENTS[SLUG];

// 30s: placar/estatística ao vivo (o cliente também faz polling).
export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ match: string }>;
}): Promise<Metadata> {
  const { match } = await params;
  const detail = await getTennisMatchDetail(SLUG, match);
  if (!detail) return { title: "Jogo não encontrado" };
  const { home, away } = detail.match;
  const title = `${home.name} x ${away.name} — ${T.name} 2026 ao vivo`;
  return {
    alternates: { canonical: `/tenis/${SLUG}/${match}` },
    title,
    description: `${home.name} x ${away.name} pelo ${T.fullName} (${detail.roundLabel}): placar ao vivo set a set, estatísticas e resultado.`,
  };
}

export default async function HalleMatchPage({
  params,
}: {
  params: Promise<{ match: string }>;
}) {
  const { match } = await params;
  const detail = await getTennisMatchDetail(SLUG, match);
  if (!detail) notFound();

  const { home, away } = detail.match;

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Tênis", href: "/tenis" },
          { label: T.name, href: `/tenis/${SLUG}` },
          { label: `${home.shortName} x ${away.shortName}` },
        ]}
      />

      <h1 className="mb-1 text-xl font-bold text-text-primary">
        {home.name} <span className="text-text-muted">x</span> {away.name}
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        {detail.roundLabel} · {T.fullName}
      </p>

      <TennisMatchView initial={detail} tournamentSlug={SLUG} />
    </div>
  );
}
