import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { getAuthorBySlug, getAuthorSlugs } from "@/lib/data/authors";
import { getArticlesByAuthorId } from "@/lib/data/articles-payload";

// Página do autor: lê do Payload (collection `authors`). Autor novo no /cms = no ar.
// ISR 5min + revalidate na hora ao editar (hook afterChange da collection).
export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  const title = author.seo.metaTitle || `${author.name}${author.role ? ` — ${author.role}` : ""} | Papo de Bola`;
  const description =
    author.seo.metaDescription ||
    `Artigos e perfil de ${author.name}${author.role ? `, ${author.role}` : ""} no Papo de Bola.`;
  return {
    title,
    description,
    alternates: { canonical: `/autor/${slug}` },
  };
}

export default async function AutorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const posts = await getArticlesByAuthorId(author.id, 12).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

  const social = author.social || {};
  const socialLinks = [
    social.twitter && { label: "Twitter / X", href: social.twitter },
    social.instagram && { label: "Instagram", href: social.instagram },
    social.linkedin && { label: "LinkedIn", href: social.linkedin },
    social.email && { label: "E-mail", href: `mailto:${social.email}` },
  ].filter(Boolean) as { label: string; href: string }[];

  // Schema Person (E-E-A-T): quem assina os artigos.
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    ...(author.role && { jobTitle: author.role }),
    url: `${siteUrl}/autor/${author.slug}`,
    ...(author.photo && { image: author.photo }),
    worksFor: { "@type": "Organization", name: "Papo de Bola", "@id": `${siteUrl}/#org` },
    ...(socialLinks.length && { sameAs: socialLinks.filter((s) => !s.href.startsWith("mailto:")).map((s) => s.href) }),
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <PageBreadcrumb
        className="mb-5"
        items={[
          { label: "Início", href: "/" },
          { label: "Autores", href: "/sobre" },
          { label: author.name },
        ]}
      />

      {/* Cabeçalho do autor */}
      <header className="flex flex-col items-start gap-5 border-b border-border-custom pb-8 sm:flex-row sm:items-center">
        {author.photo ? (
          <Image
            src={author.photo}
            alt={author.name}
            width={112}
            height={112}
            unoptimized
            className="h-28 w-28 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-green/10 text-3xl font-bold text-green">
            {author.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">{author.name}</h1>
          {author.role && <p className="mt-1 text-sm font-semibold text-green">{author.role}</p>}
          {socialLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer me"
                  className="font-semibold text-text-secondary hover:text-green hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Bio */}
      {author.bioHtml && (
        <>
          <section
            className="author-bio mt-8"
            dangerouslySetInnerHTML={{ __html: author.bioHtml }}
          />
          <style>{`
            .author-bio p { font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 16px; }
            .author-bio p:last-child { margin-bottom: 0; }
            .author-bio a { color: #00965E; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
            .author-bio strong { font-weight: 700; color: #1A1D23; }
            .author-bio ul, .author-bio ol { margin: 0 0 16px; padding-left: 22px; }
            .author-bio ul { list-style: disc; }
            .author-bio ol { list-style: decimal; }
            .author-bio li { margin-bottom: 6px; color: #333; }
          `}</style>
        </>
      )}

      {/* Artigos do autor */}
      <section className="mt-10 border-t border-border-custom pt-8">
        <h2 className="mb-5 text-lg font-bold text-text-primary">
          Últimos artigos de {author.name}
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-text-muted">
            Ainda não há artigos publicados por {author.name}.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={p.url}
                className="group block overflow-hidden rounded-lg border border-border-custom bg-surface transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.rewrittenTitle}
                    width={400}
                    height={150}
                    unoptimized
                    className="h-[150px] w-full object-cover"
                  />
                )}
                <div className="p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-green">
                    {p.category}
                  </div>
                  <div className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-green">
                    {p.rewrittenTitle}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Não pré-gera (autores são poucos e dinâmicos); ISR cobre. Mantém a lista pro caso
// de querermos pré-render no futuro.
export async function generateStaticParams() {
  const slugs = await getAuthorSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}
