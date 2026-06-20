import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { TennisMatchView } from "@/components/tennis/tennis-match";
import { TennisEventSchema } from "@/components/seo/tennis-event-schema";
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
  const { home, away, status, setsHome, setsAway, winner } = detail.match;
  const url = `/tenis/${SLUG}/${match}`;

  let title: string;
  let description: string;
  if (status === "finished") {
    const venc = winner === 1 ? home.name : winner === 2 ? away.name : null;
    const perd = winner === 1 ? away.name : winner === 2 ? home.name : null;
    // placar na perspectiva do vencedor (ex: "2 sets a 0")
    const wSets = winner === 1 ? setsHome : setsAway;
    const lSets = winner === 1 ? setsAway : setsHome;
    const placar = wSets != null && lSets != null ? ` por ${wSets} sets a ${lSets}` : "";
    title = `${home.name} x ${away.name}: resultado e estatísticas — ${T.name} 2026`;
    description =
      venc && perd
        ? `${venc} venceu ${perd}${placar} pelo ${T.fullName} (${detail.roundLabel}). Veja o placar set a set, as estatísticas e o resultado do jogo.`
        : `Resultado de ${home.name} x ${away.name} pelo ${T.fullName} (${detail.roundLabel}): placar set a set e estatísticas.`;
  } else if (status === "inprogress") {
    title = `${home.name} x ${away.name} AO VIVO — ${T.name} 2026`;
    description = `${home.name} x ${away.name} AO VIVO pelo ${T.fullName} (${detail.roundLabel}): placar em tempo real set a set, games e estatísticas.`;
  } else {
    title = `${home.name} x ${away.name}: horário e onde assistir — ${T.name} 2026`;
    description = `${home.name} x ${away.name} pelo ${T.fullName} (${detail.roundLabel}): que horas é o jogo (horário de Brasília), onde assistir, retrospecto e estatísticas ao vivo.`;
  }

  return { alternates: { canonical: url }, title, description };
}

export default async function HalleMatchPage({
  params,
}: {
  params: Promise<{ match: string }>;
}) {
  const { match } = await params;
  const detail = await getTennisMatchDetail(SLUG, match);
  if (!detail) notFound();

  const { home, away, venue, timestamp, status } = detail.match;
  const url = `/tenis/${SLUG}/${match}`;

  const dataHora = timestamp
    ? new Date(timestamp * 1000).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        weekday: "long",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const local = venue
    ? [venue.stadium, venue.city, venue.country].filter(Boolean).join(", ")
    : T.city;

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8">
      <TennisEventSchema
        home={home.name}
        away={away.name}
        homeId={home.id}
        awayId={away.id}
        startTimestamp={timestamp}
        statusType={status}
        venue={venue}
        tournamentName={T.fullName}
        url={url}
      />

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
      <p className="mb-4 text-sm text-text-muted">
        {detail.roundLabel} · {T.fullName}
      </p>

      {/* Ficha do jogo (SEO: data/local/piso no HTML) */}
      <div className="mb-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
        {dataHora && (
          <span>
            <span className="font-semibold text-text-primary">Data:</span>{" "}
            <span className="capitalize">{dataHora}</span> (Brasília)
          </span>
        )}
        {local && (
          <span>
            <span className="font-semibold text-text-primary">Local:</span> {local}
          </span>
        )}
        <span>
          <span className="font-semibold text-text-primary">Piso:</span> {T.surface}
        </span>
      </div>

      <TennisMatchView initial={detail} tournamentSlug={SLUG} />
    </div>
  );
}
