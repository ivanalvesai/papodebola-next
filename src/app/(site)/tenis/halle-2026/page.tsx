import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, MapPin, Layers } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { TennisDrawView } from "@/components/tennis/tennis-draw";
import { getTennisDraw, TENNIS_TOURNAMENTS } from "@/lib/data/tennis";
import { buildMetadata } from "@/lib/seo/build-metadata";

const T = TENNIS_TOURNAMENTS["halle-2026"];

// Torneio encerrado (jun/2026): 1 dia basta — era 60s, consultando a API por nada.
export const revalidate = 86400;

const isEmpty = (draw: Awaited<ReturnType<typeof getTennisDraw>>) =>
  !draw || draw.rounds.every((r) => r.matches.length === 0);

export async function generateMetadata(): Promise<Metadata> {
  // Sem chaveamento (API não serve mais o torneio): página sem conteúdo → noindex.
  const empty = isEmpty(await getTennisDraw("halle-2026").catch(() => null));
  return buildMetadata("/tenis/halle-2026", {
    ...(empty ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: "/tenis/halle-2026" },
    title: "ATP de Halle 2026: Chaveamento, Jogos e Resultados ao Vivo",
    description:
      "Acompanhe o ATP 500 de Halle 2026 (Terra Wortmann Open) ao vivo: chaveamento, jogos, placares set a set, resultados e horários. Grama, Alemanha.",
  });
}

export default async function HallePage() {
  const draw = await getTennisDraw("halle-2026");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Tênis", href: "/tenis" },
          { label: "ATP de Halle 2026" },
        ]}
      />

      <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-text-primary">
        <Trophy className="h-5 w-5 text-green" />
        {T.fullName}
      </h1>
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {T.city}
        </span>
        <span className="inline-flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> {T.category} · Piso: {T.surface}
        </span>
        <span>Horários de Brasília · placar set a set, ao vivo · use a seta para avançar as fases</span>
      </div>

      {isEmpty(draw) ? (
        <p className="py-10 text-center text-sm text-text-muted">
          O ATP de Halle 2026 foi disputado em junho.{" "}
          <Link href="/tenis" className="font-semibold text-green hover:text-green-hover">
            Veja as notícias e torneios de tênis
          </Link>
          .
        </p>
      ) : (
        <TennisDrawView initial={draw!} slug="halle-2026" />
      )}
    </div>
  );
}
