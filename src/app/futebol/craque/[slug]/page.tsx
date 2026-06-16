import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { QuickAnswer } from "@/components/seo/quick-answer";
import { CRAQUES, getCraque } from "@/lib/data/craques";

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export function generateStaticParams() {
  return Object.keys(CRAQUES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCraque(slug);
  if (!c) return {};
  return {
    title: `${c.nome}: biografia, carreira e história`,
    description: c.resumo.slice(0, 155),
    alternates: { canonical: `/futebol/craque/${slug}` },
  };
}

export default async function CraquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCraque(slug);
  if (!c) notFound();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.nome,
    ...(c.apelido ? { alternateName: c.apelido } : {}),
    jobTitle: "Futebolista",
    nationality: c.nacionalidade,
    ...(c.birthDate ? { birthDate: c.birthDate } : {}),
    ...(c.deathDate ? { deathDate: c.deathDate } : {}),
    description: c.resumo,
    url: `${SITE_URL}/futebol/craque/${slug}`,
  };

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: c.nome },
        ]}
      />

      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-text-primary">
        <Trophy className="h-6 w-6 text-green" />
        {c.nome}
      </h1>
      <p className="mb-5 text-sm text-text-muted">
        {c.apelido ? `"${c.apelido}" · ` : ""}
        {c.posicao} · {c.nacionalidade}
      </p>

      <div className="mb-6">
        <QuickAnswer>{c.resumo}</QuickAnswer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
        {/* Conteúdo */}
        <article className="space-y-6">
          {c.secoes.map((s) => (
            <section key={s.titulo}>
              <h2 className="mb-2 text-lg font-bold text-text-primary">{s.titulo}</h2>
              {s.paragrafos.map((p, i) => (
                <p key={i} className="mb-3 text-[15px] leading-relaxed text-text-secondary">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>

        {/* Dados rápidos */}
        <aside>
          <div className="rounded-lg border border-border-custom bg-card-bg p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">
              Ficha
            </h2>
            <dl className="space-y-2 text-sm">
              {c.dadosRapidos.map((d) => (
                <div key={d.label}>
                  <dt className="text-[11px] uppercase text-text-muted">{d.label}</dt>
                  <dd className="font-semibold text-text-primary">{d.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
