import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Trophy, MapPin, ChevronRight, Newspaper } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { getFirstDivision } from "@/lib/data/sisgel";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Esportes em Santana de Parnaíba",
  description:
    "Notícias e campeonatos esportivos de Santana de Parnaíba/SP: tabela da 1ª divisão do futebol municipal, jogos e resultados.",
  alternates: { canonical: "/sp/santana-de-parnaiba" },
};

const MUNICIPAL_HREF = "/sp/santana-de-parnaiba/municipal";

export default async function SantanaDeParnaibaPage() {
  const firstDiv = await getFirstDivision().catch(() => null);
  const standing = firstDiv?.groups?.[0]?.teams ?? [];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "São Paulo", href: "/sp" },
          { label: "Santana de Parnaíba" },
        ]}
      />

      <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-text-primary">
        <MapPin className="h-6 w-6 text-green" />
        Esportes em Santana de Parnaíba
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        Cobertura do esporte da cidade — campeonatos, jogos e resultados.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Conteúdo principal */}
        <div className="space-y-4">
          <Link
            href={MUNICIPAL_HREF}
            className="group flex items-center gap-4 rounded-lg border border-border-custom bg-card-bg p-5 transition-colors hover:border-green"
          >
            <Trophy className="h-10 w-10 shrink-0 text-green" />
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-text-primary group-hover:text-green">
                Campeonatos Municipais
              </h2>
              <p className="text-sm text-text-muted">
                Tabelas, rodadas e resultados das 5 competições municipais de Santana de Parnaíba.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-text-muted group-hover:text-green" />
          </Link>

          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border-custom bg-card-bg p-5 text-text-muted">
            <Newspaper className="h-6 w-6 shrink-0" />
            <p className="text-sm">
              Notícias dos esportes da cidade chegam em breve nesta página.
            </p>
          </div>
        </div>

        {/* Sidebar: tabela da 1ª divisão municipal */}
        <aside>
          <div className="rounded-lg border border-border-custom bg-card-bg">
            <div className="flex items-center justify-between border-b border-border-custom px-4 py-3">
              <h2 className="text-sm font-bold uppercase text-text-primary">
                Municipal · 1ª Divisão
              </h2>
              <Link href={MUNICIPAL_HREF} className="text-xs font-semibold text-green hover:text-green-hover">
                Ver tabela &rsaquo;
              </Link>
            </div>

            {standing.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">
                Classificação em breve.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-light text-text-muted">
                    <th className="px-3 py-2 text-left font-semibold">#</th>
                    <th className="px-2 py-2 text-left font-semibold">Time</th>
                    <th className="px-1 py-2 text-center font-semibold">P</th>
                    <th className="px-1 py-2 text-center font-semibold">J</th>
                  </tr>
                </thead>
                <tbody>
                  {standing.map((t) => (
                    <tr
                      key={`${t.pos}-${t.name}`}
                      className={`border-b border-border-light last:border-0 hover:bg-card-hover ${
                        t.pos <= 2 ? "border-l-2 border-l-green" : ""
                      }`}
                    >
                      <td className="px-3 py-2 font-semibold text-text-muted">{t.pos}</td>
                      <td className="px-2 py-2">
                        <Link href={MUNICIPAL_HREF} className="flex items-center gap-2 hover:text-green">
                          {t.badge ? (
                            <Image src={t.badge} alt="" width={18} height={18} className="rounded-full" unoptimized />
                          ) : (
                            <div className="h-[18px] w-[18px] rounded-full bg-body" />
                          )}
                          <span className="truncate font-semibold text-text-primary">{t.name}</span>
                        </Link>
                      </td>
                      <td className="px-1 py-2 text-center font-bold">{t.pts}</td>
                      <td className="px-1 py-2 text-center text-text-muted">{t.games}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {firstDiv?.updatedAt && (
            <p className="mt-2 px-1 text-[10px] text-text-muted">
              Atualizado: {new Date(firstDiv.updatedAt).toLocaleDateString("pt-BR")} · fonte SisGel
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
