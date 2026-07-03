import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMunicipalMatch } from "@/lib/data/municipal";

// Ficha estática de um jogo municipal (SisGel): placar, gols e escalações. Sem tempo real.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMunicipalMatch(slug);
  if (!m) return {};
  const score = m.homeScore != null ? `${m.homeScore} x ${m.awayScore}` : "x";
  const title = `${m.home} ${score} ${m.away} — ${m.division} de Santana de Parnaíba`;
  const description = `Ficha do jogo ${m.home} x ${m.away} pelo ${m.division} de Santana de Parnaíba${
    m.venue ? `, no ${m.venue}` : ""
  }: placar, gols e escalações.`;
  return {
    title,
    description,
    alternates: { canonical: `/sp/santana-de-parnaiba/municipal/jogo/${slug}` },
  };
}

function Crest({ src, alt, size = 40 }: { src: string; alt: string; size?: number }) {
  return src ? (
    <Image src={src} alt={alt} width={size} height={size} className="rounded-full" unoptimized />
  ) : (
    <div className="rounded-full bg-body" style={{ width: size, height: size }} />
  );
}

function Cards({ p }: { p: { yellow: number; red: number } }) {
  return (
    <span className="ml-1 inline-flex gap-0.5 align-middle">
      {Array.from({ length: p.yellow }).map((_, i) => (
        <span key={`y${i}`} className="inline-block h-3 w-2 rounded-[1px] bg-yellow-400" title="Cartão amarelo" />
      ))}
      {Array.from({ length: p.red }).map((_, i) => (
        <span key={`r${i}`} className="inline-block h-3 w-2 rounded-[1px] bg-red-600" title="Cartão vermelho" />
      ))}
    </span>
  );
}

export default async function MunicipalMatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMunicipalMatch(slug);
  if (!m) notFound();

  const hasScore = m.homeScore !== null && m.awayScore !== null;
  const homeGoals = m.goals.filter((g) => g.isHome);
  const awayGoals = m.goals.filter((g) => !g.isHome);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-green">Início</Link>
        <span>/</span>
        <Link href="/sp/santana-de-parnaiba/municipal" className="hover:text-green">Municipal</Link>
        <span>/</span>
        <span className="text-text-secondary">{m.home} x {m.away}</span>
      </nav>

      {/* Placar */}
      <div className="rounded-lg border border-border-custom bg-card-bg p-6">
        <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-wide text-green">
          {m.division}
          {m.roundLabel ? ` · ${m.roundLabel}` : m.round ? ` · ${m.round}ª rodada` : ""}
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <Crest src={m.homeBadge} alt={m.home} size={56} />
            <span className="text-sm font-bold text-text-primary">{m.home}</span>
          </div>
          <div className="shrink-0 text-3xl font-extrabold text-text-primary tabular-nums">
            {hasScore ? `${m.homeScore} - ${m.awayScore}` : "x"}
          </div>
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <Crest src={m.awayBadge} alt={m.away} size={56} />
            <span className="text-sm font-bold text-text-primary">{m.away}</span>
          </div>
        </div>
        <div className="mt-4 space-y-0.5 text-center text-xs text-text-muted">
          {m.date && <div className="font-semibold">{m.date}{m.time ? ` · ${m.time}` : ""}</div>}
          {m.venue && <div>{m.venue}</div>}
          {m.referee && <div>Arbitragem: {m.referee}</div>}
        </div>
      </div>

      {/* Gols */}
      {m.goals.length > 0 && (
        <div className="mt-6 rounded-lg border border-border-custom bg-card-bg">
          <h2 className="border-b border-border-custom px-4 py-3 text-sm font-bold uppercase text-green">Gols</h2>
          <div className="grid grid-cols-2 gap-4 p-4 text-sm">
            <ul className="space-y-1.5">
              {homeGoals.map((g, i) => (
                <li key={i} className="flex items-center gap-2 text-text-primary">
                  <span>⚽</span>
                  <span className="capitalize">{g.player.toLowerCase()}</span>
                  {g.goals > 1 && <span className="text-text-muted">({g.goals})</span>}
                </li>
              ))}
              {homeGoals.length === 0 && <li className="text-text-muted">—</li>}
            </ul>
            <ul className="space-y-1.5 text-right">
              {awayGoals.map((g, i) => (
                <li key={i} className="flex items-center justify-end gap-2 text-text-primary">
                  {g.goals > 1 && <span className="text-text-muted">({g.goals})</span>}
                  <span className="capitalize">{g.player.toLowerCase()}</span>
                  <span>⚽</span>
                </li>
              ))}
              {awayGoals.length === 0 && <li className="text-text-muted">—</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Escalações */}
      {(m.lineups.home.length > 0 || m.lineups.away.length > 0) && (
        <div className="mt-6 rounded-lg border border-border-custom bg-card-bg">
          <h2 className="border-b border-border-custom px-4 py-3 text-sm font-bold uppercase text-green">
            Escalações
          </h2>
          <div className="grid grid-cols-2 gap-4 p-4 text-sm">
            <div>
              <div className="mb-2 flex items-center gap-2 font-bold text-text-primary">
                <Crest src={m.homeBadge} alt={m.home} size={20} />
                {m.home}
              </div>
              <ul className="space-y-1 text-text-secondary">
                {m.lineups.home.map((p, i) => (
                  <li key={i} className="capitalize">{p.name.toLowerCase()}<Cards p={p} /></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 font-bold text-text-primary">
                <Crest src={m.awayBadge} alt={m.away} size={20} />
                {m.away}
              </div>
              <ul className="space-y-1 text-text-secondary">
                {m.lineups.away.map((p, i) => (
                  <li key={i} className="capitalize">{p.name.toLowerCase()}<Cards p={p} /></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/sp/santana-de-parnaiba/municipal" className="text-sm font-semibold text-green hover:underline">
          ← Voltar aos campeonatos municipais
        </Link>
      </div>
    </div>
  );
}
